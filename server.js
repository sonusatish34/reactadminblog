const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Initialize the S3 client for DigitalOcean Spaces
const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint('https://blr1.digitaloceanspaces.com'),  // Use just the region endpoint
  accessKeyId: 'DO00EMW9VPKGYFANMCYQ',  // Replace with your DigitalOcean Spaces Access Key ID
  secretAccessKey: 'y+1iUnpYYwGZM0mq4O+vQEEWaNffAkKLKNQY9Y48IXQ',  // Replace with your DigitalOcean Spaces Secret Access Key
  region: 'blr1'  // Replace with your DigitalOcean Space region, e.g., nyc3, sgp1, etc.
});

// Upload file to DigitalOcean Space
const uploadFileToSpace = (filePath) => {
  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const params = {
    Bucket: 'ldcars',  // Correct Space name
    Key: `ldcars_nextjs_images/blog_images/${fileName}`,  // Save in '_nextjs_images/blog_images' folder
    Body: fileContent,
    ContentType: 'image/jpeg',  // Replace with the appropriate MIME type of the file
    ACL: 'public-read'  // You can change this depending on whether you want the file to be publicly accessible
  };

  // Upload file to DigitalOcean Space
  s3.upload(params, (err, data) => {
    if (err) {
        console.log('Error uploading file:', err);
    } else {
      console.log('File uploaded successfully:', data.Location);  // Get the URL of the uploaded file
    }
  });
};

// Run the upload function with the path to your image
const filePath = './public/logo192.png';  // Replace with the path to your local image
uploadFileToSpace(filePath);
