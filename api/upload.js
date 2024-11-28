// // /api/uploadei.js

// const AWS = require('aws-sdk');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');
// const cors = require('cors');

// const s3 = new AWS.S3({
//     endpoint: new AWS.Endpoint('https://blr1.digitaloceanspaces.com'),  // Your DigitalOcean Space endpoint
//     accessKeyId: 'DO00EMW9VPKGYFANMCYQ',  // Your DigitalOcean Spaces Access Key ID
//     secretAccessKey: 'y+1iUnpYYwGZM0mq4O+vQEEWaNffAkKLKNQY9Y48IXQ',  // Your DigitalOcean Spaces Secret Access Key
//     region: 'blr1',  // Your DigitalOcean Space region
//   });
// // Set up multer for file handling
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// module.exports = (req, res) => {
//   if (req.method === 'POST') {
//     upload.single('coverimages')(req, res, (err) => {
//       if (err) {
//         return res.status(500).json({ success: false, error: err.message });
//       }

//       if (!req.file) {
//         return res.status(400).json({ success: false, error: 'No file uploaded' });
//       }

//       const fileContent = req.file.buffer;
//       const fileName = `${Date.now()}_${req.file.originalname}`;

//       const params = {
//         Bucket: 'ldcars',
//         Key: `ldcars_nextjs_images/blog_images/${fileName}`,
//         Body: fileContent,
//         ContentType: req.file.mimetype,
//         ACL: 'public-read',
//       };

//       s3.upload(params, (err, data) => {
//         if (err) {
//           return res.status(500).json({ success: false, error: 'Error uploading file' });
//         }

//         return res.json({
//           success: true,
//           imageUrl: data?.Location
//         });
//       });
//     });
//   } else {
//     res.status(405).json({ success: false, error: 'Method Not Allowed' });
//   }
// };

const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint('https://blr1.digitaloceanspaces.com'),  // DigitalOcean Space endpoint
  accessKeyId: 'DO00EMW9VPKGYFANMCYQ',  // Access Key ID
  secretAccessKey: 'y+1iUnpYYwGZM0mq4O+vQEEWaNffAkKLKNQY9Y48IXQ',  // Secret Access Key
  region: 'blr1',  // Region
});

// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (req, res) => {
  console.log('Request method:', req.method);  // Log method type
  if (req.method === 'POST') {
    console.log('Attempting to upload file...');
    
    // Log incoming request to see if file is being sent
    upload.single('coverimages')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      console.log('File uploaded:', req.file);

      const fileContent = req.file.buffer;
      const fileName = `${Date.now()}_${req.file.originalname}`;

      const params = {
        Bucket: 'ldcars',
        Key: `ldcars_nextjs_images/blog_images/${fileName}`,
        Body: fileContent,
        ContentType: req.file.mimetype,
        ACL: 'public-read',
      };

      s3.upload(params, (err, data) => {
        if (err) {
          console.error('Error uploading file:', err);
          return res.status(500).json({ success: false, error: 'Error uploading file' });
        }

        console.log('File uploaded successfully:', data);
        return res.json({
          success: true,
          imageUrl: data?.Location
        });
      });
    });
  } else {
    console.log('Method Not Allowed');
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
};
