const shiftModel = require("../models/shift.model");

// Helper: chuyển "HH:MM" → số phút từ 00:00
const toMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

module.exports.getAllShifts = async () => {
  return await shiftModel.getAllShifts();
};

module.exports.getShiftById = async (id) => {
  return await shiftModel.getShiftById(id);
};

module.exports.createShift = async (data) => {
  if (!data.name || !data.startTime || !data.endTime) {
    throw new Error("Vui lòng nhập đầy đủ thông tin ca làm việc!");
  }

  const dup = await shiftModel.checkDuplicateName(data.name);
  if (dup) throw new Error("Tên ca làm việc đã tồn tại!");

  const conflict = await shiftModel.checkTimeConflict(data.startTime, data.endTime);
  if (conflict.length > 0) {
    throw new Error(
      `Thời gian trùng với ca "${conflict[0].name}" (${conflict[0].startTime}–${conflict[0].endTime})`
    );
  }

  if (data.checkInStart || data.checkInEnd) {
    if (!data.checkInStart || !data.checkInEnd) {
      throw new Error("Phải nhập cả giờ bắt đầu và deadline giới hạn chấm công!");
    }

    const startMins = toMinutes(data.startTime);
    const endMins = toMinutes(data.endTime);
    const checkInStartM = toMinutes(data.checkInStart);
    const checkInEndM = toMinutes(data.checkInEnd);

    if (checkInStartM >= checkInEndM) {
      throw new Error("Giờ bắt đầu giới hạn chấm công phải trước deadline!");
    }
    if (checkInStartM < startMins - 30) {
      throw new Error("Giờ bắt đầu nhận chấm công không được sớm hơn giờ bắt đầu ca quá 30 phút!");
    }
    if (checkInEndM > endMins + 30) {
      throw new Error("Deadline chấm công không được muộn hơn giờ kết thúc ca quá 30 phút!");
    }
  }

  if (data.checkOutDeadline) {
    const endMins           = toMinutes(data.endTime);
    const checkOutDeadlineM = toMinutes(data.checkOutDeadline);
    if (checkOutDeadlineM <= toMinutes(data.startTime)) {
      throw new Error("Thời gian kết ca phải sau giờ bắt đầu ca!");
    }
    if (checkOutDeadlineM > endMins + 30) {
      throw new Error("Thời gian kết ca không được trễ hơn giờ kết thúc ca quá 30 phút!");
    }
  }

  return await shiftModel.createShift(data);
};

module.exports.updateShift = async (id, data) => {
  const existing = await shiftModel.getShiftById(id);
  if (!existing) throw new Error("Không tìm thấy ca làm việc!");
  if (!existing.isActive) throw new Error("Không thể chỉnh sửa ca đã ngừng sử dụng!");

  const dup = await shiftModel.checkDuplicateName(data.name, id);
  if (dup) throw new Error("Tên ca làm việc đã tồn tại!");

  const conflict = await shiftModel.checkTimeConflict(data.startTime, data.endTime, id);
  if (conflict.length > 0) {
    throw new Error(
      `Thời gian trùng với ca "${conflict[0].name}" (${conflict[0].startTime}–${conflict[0].endTime})`
    );
  }

  if (data.checkInStart || data.checkInEnd) {
    if (!data.checkInStart || !data.checkInEnd) {
      throw new Error("Phải nhập cả giờ bắt đầu và deadline giới hạn chấm công!");
    }

    const startMins = toMinutes(data.startTime);
    const endMins = toMinutes(data.endTime);
    const checkInStartM = toMinutes(data.checkInStart);
    const checkInEndM = toMinutes(data.checkInEnd);

    if (checkInStartM >= checkInEndM) {
      throw new Error("Giờ bắt đầu giới hạn chấm công phải trước deadline!");
    }
    if (checkInStartM < startMins - 30) {
      throw new Error("Giờ bắt đầu nhận chấm công không được sớm hơn giờ bắt đầu ca quá 30 phút!");
    }
    if (checkInEndM > endMins + 30) {
      throw new Error("Deadline chấm công không được muộn hơn giờ kết thúc ca quá 30 phút!");
    }
  }

  if (data.checkOutDeadline) {
    const endMins           = toMinutes(data.endTime);
    const checkOutDeadlineM = toMinutes(data.checkOutDeadline);
    if (checkOutDeadlineM <= toMinutes(data.startTime)) {
      throw new Error("Thời gian kết ca phải sau giờ bắt đầu ca!");
    }
    if (checkOutDeadlineM > endMins + 30) {
      throw new Error("Thời gian kết ca không được trễ hơn giờ kết thúc ca quá 30 phút!");
    }
  }

  return await shiftModel.updateShift(id, data);
};

module.exports.toggleShift = async (id) => {
  const existing = await shiftModel.getShiftById(id);
  if (!existing) throw new Error("Không tìm thấy ca làm việc!");
  return await shiftModel.toggleShift(id);
};
