import express from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  getBrands,
  createProduct,
  updateProduct,
  deleteProduct,
  resetSeedData,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/categories/all', getCategories);
router.get('/brands/all', getBrands);
router.post('/seed', resetSeedData);

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
