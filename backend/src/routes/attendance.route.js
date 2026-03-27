const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect } = require('../middlewares/protect.middleware');
const PERMISSIONS = require('../constants/permissions');

router.get('/check-pending', protect(PERMISSIONS.VIEW_MY_SCHEDULE), attendanceController.checkPending);
router.post('/check-in', protect(PERMISSIONS.VIEW_MY_SCHEDULE), attendanceController.checkIn);
router.post('/simple-check-out', protect(PERMISSIONS.VIEW_MY_SCHEDULE), attendanceController.simpleCheckOut);
//chặn đăng xuất
router.get('/check-working', protect(PERMISSIONS.VIEW_MY_SCHEDULE), attendanceController.checkWorking);

module.exports = router;
