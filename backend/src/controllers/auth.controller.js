const authService = require('../services/auth.service');

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login(email, password);

        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công! Chào mừng bạn quay lại.",
            data: result 
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message 
        });
    }
};
module.exports.logout = async (req, res) => {
    try {
        
        return res.status(200).json({
            success: true,
            message: "Đăng xuất thành công trên hệ thống."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi Server khi đăng xuất!"
        });
    }
};