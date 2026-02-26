const shiftModel = require("../models/shift.model");

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

  const duplicateName = await shiftModel.checkDuplicateName(data.name);
  if (duplicateName) {
    throw new Error("Tên ca làm việc đã tồn tại!");
  }

  const timeConflict = await shiftModel.checkTimeConflict(data.startTime, data.endTime);
  if (timeConflict.length > 0) {
    throw new Error(`Thời gian làm việc trùng với ca "${timeConflict[0].name}"`);
  }

  return await shiftModel.createShift(data);
};

module.exports.updateShift = async (id, data) => {
  const existingShift = await shiftModel.getShiftById(id);
  if (!existingShift) {
    throw new Error("Không tìm thấy ca làm việc!");
  }

  const duplicateName = await shiftModel.checkDuplicateName(data.name, id);
  if (duplicateName) {
    throw new Error("Tên ca làm việc đã tồn tại!");
  }

  const timeConflict = await shiftModel.checkTimeConflict(data.startTime, data.endTime, id);
  if (timeConflict.length > 0) {
    throw new Error(`Thời gian làm việc trùng với ca "${timeConflict[0].name}"`);
  }

  return await shiftModel.updateShift(id, data);
};

module.exports.deleteShift = async (id) => {
  const existingShift = await shiftModel.getShiftById(id);
  if (!existingShift) {
    throw new Error("Không tìm thấy ca làm việc!");
  }

  return await shiftModel.deleteShift(id);
};