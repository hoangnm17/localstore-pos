const reportModel = require("../../models/problematic.model.js");
const staffModel = require("../../models/staff.model.js");

exports.createReport = async (data, user) => {

    if (!user.permissions.includes("CREATE_PROBLEMATIC")) {
    throw new Error("PERMISSION_DENIED");
}

    if (!data.title || data.title.trim() === "") {
        throw new Error("TITLE_REQUIRED");
    }

    if (!data.issueDescription || data.issueDescription.trim() === "") {
        throw new Error("DESCRIPTION_REQUIRED");
    }

    const staff = await staffModel.getStaffByUserId(user.id);

    if (!staff) {
        throw new Error("STAFF_NOT_FOUND");
    }

    return await reportModel.create({
        title: data.title.trim(),
        issueDescription: data.issueDescription.trim(),
        reportedBy: staff.id
    });
};

exports.getReports = async ({ userId, roleId, filters }) => {

    const isManager = roleId === 1; 

    return reportModel.getReports({
        userId,
        isManager,
        filters
    });
};

exports.updateStatus = async ({ reportId, status, roleId, updatedBy }) => {

    // 🔥 Chỉ manager được update
    if (roleId !== 1) {
        throw new Error("PERMISSION_DENIED");
    }

    // 🔥 Chỉ cho 2 trạng thái
    const validStatus = ["OPEN", "PROCESSED"];

    if (!validStatus.includes(status)) {
        throw new Error("INVALID_STATUS");
    }

    // 🔥 Lấy report hiện tại
    const existingReport = await reportModel.getById(reportId);

    if (!existingReport) {
        throw new Error("REPORT_NOT_FOUND");
    }

    // 🔥 Không cho update nếu đã processed
    if (existingReport.status === "PROCESSED") {
        throw new Error("REPORT_ALREADY_PROCESSED");
    }

    return reportModel.updateStatus({
        reportId,
        status,
        updatedBy
    });
};