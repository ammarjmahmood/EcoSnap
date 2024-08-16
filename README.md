# EcoSnap

## Purpose

EcoSnap is a personal assistant application designed to empower users to make environmentally conscious decisions. By leveraging emerging technologies such as Ray-Ban Meta smart glasses, smart devices, and OpenAI’s APIs, our application analyzes and determines the best course of action for consumers to reduce their carbon footprint. This involves suggesting sustainable alternatives in what they eat, buy, and consume. EcoSnap integrates real-time insights and actionable recommendations into everyday activities to foster sustainable habits, reduce individual carbon footprints, and promote a broader culture of environmental awareness and responsibility.

## Inspiration

Our inspiration for this project stemmed from a desire to explore how we can lead more sustainable lifestyles without sacrificing convenience or time. Recognizing the importance of making environmentally conscious choices, we developed a tool that seamlessly integrates sustainability into daily decisions. By focusing on real-time insights and recommendations, we aim to simplify the process of choosing sustainable options that benefit both individuals and the environment. Utilizing emerging technologies, such as artificial intelligence and OpenAI's powerful language models, we analyze data to deliver personalized suggestions. Our goal is to empower users to embrace sustainability as a natural and convenient part of their everyday lives.

## What it does

**Eco-Friendly Shopping Companion:**
- **Barcode/QR Code Scanning:** Utilizes the smart glasses' camera to identify products and retrieve sustainability ratings.
- **Sustainability Ratings:** Provides real-time information about the environmental impact of products and suggests eco-friendly alternatives.
- **Brand Transparency:** Offers detailed brand profiles and user reviews focusing on sustainability practices.

**Eco-Friendly Food Companion:**
- **Food Item Analysis:** Scans and evaluates food items for their environmental impact, offering sustainability ratings.
- **Alternative Suggestions:** Recommends eco-friendly food alternatives tailored to dietary preferences.
- **Educational Insights:** Provides information on food miles, seasonal produce, and recipes with sustainable ingredients.

**Eco-Friendly Waste Reduction Guide/Companion:**
- **Location-Based Recycling Guidance:** Offers recycling and waste disposal instructions tailored to the user's location.
- **Waste Reduction Tips:** Provides tips and reminders for reducing waste and suggests reusable alternatives.
- **Recycling Center Information:** Connects users with local recycling centers and eco-friendly initiatives.

**Restaurant Companion:**
- **Sustainable Restaurant Recommendations:** Suggests restaurants with sustainable practices and provides menu item analyses.
- **Environmental Impact Scores:** Rates menu items based on their environmental impact, emphasizing plant-based options.
- **Food Miles and Seasonal Produce:** Educates users about ingredient sourcing and promotes locally-sourced, seasonal dishes.

**Sustainability Ratings and Leaderboard:**
- **Daily Sustainability Score:** Calculates scores based on users' eco-friendly actions and decisions throughout the day.
- **Leaderboards and Challenges:** Encourages friendly competition through weekly or monthly leaderboards and eco challenges.

## How we built it

We used OpenAI API, Node.js, JavaScript, HTML, CSS, Machine Learning, Prompt Engineering, Bun, and Python to develop EcoSnap.

## Challenges we ran into

Working with Meta Smart glasses presented a unique challenge due to the lack of an SDK, necessitating the creation of a workaround. We tackled this by setting up a web server and implementing an API, which we then trained using a database. Initially, we experimented with different approaches, such as using Bun and a bookmarking web scraper. However, these solutions proved too unpredictable and inconsistent, leading us to refine our strategy for more reliable results.

## What we learned

During our project, we gained valuable insights into API integration, JavaScript, and Next.js, as well as the intricacies of both frontend and backend development. We discovered that documentation can be challenging, as it's often written for a specific programming language, requiring us to adapt it to our needs. This experience taught us the importance of creative problem-solving when faced with obstacles.

## What we learned and could have done better

In hindsight, we realized that conducting more thorough research or choosing tools we were more familiar with could have streamlined our development process. Familiarity with the technologies used would have allowed us to anticipate potential challenges and navigate them more effectively. Additionally, reviewing documentation in advance would have provided us with a clearer understanding of the functionalities and limitations of the tools at our disposal, enabling us to make more informed decisions. This preparation could have saved us time and effort, allowing us to focus on innovation and problem-solving rather than troubleshooting unforeseen issues. Ultimately, this experience underscored the importance of preparation and knowledge when working with new technologies.

## Installation

To set up the EcoSnap application on your local machine, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/terrahacks-dragons/EcoSnap.git
   cd EcoSnap
   ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set Up Environment Variables:**
Create a .env file in the root directory and add the following environment variables:
    ```plaintext
    OPENAI_API_KEY=your_openai_api_key
    ```

4. **Install dependencies:**
Start the server using the following command:
    ```bash
    npm start
    ```

## Explanation of `server.js`

The `server.js` file serves as the backend server for the EcoSnap application, built using Express.js. It is responsible for handling HTTP requests, managing file uploads, and interacting with the OpenAI API for image analysis.

Key Features:
- **File Handling:** The server is configured to handle file uploads using Multer. Uploaded images are stored in the `uploads` directory, processed, and then moved to the `processed` directory.
- **API Integration:** The `/analyze` endpoint receives an uploaded image, converts it to a base64 format, and sends it to the OpenAI API for analysis. The response from the API is then parsed, and relevant information about the food item (such as calories, sustainability score, and alternatives) is extracted.
- **Static File Serving:** The server serves static files, including HTML, CSS, and JavaScript, from the `public` directory. It also serves the processed JSON files generated by the API.
- **Directory Management:** The server ensures that necessary directories (`uploads`, `processed`, `public`) exist and creates them if they are missing.
- **JSON Storage:** Analysis results are saved in JSON format, both as individual files in the `processed` directory and in an `entries.json` file for aggregation.

The server listens on port 3000 and provides a seamless interaction between the frontend and backend components of the application.

## Explanation of `app.js`

The `app.js` file is the main JavaScript code that runs on the client-side (in the browser). It is responsible for managing the user interface and interacting with the server.

Key Features:
- **Camera and Image Handling:** The file includes logic to access the device's camera, capture images, and preview them. Users can upload images directly or capture them using the camera.
- **Image Processing:** After an image is uploaded or captured, it is sent to the server for analysis via the `/analyze` endpoint. The server's response is then used to update the UI with information about the food item's sustainability, nutritional content, and alternatives.
- **Dynamic UI Updates:** The UI elements such as sustainability score, item description, and nutritional details are dynamically updated based on the data received from the server. Users can reset the interface to capture new images or flip the camera between front and back.
- **Error Handling:** The file includes error handling for camera access, file uploads, and server responses, ensuring a smooth user experience even when issues arise.

This script is essential for the interactive functionality of the EcoSnap application, enabling users to engage with the tool in real-time.

## What's next for EcoSnap

- **Recycling Center Information** (Future)
- **Waste Reduction Tips** (Future)
- **Location-Based Recycling Guidance** (Future)
