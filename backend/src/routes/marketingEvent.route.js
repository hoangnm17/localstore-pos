const express = require('express');
const router = express.Router();
const controller = require('../controllers/marketingEvent.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const permissionMiddleware = require('../middlewares/permission.middleware');

// Routes cho Marketing Events
router.get('/', authMiddleware.verifyToken, controller.getAll);
router.get('/active', controller.getActive); // Thường là public cho Dashboard/POS
router.get('/:id', authMiddleware.verifyToken, controller.getById);
router.post('/', authMiddleware.verifyToken, controller.create);
router.put('/:id', authMiddleware.verifyToken, controller.update);
router.delete('/:id', authMiddleware.verifyToken, controller.delete);

module.exports = router;
