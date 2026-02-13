const { connectDB, sql } = require("../config/database")

const getPermissionsByRoleId = async (roleId) => {
    try {
        const pool = await connectDB;
        const permissions = pool.request()
            .query(`SELECT f.featureKey
                FROM RoleFeatures rf
                JOIN Features f ON rf.roleId = f.id
                WHERE rf.roleId = ?`)
        return permissions.recordset
    } catch (err) {
        console.error("get Permission error:", err)
        throw err
    }
}

module.exports = {
    getPermissionsByRoleId
}