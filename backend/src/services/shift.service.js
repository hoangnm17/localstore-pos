const shiftModel = require("../models/shift.model");
// Helper
const toMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// HELPER MỚI: Tính khoảng cách phút 
const getDiff = (m1, m2) => {
  let d = m1 - m2;
  if (d < -720) d += 1440;
  if (d > 720) d -= 1440;
  return d;
};

module.exports.getAllShifts = async () => { 
  return await shiftModel.getAllShifts(); };
module.exports.getShiftById = async (id) => {
   return await shiftModel.getShiftById(id); };

module.exports.updateShift = async (id, data) => {
  const existing = await shiftModel.getShiftById(id);
  if (!existing) 
    throw new Error("Không tìm thấy ca làm việc!");

  const startMins = toMinutes(existing.startTime);
  const endMins = toMinutes(existing.endTime);

  if (data.checkInStart || data.checkInEnd) {
    if (!data.checkInStart || !data.checkInEnd) {
      throw new Error("Phải nhập cả giờ bắt đầu và hạn chót chấm công!");
    }
    const checkInStartM = toMinutes(data.checkInStart);
    const checkInEndM = toMinutes(data.checkInEnd);

    if (getDiff(checkInEndM, checkInStartM) <= 0) {
      throw new Error("Hạn chót chấm công phải sau giờ bắt đầu nhận chấm công!");
    }
    if (getDiff(checkInStartM, startMins) < -30) {
      throw new Error("Giờ bắt đầu nhận chấm công không được sớm hơn giờ bắt đầu ca quá 30 phút!");
    }
    if (getDiff(checkInEndM, startMins) > 30) {
      throw new Error("Hạn chót chấm công không được muộn hơn giờ bắt đầu ca quá 30 phút!");
    }
  }

  if (data.checkOutDeadline) {
    const checkOutDeadlineM = toMinutes(data.checkOutDeadline);
    if (getDiff(checkOutDeadlineM, endMins) < 0) {
      throw new Error("Giờ kết ca phải sau giờ kết thúc ca!");
    }
    if (getDiff(checkOutDeadlineM, endMins) > 30) {
      throw new Error("Giờ kết ca không được trễ hơn giờ kết thúc ca quá 30 phút!");
    }
  }

  return await shiftModel.updateShift(id, data);
};

module.exports.createShift = async (data) => {
  if (!data.name || !data.startTime || !data.endTime) {
    throw new Error("Vui lòng nhập đầy đủ thông tin ca làm việc!");
  }

  const dup = await shiftModel.checkDuplicateName(data.name);
  if (dup) throw new Error("Tên ca làm việc đã tồn tại!");

  const startMins = toMinutes(data.startTime);
  const endMins = toMinutes(data.endTime);

  let duration = endMins - startMins;
  if (duration < 0) duration += 1440;
  if (duration === 0) throw new Error("Giờ kết thúc không được trùng giờ bắt đầu!");
  if (duration < 5) throw new Error("Ca làm tối thiểu 5 phút!");
  if (duration > 600) throw new Error("Ca làm tối đa 10 giờ!");

  if (data.checkInStart || data.checkInEnd) {
    if (!data.checkInStart || !data.checkInEnd) {
      throw new Error("Phải nhập cả giờ bắt đầu và Hạn chót chấm công!");
    }
    const checkInStartM = toMinutes(data.checkInStart);
    const checkInEndM = toMinutes(data.checkInEnd);

    if (getDiff(checkInEndM, checkInStartM) <= 0) {
      throw new Error("Hạn chót chấm công phải sau giờ bắt đầu nhận chấm công!");
    }
    if (getDiff(checkInStartM, startMins) < -30) {
      throw new Error("Giờ bắt đầu nhận chấm công không được sớm hơn giờ bắt đầu ca quá 30 phút!");
    }
    if (getDiff(checkInEndM, startMins) > 30) {
      throw new Error("Hạn chót chấm công không được muộn hơn giờ bắt đầu ca quá 30 phút!");
    }
  }

  if (data.checkOutDeadline) {
    const checkOutDeadlineM = toMinutes(data.checkOutDeadline);
    if (getDiff(checkOutDeadlineM, endMins) < 0) {
      throw new Error("Giờ kết ca phải sau giờ kết thúc ca!");
    }
    if (getDiff(checkOutDeadlineM, endMins) > 30) {
      throw new Error("Giờ kết ca không được trễ hơn giờ kết thúc ca quá 30 phút!");
    }
  }

  return await shiftModel.createShift(data);
};

module.exports.toggleShift = async (id) => {
  const existing = await shiftModel.getShiftById(id);
  if (!existing) throw new Error("Không tìm thấy ca làm việc!");
  return await shiftModel.toggleShift(id);
};