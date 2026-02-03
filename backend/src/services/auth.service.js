const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.login = async (email, password) => {
    const user = await userModel.findByEmail(email);
    
    if (!user) {
        throw new Error("Tài khoản này không tồn tại!");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
        throw new Error("Mật khẩu nhập sai. Vui lòng thử lại!");
    }

    const token = jwt.sign(
        { 
            userId: user.id, 
            roleId: user.roleId,
            email: user.username 
        }, 
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN 
        } 
    );

    const { passwordHash, ...userInfo } = user;

    return { token, user: userInfo };
};