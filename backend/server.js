const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
// app.use(cors());
// Initialize the Express app
const app = express();
const port = 5000;
app.use(cors());
// Initialize the S3 client for DigitalOcean Spaces
const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint('https://blr1.digitaloceanspaces.com'),  // Your DigitalOcean Space endpoint
  accessKeyId: 'DO00EMW9VPKGYFANMCYQ',  // Your DigitalOcean Spaces Access Key ID
  secretAccessKey: 'y+1iUnpYYwGZM0mq4O+vQEEWaNffAkKLKNQY9Y48IXQ',  // Your DigitalOcean Spaces Secret Access Key
  region: 'blr1',  // Your DigitalOcean Space region
});

// Set up multer for file handling
const storage = multer.memoryStorage();  // Store file in memory (alternative: use diskStorage for saving to local disk)
const upload = multer({ storage });

// POST route to handle image upload



app.post('/uploadei', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const fileContent = req.file.buffer;  // File is in memory (buffer)
  const fileName = `${Date.now()}_${req.file.originalname}`;  // Generate a unique file name

  const params = {
    Bucket: 'ldcars',  // Your Space name
    Key: `ldcars_nextjs_images/blog_images/${fileName}`,  // Path where the file will be stored
    Body: fileContent,
    ContentType: req.file.mimetype,  // Mime type of the uploaded file
    ACL: 'public-read',  // Make file publicly accessible
  };

  // Upload file to DigitalOcean Space
  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ success: false, error: 'Error uploading file' });
    }

    // Respond with the URL of the uploaded image
    return res.json({
      success: true,
      imageUrl: data.Location?.replace('https://ldcars.blr1.', 'https://ldcars.blr1.cdn.'),  // URL of the uploaded file
    });
  });
});
app.post('/upload', upload.single('coverimages'), (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded');
    }
  
    const params = {
      Bucket: 'ldcars',  // Your DigitalOcean Space name
      Key: `ldcars_nextjs_images/blog_images/${file.originalname}`,  // Adjust the folder structure if needed
      Body: file.buffer,  // Upload the file buffer
      ContentType: file.mimetype,  // Automatically detects the MIME type
      ACL: 'public-read',  // Make the file public
    };
  
    // Upload the file to DigitalOcean Spaces
    s3.upload(params, (err, data) => {
      if (err) {
        return res.status(500).send('Error uploading file: ' + err);
      }
      // Send the file URL as a response
      res.status(200).send({ fileUrl: data.Location });
    });
  });

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
