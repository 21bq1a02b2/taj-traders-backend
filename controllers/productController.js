import {
  getAllProductsService,
  getProductByIdService,
  getCategoriesService,
  getBrandsService,
  createProductService,
  updateProductService,
  deleteProductService,
  resetSeedDataService,
} from '../services/productService.js';
import { getIsMongoConnected } from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const result = await getAllProductsService(req.query);
    res.json({
      success: true,
      data: result.products,
      total: result.total,
      page: result.page,
      pages: result.pages,
      dbStatus: getIsMongoConnected() ? 'connected (mongodb)' : 'resilient-cache',
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await getProductByIdService(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await getCategoriesService();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBrands = async (req, res) => {
  try {
    const brands = await getBrandsService();
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, brand, category, price, mrp, image, description } = req.body;
    if (!name || !brand || !category || !price || !mrp || !image || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, brand, category, price, mrp, image, description',
      });
    }

    const newProduct = await createProductService(req.body);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updated = await updateProductService(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await deleteProductService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetSeedData = async (req, res) => {
  try {
    const result = await resetSeedDataService();
    res.json({
      success: true,
      message: `Reset catalog successfully with ${result.count} products!`,
      storage: result.storage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
