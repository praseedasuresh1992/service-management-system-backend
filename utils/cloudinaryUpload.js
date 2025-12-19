const cloudinary = require("../config/cloudinary");

const uploadFromBuffer = (buffer, options) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      options,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    ).end(buffer);
  });
};

module.exports = uploadFromBuffer;
