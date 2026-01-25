const userRoutes = require("./user.route")

module.exports = (app) => {
    const version = "/api"

    app.use(version + "/users", userRoutes)
}