const reportModel = require("../../models/poReport.model.js");

const getMonthlyReport = async ({
    month,
    year,
    supplierId
}) => {

    if (month < 1 || month > 12) {
        throw new Error("INVALID_MONTH");
    }

    return await reportModel.getMonthlyReport({
        month,
        year,
        supplierId
    });
};

module.exports = {
    getMonthlyReport
};