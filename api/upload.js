const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint('https://blr1.digitaloceanspaces.com'),
  accessKeyId: 'DO00EMW9VPKGYFANMCYQ',
  secretAccessKey: 'y+1iUnpYYwGZM0mq4O+vQEEWaNffAkKLKNQY9Y48IXQ',
  region: 'blr1',
});
// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (req, res) => {
  if (req.method === 'POST' || req.method === 'GET') {
    upload.single('coverimages')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const fileContent = req.file.buffer;
      const fileName = req.file.originalname.replaceAll(' ', '_');
      const blogfor = req.body.blogfor;
      const timestamp = new Date().getTime();

      const params = {
        Bucket: 'ldcars',
        Key: `ldcars_nextjs_images/blog_images/${blogfor ? `${blogfor}-` : ''}${timestamp}-${fileName}`,  // Adjust the folder 
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
          imageUrl: data?.Location?.replace('https://ldcars.blr1.', 'https://ldcars.blr1.cdn.')
        });
      });
    });
  } else {
    console.log('Method Not Allowed');
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
};
