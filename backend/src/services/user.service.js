const userModel = require("../models/user.model")

module.exports.getAllUser = async () => {
    return await userModel.getAllUser();
}