const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff.controller");
const { protect } = require("../middlewares/protect.middleware");
const PERMISSIONS = require("../constants/permissions");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/",
    protect(PERMISSIONS.VIEW_STAFF), staffController.getAllStaff);
router.post("/",
    protect(PERMISSIONS.CREATE_STAFF), staffController.createStaff);
router.put("/update",
    protect(PERMISSIONS.UPDATE_STAFF), staffController.updateStaff);
router.get("/detail",
    protect(PERMISSIONS.DETAIL_STAFF), staffController.getDetail);
router.put("/toggle-status",
    protect(PERMISSIONS.UPDATE_STAFF), staffController.toggleStatus);
router.put("/resign",
    protect(PERMISSIONS.UPDATE_STAFF), staffController.resignStaff);
router.get('/roles', staffController.getRoles);
router.put("/reset-password",
     protect(PERMISSIONS.UPDATE_STAFF), staffController.resetPassword);
router.get("/my-profile", verifyToken,
    staffController.getMyProfile);
router.put("/change-password", verifyToken,
     staffController.changePassword);
module.exports = router;
