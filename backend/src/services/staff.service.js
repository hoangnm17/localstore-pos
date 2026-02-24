const staffModel = require("../models/staff.model");

module.exports.getStaffList = async () => {
    return await staffModel.getAllStaff();
};

module.exports.toggleActive = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    return await staffModel.updateStatus(userId, newStatus);
};