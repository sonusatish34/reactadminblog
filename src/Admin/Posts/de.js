const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint('https://blr1.digitaloceanspaces.com'),
  accessKeyId: 'DO00EMW9VPKGYFANMCYQ',
  secretAccessKey: 'y+1iUnpYYwGZM0mq4O+vQEEWaNffAkKLKNQY9Y48IXQ',
  region: 'blr1',
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Accept multiple images
app.post('/upload', upload.array('coverimages', 10), async (req, res) => {
  const files = req.files;
  const blogfor = req.body.blogfor || 'default';

  if (!files || files.length === 0) {
    return res.status(400).send('No files uploaded');
  }

  const timestamp = Date.now();

  try {
    const uploadResults = await Promise.all(
      files.map((file, index) => {
        const key = `ldcars_nextjs_images/blog_images/${blogfor}/${timestamp}-${index}-${file.originalname}`;
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

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
