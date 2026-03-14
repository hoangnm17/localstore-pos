const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');

router.post('/image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Không có file được upload.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
});

module.exports = router;