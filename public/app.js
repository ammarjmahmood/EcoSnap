document.addEventListener("DOMContentLoaded", () => {
    // Video and image elements
    const video = document.getElementById("video"); // Video stream element
    const uploadedImage = document.getElementById("uploaded-image"); // Image element to display uploaded or captured image
    const uploadInput = document.getElementById("upload-input"); // File input for uploading images
    const captureBtn = document.getElementById("capture-btn"); // Button to capture a photo from the video stream
    const resetBtn = document.getElementById("reset-btn"); // Button to reset the app to the video stream
    const flipBtn = document.getElementById("flip-btn"); // Button to switch between front and rear camera

    // Optional elements for displaying analysis results
    const sustainabilityScore = document.getElementById("sustainability-score"); // Display for sustainability score
    const mostSustainableItem = document.getElementById("most-sustainable-item"); // Display for the most sustainable item name
    const itemCalories = document.getElementById("item-calories"); // Display for item calories
    const descriptionElement = document.getElementById("description"); // Display for item description
    const sustainableAlternatives = document.getElementById("sustainable-alternatives"); // Display for sustainable alternatives
    const scoreReason = document.getElementById("score-reason"); // Display for score reason
   
    // Additional elements for displaying nutritional information
    const fatContent = document.getElementById("fat-content"); // Display for fat content
    const proteinContent = document.getElementById("protein-content"); // Display for protein content
    const sugarContent = document.getElementById("sugar-content"); // Display for sugar content

    let currentStream; // Holds the current video stream
    let useFrontCamera = true; // Flag to toggle between front and rear camera

    // Function to start the camera with the selected camera (front or rear)
    async function startCamera() {
        try {
            // Stop any active streams before starting a new one
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }

            // Set up camera constraints for front or rear camera
            const constraints = {
                video: {
                    facingMode: useFrontCamera ? 'user' : { exact: 'environment' }
                }
            };

            // Get the video stream from the camera
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            currentStream = stream; // Save the stream
            video.srcObject = stream; // Set the video element source to the stream
            video.classList.add("active"); // Add active class to show the video element
        } catch (error) {
            console.error('Error accessing the camera: ', error);
            alert('Error accessing the camera: ' + error.message);
        }
    }

    // Event listener for image uploads
    uploadInput.addEventListener("change", function (event) {
        const file = event.target.files[0]; // Get the selected file
        if (!file) {
            console.log('No file selected.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImage.src = e.target.result; // Display the uploaded image
            uploadedImage.style.display = 'block';
            video.classList.remove("active"); // Hide the video element
            uploadedImage.classList.add("active"); // Show the uploaded image element
        };

        reader.onerror = function () {
            if (sustainabilityScore) {
                sustainabilityScore.textContent = 'Error loading image preview.'; // Error message for loading the image
            }
        };

        reader.readAsDataURL(file); // Read the image file as a data URL

        // After the image preview, send the file for analysis
        processImage(file);
    });

    // Event listener for capturing a photo from the video stream
    captureBtn.addEventListener("click", () => {
        if (!currentStream) return;

        // Create a canvas to capture the current frame from the video
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas content to a blob and send it for analysis
        canvas.toBlob(blob => {
            const dataUrl = canvas.toDataURL("image/jpeg");
            uploadedImage.src = dataUrl; // Display the captured image
            uploadedImage.classList.add("active"); // Show the uploaded image element
            video.classList.remove("active"); // Hide the video element

            processImage(blob); // Process the captured image
        }, "image/jpeg");
    });

    // Event listener to reset the app to the initial state
    resetBtn.addEventListener("click", () => {
        if (uploadedImage) {
            uploadedImage.classList.remove("active"); // Hide the uploaded image
        }
        if (video) {
            video.classList.add("active"); // Show the video stream
        }
        if (uploadInput) {
            uploadInput.value = ''; // Clear the file input value
        }
        if (sustainabilityScore) {
            sustainabilityScore.textContent = '?/5'; // Reset sustainability score
        }
        if (mostSustainableItem) {
            mostSustainableItem.textContent = 'SAMPLE TEXT'; // Reset item name
        }
        if (itemCalories) {
            itemCalories.textContent = 'SAMPLE TEXT'; // Reset item calories
        }
        if (descriptionElement) {
            descriptionElement.textContent = 'No description available.'; // Reset description
        }
        if (sustainableAlternatives) {
            sustainableAlternatives.textContent = 'No alternatives available.'; // Reset alternatives
        }
        if (fatContent) {
            fatContent.textContent = 'No fat content available.'; // Reset fat content
        }
        if (proteinContent) {
            proteinContent.textContent = 'No protein content available.'; // Reset protein content
        }
        if (sugarContent) {
            sugarContent.textContent = 'No sugar content available.'; // Reset sugar content
        }
        if (scoreReason) {
            scoreReason.textContent = 'No score reason available.'; // Reset score reason content
        }
    });

    // Event listener to flip the camera (front/rear)
    flipBtn.addEventListener("click", () => {
        useFrontCamera = !useFrontCamera; // Toggle the camera
        startCamera(); // Restart the camera with the new setting
    });

    // Function to process the image by sending it to the server for analysis
    async function processImage(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile); // Append the image file to the form data

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData // Send the form data to the server
            });

            if (!response.ok) {
                throw new Error('Failed to analyze image'); // Handle any errors
            }

            const data = await response.json();
            console.log('Received Data:', data); // Log the received data for debugging

            if (data.error) {
                alert(data.error); // Alert if there's an error
                return;
            }

            // Fetch the JSON file with the analysis results and update the HTML
            const jsonFileName = data.jsonFileName; // Get JSON file name from server response
            const jsonResponse = await fetch(`/processed/${jsonFileName}`);

            if (!jsonResponse.ok) {
                // Log the issue if fetching the JSON data fails
                console.error('Error fetching JSON data:', await jsonResponse.text());
                return; // Exit the function if fetching JSON fails
            }

            const jsonData = await jsonResponse.json();

            // Extract content data from the JSON response
            const { content } = jsonData;

            // Destructure content data for easier access
            const { item_name, calories, score, description, fat, protein, sugar, sustainable_alternatives,score_reason } = content;

            // Update the HTML elements with the parsed data
            if (mostSustainableItem) {
                mostSustainableItem.textContent = `Most Sustainable Item on menu: ${item_name || 'N/A'} `; // Update item name
            }
            if (itemCalories) {
                itemCalories.textContent = `${calories || 'N/A'} calories`; // Update item calories
            }
            if (sustainabilityScore) {
                sustainabilityScore.textContent = score ? `${score}/5` : '3/5'; // Update sustainability score
            }
            if (descriptionElement) {
                descriptionElement.textContent = ` ${description || 'No description available.'} `; // Update description
            }
            if (sustainableAlternatives) {
                sustainableAlternatives.textContent = ` ${sustainable_alternatives ? sustainable_alternatives.join(', ') : 'No alternatives available.'} `; // Update alternatives
            }
            if (fatContent) {
                fatContent.textContent = ` ${fat || 'N/A'} grams`; // Update fat content
            }
            if (proteinContent) {
                proteinContent.textContent = `${protein || 'N/A'} grams`; // Update protein content
            }
            if (sugarContent) {
                sugarContent.textContent = `${sugar || 'N/A'} grams`; // Update sugar content
            }
            if (scoreReason) {
                scoreReason.textContent = `${score_reason || 'N/A'}`; // Update sugar content
            }

        } catch (error) {
            // Log any critical errors encountered during processing
            console.error('Error processing image:', error);
            // alert('Failed to process image'); // Optionally alert the user
        }
    }

    startCamera(); // Start the camera on page load
});
