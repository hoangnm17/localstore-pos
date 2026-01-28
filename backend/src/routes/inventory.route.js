const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");

// View category stock (all + search + pagination)
router.get("/categories", inventoryController.getCategoryStock);

module.exports = router;
