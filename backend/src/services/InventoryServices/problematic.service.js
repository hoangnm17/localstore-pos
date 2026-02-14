const reportModel = require("../../models/problematic.model.js");

const CREATE_REPORT_ROLES = ["warehouse_staff", "manager"];

exports.createReport = async (data, user) => {
    if (!CREATE_REPORT_ROLES.includes(user.role)) {
        throw new Error("PERMISSION_DENIED");
    }

    return reportModel.create({
        title: data.title,
        issueDescription: data.issueDescription,
        reportedBy: user.staffId
    });
};

exports.getReports = async ({ userId, role, filters }) => {

    const isManager = role === "manager";

    return reportModel.getReports({
        userId,
        isManager,
        filters
    });
};