// /api/uploadei.js

const AWS = require('aws-sdk');
const multer = require('multer');
;

const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('https://blr1.digitaloceanspaces.com'),  // Your DigitalOcean Space endpoint
    accessKeyId: 'DO00EMW9VPKGYFANMCYQ',  // Your DigitalOcean Spaces Access Key ID
    secretAccessKey: 'y+1iUnpYYwGZM0mq4O+vQEEWaNffAkKLKNQY9Y48IXQ',  // Your DigitalOcean Spaces Secret Access Key
    region: 'blr1',  // Your DigitalOcean Space region
  });
// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (req, res) => {
  if (req.method === 'POST') {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
      console.log('Request Body:', req.body); 

      const fileContent = req.file.buffer;
      const fileName = req.file.originalname;
      const blogfor = req.blogfor;
      const timestamp = new Date().getTime();
      console.log(blogfor,"in server,js");
       // Ensure blogfor is here

      const params = {
        Bucket: 'ldcars',
        // Key: `ldcars_nextjs_images/blog_images/${fileName}`,
        Key: `ldcars_nextjs_images/blog_images/${blogfor}/${timestamp}-${fileName}`,  // Adjust the folder structure if needed
        Body: fileContent,
        ContentType: req.file.mimetype,
        ACL: 'public-read',
      };

      s3.upload(params, (err, data) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Error uploading file' });
        }

        return res.json({
          success: true,
          imageUrl: data.Location?.replace('https://ldcars.blr1.', 'https://ldcars.blr1.cdn.'),
          blogfor:blogfor,
        });
      });
    });
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
};
