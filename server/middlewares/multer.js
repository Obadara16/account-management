const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/'); // specify the destination folder for uploaded files
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // specify the file name for uploaded files
    }
  });
  
  const upload = multer({ storage: storage });

module.exports = upload;
