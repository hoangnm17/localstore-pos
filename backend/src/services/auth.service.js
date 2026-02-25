const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.login = async (email, password) => {
    const user = await userModel.findByEmail(email);
<<<<<<< HEAD
    console.log('Login attempt for email:', email, 'User found:', !!user);
=======
>>>>>>> dev

    if (!user) {
        throw new Error("Tài khoản này không tồn tại!");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
<<<<<<< HEAD
    console.log('Password match:', isMatch);
=======
>>>>>>> dev

    if (!isMatch) {
        throw new Error("Mật khẩu nhập sai. Vui lòng thử lại!");
    }

    const features = user.featureList ? user.featureList.split(',') : [];

    const token = jwt.sign(
<<<<<<< HEAD
        {
            userId: user.id
        },
=======
        { 
            userId: user.id 
        }, 
>>>>>>> dev
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { passwordHash, featureList, ...userInfo } = user;

    userInfo.features = features;

    return { token, user: userInfo };
};