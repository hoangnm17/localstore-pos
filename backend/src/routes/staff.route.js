const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff.controller");
const { verifyToken, authorizeFeature } = require("../middlewares/auth.middleware");

router.get("/", verifyToken
    , authorizeFeature('MANAGE_STAFF')
    , staffController.getAllStaff);

router.post("/", verifyToken
    , authorizeFeature('MANAGE_STAFF')
    , staffController.createStaff);

router.put("/update", verifyToken
    , authorizeFeature('MANAGE_STAFF')
    , staffController.updateStaff);
    
router.get("/detail", verifyToken
    , authorizeFeature('MANAGE_STAFF')
    , staffController.getDetail);
module.exports = router;