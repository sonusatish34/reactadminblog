const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');

const cors = require('cors');
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

app.post('/uploadei', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const blogfor = req.body.blogfor;
  const fileContent = req.file.buffer;  // File is in memory (buffer)
  // const fileName = `${Date.now()}_${req.file.originalname}`;  // Generate a unique file name
  const fileName = req.file.originalname.replaceAll(' ', '_');

  const timestamp = new Date().getTime();
  console.log(blogfor, "blof gor cosnoel");

  const params = {
    Bucket: 'ldcars',  // Your Space name
    Key: `ldcars_nextjs_images/blog_images/${blogfor}/${timestamp}-${fileName}`,  // Adjust the folder structure if needed.
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
      imageUrl: data.Location?.replace('https://ldcars.blr1.', 'https://ldcars.blr1.cdn.'),
      //       blogfor:blogfor,
    });
  });
});
app.post('/upload', upload.single('coverimages'), (req, res) => {
  const file = req.file;
  const blogfor = req.body.blogfor;
  if (!file) {
    return res.status(400).send('No file uploaded');
  }
  const timestamp = new Date().getTime();
  const params = {
    Bucket: 'ldcars',  // Your DigitalOcean Space name
    Key: `ldcars_nextjs_images/blog_images/${blogfor}/${timestamp}-${file.originalname}`,  // Adjust the folder structure if needed
    Body: file.buffer,  // Upload the file buffer
    ContentType: file.mimetype,  // Automati/cally detects the MIME type
    ACL: 'public-read',  // Make the file public
  };

  // Upload the file to DigitalOcean Spaces
  s3.upload(params, (err, data) => {
    if (err) {
      return res.status(500).send('Error uploading file: ' + err);
    }
    // Send the file URL as a response
    res.status(200).send({
      imageUrl: data.Location?.replace('https://ldcars.blr1.', 'https://ldcars.blr1.cdn.'),

    });
  });
});

app.post('/uploadmul', upload.array('coverimagesmul', 10), async (req, res) => {
  const files = req.files;
  const blogfor = req.body.blogfor || 'default';

  if (!files || files.length === 0) {
    return res.status(400).send('No files uploaded');
  }

  const timestamp = Date.now();

  try {
    const uploadResults = await Promise.all(
      files.map((file, index) => {
        const key = `ldcars_nextjs_images/trips/${timestamp}-${index}-${file.originalname}`;
        const params = {
          Bucket: 'ldcars',
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        };

        return s3.upload(params).promise();
      })
    );

    const imageUrls = uploadResults.map(result =>
      result.Location.replace('https://ldcars.blr1.', 'https://ldcars.blr1.cdn.')
    );

    return res.status(200).json({ success: true, imageUrls });
  } catch (err) {
    console.error('Error uploading files:', err);
    return res.status(500).send('Error uploading files');
  }
});


app.get('/list-images', (req, res) => {
  // Define the parameters for listing the objects in the space
  const params = {
    Bucket: 'ldcars',  // Your Space name
    Prefix: 'ldcars_nextjs_images/trips/',  // Optional: Adjust the folder path if needed
  };

  // Use the S3 client to list the objects
  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error('Error listing objects:', err);
      return res.status(500).json({ success: false, error: 'Error listing objects' });
    }

    // Extract the image URLs from the response
    const imageUrls = data;

    // Return the list of image URLs
    res.json({
      success: true,
      images: imageUrls,
    });
  });
});

app.delete('/deleteimage', (req, res) => {

  const params = {
    Bucket: 'ldcars',  // Your Space name
    Key: 'ldcars_nextjs_images/trips/1750686141095-2-Alto_9_11zon-transformed.webp',  // The object key (file path) to delete
  };

  // Delete the file from DigitalOcean Space
  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).json({ success: false, error: 'Error deleting file' });
    }

    // Respond with success message
    return res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
















