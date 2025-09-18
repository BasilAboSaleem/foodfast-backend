const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middlewares/multer');
const {requireAuth, isAdmin } = require('../middlewares/authMiddlewares');

router.post('/products',requireAuth, isAdmin, upload.single('image'), productController.createProduct);
router.get('/products', productController.getProducts);
router.put('/products/:id', requireAuth, isAdmin, productController.updateProduct);
router.delete('/products/:id', requireAuth, isAdmin, productController.deleteProduct);

module.exports = router;
