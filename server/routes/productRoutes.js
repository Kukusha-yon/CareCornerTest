import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getBestSellers,
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
} from '../controllers/productController.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Public routes
router.route('/').get(getProducts);
router.route('/search').get(searchProducts);
router.route('/top').get(getTopProducts);
router.route('/featured').get(getFeaturedProducts);
router.route('/best-sellers').get(getBestSellers);
router.route('/category/:category').get(getProductsByCategory);
router.route('/:id').get(getProduct);
router.route('/:id/reviews').post(protect, createProductReview);

// Admin routes
router
  .route('/')
  .post(protect, admin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
  ]), createProduct);

router
  .route('/:id')
  .put(protect, admin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
  ]), updateProduct)
  .delete(protect, admin, deleteProduct);

export default router; 