const Order = require('../models/Order');
const { pub } = require('../config/redis');


exports.createOrder = async (req, res) => {
  try {
    const { client, products, totalPrice } = req.body;
    const order = new Order({ client, products, totalPrice });
    await order.save();

    // publish the new order to Redis channel
    await pub.publish("orderChannel", JSON.stringify(order));

    // Optionally: you can keep io.emit if you want to send live updates to this server only
    const io = req.app.get("io");
    io.emit("newOrder", order);

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


// Long Polling controller
exports.trackOrder = async (req, res) => {
  const { id } = req.params;

  try {
    let order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // current status
    const currentStatus = order.status;

    let timer;
    const checkForUpdates = async () => {
      const updatedOrder = await Order.findById(id);
      if (!updatedOrder) {
        clearTimeout(timer);
        return res.status(404).json({ error: "Order not found" });
      }

      if (updatedOrder.status !== currentStatus) {
        clearTimeout(timer);
        return res.json({ status: updatedOrder.status });
      } else {
        timer = setTimeout(checkForUpdates, 2000); // check every 2 seconds
      }
    };

    // timeout after 20 seconds → return current status
    timer = setTimeout(() => {
      return res.json({ status: currentStatus });
    }, 20000);

    // start checking
    checkForUpdates();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};