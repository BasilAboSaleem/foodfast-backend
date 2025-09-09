const Product = require('../models/Product');
const redis = require('../config/redis');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, image, availability } = req.body;
    const product = new Product({ name, price, image, availability });
    await product.save();

    // Clear cached products when a new one is added
    await redis.del("products");

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    // Check cache first
    const cachedProducts = await redis.get("products");
    if (cachedProducts) {
      console.log("📦 Serving from Redis cache");
      return res.json(JSON.parse(cachedProducts));
    }

    // If not cached, fetch from MongoDB
    const products = await Product.find();

    // Store in cache for 1 hour
    await redis.set("products", JSON.stringify(products), "EX", 3600);

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });

    // Clear cached products
    await redis.del("products");

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });

    // Clear cached products
    await redis.del("products");

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
