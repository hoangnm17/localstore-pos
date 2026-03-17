const shiftService = require("../services/shift.service");

module.exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await shiftService.getAllShifts();
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách ca làm việc thành công",
      data: shifts
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + err.message
    });
  }
};

module.exports.getShiftById = async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await shiftService.getShiftById(id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ca làm việc!"
      });
    }

    return res.status(200).json({
      success: true,
      data: shift
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + err.message
    });
  }
};

module.exports.createShift = async (req, res) => {
  try {
    const { name, startTime, endTime, checkInStart, checkInEnd, checkOutDeadline } = req.body;

    const newId = await shiftService.createShift({
      name, startTime, endTime, checkInStart, checkInEnd, checkOutDeadline
    });

    return res.status(201).json({
      success: true,
      message: "Tạo ca làm việc thành công!",
      data: { id: newId, name, startTime, endTime, checkInStart, checkInEnd, checkOutDeadline }
    });
  } catch (err) {
    console.error(err);

    if (
      err.message.includes("tồn tại") ||
      err.message.includes("trùng") ||
      err.message.includes("giới hạn") ||
      err.message.includes("deadline") ||
      err.message.includes("Giờ") ||
      err.message.includes("kết ca") ||
      err.message.includes("logout")
    ) {
      return res.status(400).json({ success: false, message: err.message });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + err.message
    });
  }
};

module.exports.updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startTime, endTime, checkInStart, checkInEnd, checkOutDeadline } = req.body;

    await shiftService.updateShift(id, {
      name, startTime, endTime, checkInStart, checkInEnd, checkOutDeadline
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật ca làm việc thành công!"
    });
  } catch (err) {
    console.error(err);

    if (err.message.includes("Không tìm thấy")) {
      return res.status(404).json({ success: false, message: err.message });
    }

    if (
      err.message.includes("tồn tại") ||
      err.message.includes("trùng") ||
      err.message.includes("giới hạn") ||
      err.message.includes("deadline") ||
      err.message.includes("Giờ") ||
      err.message.includes("kết ca") ||
      err.message.includes("logout") ||
      err.message.includes("ngừng sử dụng")
    ) {
      return res.status(400).json({ success: false, message: err.message });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + err.message
    });
  }
};

module.exports.toggleShift = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await shiftService.toggleShift(id);

    const statusLabel = result.newActive === 1 ? "kích hoạt" : "ngừng sử dụng";
    return res.status(200).json({
      success: true,
      message: `Đã ${statusLabel} ca làm việc thành công!`,
      data: { isActive: result.newActive }
    });
  } catch (err) {
    console.error(err);

    if (err.message.includes("Không tìm thấy")) {
      return res.status(404).json({ success: false, message: err.message });
    }

    if (err.message.includes("lịch phân công")) {
      return res.status(400).json({ success: false, message: err.message });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + err.message
    });
  }
};
