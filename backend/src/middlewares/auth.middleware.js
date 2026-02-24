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

    const authorizeFeature = (requiredFeature) => {
    return (req, res, next) => {
        const currentUser = req.user; 

        if (!currentUser || !currentUser.features) {
            return res.status(403).json({
                success: false,
                message: "Lỗi hệ thống: Không xác định được quyền hạn của bạn!"
            });
        }

        if (!currentUser.features.includes(requiredFeature)) {
            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối! Bạn không có quyền thực hiện chức năng này."
            });
        }

        next(); 
    };
};

// const authorizeRoles = (allowedRoles) => {
//     return (req, res, next) => {
//         const currentUser = req.user; // Lấy từ verifyToken

//         if (!currentUser || !currentUser.role) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Lỗi hệ thống: Không tìm thấy thông tin chức vụ!"
//             });
//         }

//         if (!allowedRoles.includes(currentUser.role)) {
//             return res.status(403).json({
//                 success: false,
//                 message: `Bạn không được phép thực hiện thao tác này!`
//             });
//         }

//         next(); 
//     };
// };
module.exports = { verifyToken, authorizeFeature };