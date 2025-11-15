const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/multipart-test', upload.single('image'), (req, res) => {
  console.log('DEBUG multipart-test body:', req.body);
  console.log('DEBUG multipart-test file:', req.file);
  res.json({ body: req.body, file: !!req.file });
});

module.exports = router;
