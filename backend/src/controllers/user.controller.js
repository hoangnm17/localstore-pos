const userService = require("../services/user.service")

module.exports.getAllUser = async (req, res) => {
    try {
        const users = await userService.getAllUser()

        return res.status(200).json({
            success: true,
            data: users
        })
    } catch (err) {
        console.log("getAllUser controller error", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}