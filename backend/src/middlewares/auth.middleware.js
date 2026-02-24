const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const roleModel = require('../models/role.model');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Truy cập bị từ chối! Vui lòng đăng nhập."
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Người dùng không tồn tại!"
            });
        }

        const permissions = await roleModel.getPermissionsByRoleId(user.roleId);


        req.user = {
            id: user.id,
            roleId: user.roleId,
            permissions: permissions.map(p => p.code) 
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn!"
        });
    }
};

module.exports = { verifyToken };