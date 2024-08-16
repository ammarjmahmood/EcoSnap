import express from 'express';
import fetch from 'node-fetch';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Initialize dotenv to load environment variables from .env file
dotenv.config();

// Construct __dirname using import.meta.url for module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Ensure the uploads, processed, and public directories exist
// These directories are used to store uploaded images, processed data, and public assets respectively
const uploadsDir = path.join(__dirname, 'uploads');
const processedDir = path.join(__dirname, 'processed');
const publicDir = path.join(__dirname, 'public');
const entriesFilePath = path.join(__dirname, 'entries.json');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Create processed directory if it doesn't exist
if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir);
}

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Create entries.json if it doesn't exist, which stores all processed content data
if (!fs.existsSync(entriesFilePath)) {
    fs.writeFileSync(entriesFilePath, JSON.stringify([]));
}

// Configure Multer for handling file uploads
// Files are stored in the uploads directory with a unique name to avoid collisions
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

const upload = multer({ storage: storage });

// Serve static files from the "public" directory (e.g., HTML, CSS, JS files)
app.use(express.static(publicDir));

// Serve static files from the "processed" directory (e.g., processed image files)
app.use('/processed', express.static(processedDir));

// Parse JSON bodies with a limit of 50MB
app.use(express.json({ limit: '50mb' }));

// Serve the main index.html file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Serve specific HTML files at their respective URLs
app.get('/menu-companion', (req, res) => {
    res.sendFile(path.join(publicDir, 'Menu-Companion.html'));
});

app.get('/food-companion', (req, res) => {
    res.sendFile(path.join(publicDir, 'Food-Companion.html'));
});

app.get('/shopping-companion', (req, res) => {
    res.sendFile(path.join(publicDir, 'Shopping-Companion.html'));
});

// Serve the main CSS file for the app
app.use('/index.css', express.static(path.join(publicDir, 'index.css')));

// API endpoint for analyzing images uploaded by users
// This endpoint handles image upload, calls the OpenAI API for analysis, and stores the results
app.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        // Check if an image was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        console.log('File uploaded:', req.file);

        // Read the uploaded image and convert it to a base64 string
        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        // Prepare the API request headers and payload
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        };

        const payload = {
            model: 'gpt-4o-mini', // Use the specific model
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Please analyze the following image and provide the information in the strict JSON format below. ' +
                                'Fill in each field with the data you can extract from the image. ' +
                                'Always give values for every category. Do not write unknown for any category.' +
                                'Put the name of the image file when uploaded where it says path name.' +
                                'The format should be as follows:' +
                                '\n\n' +
                                '{\n' +
                                '  "content": {\n' +
                                '    "item_name": "",\n' +
                                '    "calories": "",\n' +
                                '    "score": "",\n' +
                                '    "description": "",\n' +
                                '    "sugar": "",\n' +
                                '    "protein": "",\n' +
                                '    "fat": "",\n' +
                                '    "sustainable_alternatives": []\n' +
                                '    "path_name": ""\n' +
                                '  }\n' +
                                '}\n\n' +
                                'Please include the item name, estimated calories, sustainability score out of 5, a brief description of the food item or plate of food, sugar (g), protein (g), fat (g), and a list of 5 sustainable alternatives. ' +
                                'If the item is not food, you can leave all fields as empty strings or empty array.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300
        };

        // Send the image analysis request to the OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        // Check for any errors in the API response
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        // Parse the response from the API
        const data = await response.json();
        console.log('Full API Response:', JSON.stringify(data, null, 2));

        // Extract and clean the JSON content from the API response
        const messageContent = data.choices[0].message.content;

        // Handle cases where the API determines the image is not of food
        if (messageContent.includes('not food')) {
            return res.json({ error: 'Not recognized as food' });
        }

        const cleanedContent = messageContent.replace(/```json\n|\n```/g, '');
        let parsedContent;

        try {
            parsedContent = JSON.parse(cleanedContent);
        } catch (error) {
            console.error('Error parsing JSON content:', error);
            return res.status(500).json({ error: 'Failed to parse JSON content' });
        }

        const { content } = parsedContent;

        // Prepare the final content object, ensuring default values are provided
        const finalContent = {
            item_name: content.item_name || 'Unknown',
            calories: content.calories || 'N/A',
            score: content.score || 'N/A',
            description: content.description || 'No description available.',
            sugar: content.sugar || 'N/A',
            protein: content.protein || 'N/A',
            fat: content.fat || 'N/A',
            sustainable_alternatives: content.sustainable_alternatives || [],
            path_name: req.file.filename || 'N/A'
        };

        // Move the uploaded image to the processed directory
        const newImagePath = path.join(processedDir, req.file.filename);
        fs.rename(imagePath, newImagePath, (err) => {
            if (err) {
                console.error('Error moving file:', err);
                return res.status(500).json({ error: 'Failed to move processed image' });
            }
        });

        // Save the processed content as a JSON file in the processed directory
        const jsonFilename = `${path.basename(newImagePath, path.extname(newImagePath))}-content.json`;
        const jsonFilePath = path.join(processedDir, jsonFilename);

        fs.writeFile(jsonFilePath, JSON.stringify({ content: finalContent }, null, 2), (err) => {
            if (err) {
                console.error('Error writing JSON file:', err);
                return res.status(500).json({ error: 'Failed to save JSON response' });
            }

            // Update the entries.json file with the new content data
            fs.readFile(entriesFilePath, (err, data) => {
                if (err) {
                    console.error('Error reading entries file:', err);
                    return res.status(500).json({ error: 'Failed to update entries' });
                }

                const entries = JSON.parse(data);
                entries.push(finalContent);
                fs.writeFile(entriesFilePath, JSON.stringify(entries, null, 2), (err) => {
                    if (err) {
                        console.error('Error writing to entries file:', err);
                        return res.status(500).json({ error: 'Failed to update entries file' });
                    }

                    console.log(`Content saved to ${jsonFilePath} and updated in entries.json`);
                    res.json({ jsonFileName: jsonFilename });
                });
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
