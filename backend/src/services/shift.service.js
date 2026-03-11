const shiftModel = require("../models/shift.model");

const toMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

//cộng/trừ phút vào "HH:MM", trả về "HH:MM"
const addMinutes = (timeStr, mins) => {
  if (!timeStr) return null;
  const total = toMinutes(timeStr) + mins;
  const h = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const m = ((total % 1440) + 1440) % 1440 % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
    throw new Error(`Thời gian trùng với ca "${conflict[0].name}"`);
  }

  const start = toMinutes(data.startTime);
  const end = toMinutes(data.endTime);

  if (data.checkInStart && data.checkInEnd) {
    const checkInStart = toMinutes(data.checkInStart);
    const checkInEnd = toMinutes(data.checkInEnd);

    if (checkInStart >= checkInEnd)
      throw new Error("Giờ bắt đầu check-in phải trước deadline!");

    if (checkInStart < start - 30)
      throw new Error("Check-in không được sớm hơn 30 phút!");

    if (checkInEnd > end + 30)
      throw new Error("Deadline check-in không được muộn hơn 30 phút sau ca!");
  }

  if (data.checkOutDeadline) {
    const deadline = toMinutes(data.checkOutDeadline);

    if (deadline <= start)
      throw new Error("Thời gian kết ca phải sau giờ bắt đầu ca!");

    if (deadline > end + 30)
      throw new Error("Checkout không được muộn hơn 30 phút!");
  }

  return await shiftModel.createShift(data);
};

module.exports.updateShift = async (id, data) => {
  const existing = await shiftModel.getShiftById(id);
  if (!existing) throw new Error("Không tìm thấy ca làm việc!");

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

    const startMins= toMinutes(data.startTime);
    const endMins= toMinutes(data.endTime);
    const checkInStartM= toMinutes(data.checkInStart);
    const checkInEndM= toMinutes(data.checkInEnd);

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

  // Validate thời gian logout (checkOutDeadline)
  if (data.checkOutDeadline) {
    const endMins           = toMinutes(data.endTime);
    const checkOutDeadlineM = toMinutes(data.checkOutDeadline);
    if (checkOutDeadlineM <= toMinutes(data.startTime)) {
      throw new Error("Thời gian kết ca phải sau giờ bắt đầu ca!");
    }
    if (checkOutDeadlineM > endMins + 120) {
      throw new Error("Thời gian kết ca không được trễ hơn giờ kết thúc ca quá 2 giờ!");
    }
  }

  return await shiftModel.updateShift(id, data);
};

module.exports.deleteShift = async (id) => {
  const existing = await shiftModel.getShiftById(id);
  if (!existing) throw new Error("Không tìm thấy ca làm việc!");
  return await shiftModel.deleteShift(id);
};
