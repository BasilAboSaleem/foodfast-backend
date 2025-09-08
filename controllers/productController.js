const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, image, availability } = req.body;
    const product = new Product({ name, price, image, availability });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
