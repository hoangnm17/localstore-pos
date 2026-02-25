const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff.controller");
const { protect } = require("../middlewares/protect.middleware"); 
const PERMISSIONS = require("../constants/permissions");

router.get("/", protect(PERMISSIONS.VIEW_STAFF)
    , staffController.getAllStaff);

router.post("/", protect(PERMISSIONS.CREATE_STAFF)
    , staffController.createStaff);

router.put("/update",protect(PERMISSIONS.UPDATE_STAFF)
    , staffController.updateStaff);
    
router.get("/detail", protect(PERMISSIONS.DETAIL_STAFF)
    , staffController.getDetail);
module.exports = router;