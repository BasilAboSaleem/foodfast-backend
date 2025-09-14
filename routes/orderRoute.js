const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/orders', orderController.createOrder);
router.get('/orders/:clientId', orderController.getUserOrders);
// Long Polling route
router.get("/track-order/:id", orderController.trackOrder);
router.put("/orders/:id/status", orderController.updateOrderStatus);

 
module.exports = router;
 