const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { redis } = require('../config/redis');
exports.createProduct = async (req, res) => {
  try {
    const { name, price, availability } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      { folder: 'products' }
    );

    const product = new Product({
      name,
      price,
      availability,
      image: result.secure_url,
    });
    await product.save();

    await redis.del('products');

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
