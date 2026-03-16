const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
console.log('Upload dir:', uploadDir);
console.log('Upload dir exists:', fs.existsSync(uploadDir));
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    allowed.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)'));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });