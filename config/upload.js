const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
