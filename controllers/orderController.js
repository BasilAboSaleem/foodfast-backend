const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { client, products, totalPrice } = req.body;
    const order = new Order({ client, products, totalPrice });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { clientId } = req.params;
    const orders = await Order.find({ client: clientId }).populate('products.productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
