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
    const { name, startTime, endTime } = req.body;
    
    const newId = await shiftService.createShift({ name, startTime, endTime });

    return res.status(201).json({
      success: true,
      message: "Tạo ca làm việc thành công!",
      data: { id: newId, name, startTime, endTime }
    });
  } catch (err) {
    console.error(err);
    
    // Xử lý các lỗi từ service
    if (err.message.includes("tồn tại") || err.message.includes("trùng")) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
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
    const { name, startTime, endTime } = req.body;

    await shiftService.updateShift(id, { name, startTime, endTime });

    return res.status(200).json({
      success: true,
      message: "Cập nhật ca làm việc thành công!"
    });
  } catch (err) {
    console.error(err);
    
    if (err.message.includes("Không tìm thấy")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.message.includes("tồn tại") || err.message.includes("trùng")) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + err.message
    });
  }
};

module.exports.deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    await shiftService.deleteShift(id);

    return res.status(200).json({
      success: true,
      message: "Xóa ca làm việc thành công!"
    });
  } catch (err) {
    console.error(err);
    
    if (err.message.includes("Không tìm thấy")) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.message.includes("đã được phân công")) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống: " + err.message
    });
  }
};