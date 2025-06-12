const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

//disk storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../CSVFiles/");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, function (err, name) {
      const fn = name.toString("hex") + path.extname(file.originalname);
      req.filename = fn;
      cb(null, fn);
    });
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".csv") {
    return cb(new Error("Only CSV files are allowed"), false);
  }
  cb(null, true);
};

//export upload varaible
const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;
