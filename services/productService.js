import Product from '../models/Product.js';
import { seedProducts } from '../data/seedProducts.js';
import { getIsMongoConnected } from '../config/db.js';

// Resilient memory cache fallback if MongoDB is not active
let memoryProducts = seedProducts.map((p, idx) => ({
  ...p,
  _id: `mem_${idx + 1}`,
  discountPercentage: p.mrp && p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const getAllProductsService = async (query = {}) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    sort,
    page = 1,
    limit = 50,
    featured,
    bestseller,
  } = query;

  if (getIsMongoConnected()) {
    const mongoQuery = {};

    if (category && category !== 'All') {
      mongoQuery.category = category;
    }

    if (brand && brand !== 'All') {
      mongoQuery.brand = brand;
    }

    if (minPrice || maxPrice) {
      mongoQuery.price = {};
      if (minPrice) mongoQuery.price.$gte = Number(minPrice);
      if (maxPrice) mongoQuery.price.$lte = Number(maxPrice);
    }

    if (featured === 'true') {
      mongoQuery.isFeatured = true;
    }

    if (bestseller === 'true') {
      mongoQuery.isBestSeller = true;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      mongoQuery.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { subcategory: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'name_asc') sortOptions = { name: 1 };

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Product.countDocuments(mongoQuery);
    const products = await Product.find(mongoQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit);

    return {
      products,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
      source: 'mongodb',
    };
  }

  // Memory fallback
  let filtered = [...memoryProducts];

  if (category && category !== 'All') {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (brand && brand !== 'All') {
    filtered = filtered.filter(
      (p) => p.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  if (minPrice) {
    filtered = filtered.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter((p) => p.price <= Number(maxPrice));
  }

  if (featured === 'true') {
    filtered = filtered.filter((p) => p.isFeatured);
  }

  if (bestseller === 'true') {
    filtered = filtered.filter((p) => p.isBestSeller);
  }

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(term)) ||
        p.description.toLowerCase().includes(term) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(term)))
    );
  }

  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'name_asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  const skip = (parsedPage - 1) * parsedLimit;
  const paginated = filtered.slice(skip, skip + parsedLimit);

  return {
    products: paginated,
    total: filtered.length,
    page: parsedPage,
    pages: Math.ceil(filtered.length / parsedLimit) || 1,
    source: 'in-memory-fallback',
  };
};

export const getProductByIdService = async (id) => {
  if (getIsMongoConnected()) {
    return await Product.findById(id);
  }
  return memoryProducts.find((p) => String(p._id) === String(id));
};

export const getCategoriesService = async () => {
  const allCategories = [
    'Hair Care',
    'Hair Color & Treatment',
    'Makeup',
    'Salon Furniture',
    'Skin Care',
    'Waxing',
    'Professional Equipment',
    'Barber Supplies',
  ];

  if (getIsMongoConnected()) {
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const map = {};
    counts.forEach((item) => {
      map[item._id] = item.count;
    });
    return allCategories.map((cat) => ({
      name: cat,
      count: map[cat] || 0,
    }));
  }

  return allCategories.map((cat) => ({
    name: cat,
    count: memoryProducts.filter((p) => p.category === cat).length,
  }));
};

export const getBrandsService = async () => {
  if (getIsMongoConnected()) {
    const brands = await Product.distinct('brand');
    return brands.sort();
  }
  const set = new Set(memoryProducts.map((p) => p.brand));
  return Array.from(set).sort();
};

export const createProductService = async (productData) => {
  if (getIsMongoConnected()) {
    return await Product.create(productData);
  }

  const newProduct = {
    ...productData,
    _id: `mem_${Date.now()}`,
    discountPercentage:
      productData.mrp && productData.price
        ? Math.round(((productData.mrp - productData.price) / productData.mrp) * 100)
        : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryProducts.unshift(newProduct);
  return newProduct;
};

export const updateProductService = async (id, updateData) => {
  if (getIsMongoConnected()) {
    return await Product.findByIdAndUpdate(id, updateData, { new: true });
  }

  const idx = memoryProducts.findIndex((p) => String(p._id) === String(id));
  if (idx === -1) return null;

  memoryProducts[idx] = {
    ...memoryProducts[idx],
    ...updateData,
    discountPercentage:
      updateData.mrp && updateData.price
        ? Math.round(((updateData.mrp - updateData.price) / updateData.mrp) * 100)
        : memoryProducts[idx].discountPercentage,
    updatedAt: new Date().toISOString(),
  };
  return memoryProducts[idx];
};

export const deleteProductService = async (id) => {
  if (getIsMongoConnected()) {
    return await Product.findByIdAndDelete(id);
  }

  const idx = memoryProducts.findIndex((p) => String(p._id) === String(id));
  if (idx === -1) return null;
  const deleted = memoryProducts.splice(idx, 1);
  return deleted[0];
};

export const resetSeedDataService = async () => {
  if (getIsMongoConnected()) {
    await Product.deleteMany({});
    await Product.insertMany(seedProducts);
    return { count: seedProducts.length, storage: 'mongodb' };
  }

  memoryProducts = seedProducts.map((p, idx) => ({
    ...p,
    _id: `mem_${idx + 1}`,
    discountPercentage: p.mrp && p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  return { count: memoryProducts.length, storage: 'in-memory-fallback' };
};
