const { connectDB, sql } = require("../config/database")

const getPermissionsByRoleId = async (roleId) => {
    try {
        const pool = await connectDB();
        const permissions = await pool.request()
        .input('roleId', sql.Int, roleId)
            .query(`SELECT f.featureKey
                FROM RoleFeatures rf
                JOIN Features f ON rf.roleId = f.id
                WHERE rf.roleId = @roleId`)
        return permissions.recordset
    } catch (err) {
        console.error("get Permission error:", err)
        throw err
    }
}

module.exports = {
    getPermissionsByRoleId
}