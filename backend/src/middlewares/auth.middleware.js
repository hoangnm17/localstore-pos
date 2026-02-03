const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {

    const authHeader = req.header('Authorization');
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Truy cập bị từ chối! Vui lòng đăng nhập." 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; 

        next(); 
    } catch (error) {
        console.log(error);
        return res.status(403).json({ 
            success: false, 
            message: "Token không hợp lệ hoặc đã hết hạn!" 
        });
    }
};

module.exports = { verifyToken };