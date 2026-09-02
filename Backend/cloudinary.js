// Cloudinary setup — used to store uploaded photos (design references,
// gallery work photos) somewhere permanent, since Render's own disk
// gets wiped on restarts/redeploys.

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads a file buffer (from multer's memory storage) to Cloudinary
// and resolves with the secure (https) URL of the uploaded image.
function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

module.exports = { cloudinary, uploadBufferToCloudinary };
