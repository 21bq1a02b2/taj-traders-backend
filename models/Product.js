import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Cosmetics',
        'Makeup',
        'Skin Care',
        'Hair Care',
        'Hair Accessories',
        'Bath & Body',
        'Beauty Tools',
        // Retain legacy categories for backward compatibility if needed
        'Hair Color & Treatment',
        'Waxing',
        'Professional Equipment',
        'Barber Supplies',
        'Salon Furniture',
      ],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: 0,
    },
    wholesaleTierPrice: {
      type: Number,
      min: 0,
    },
    minWholesaleQty: {
      type: Number,
      default: 3,
    },
    stock: {
      type: Number,
      default: 25,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 12,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
    },
    benefits: {
      type: [String],
      default: [],
    },
    howToUse: {
      type: String,
      default: '',
    },
    ingredients: {
      type: String,
      default: '',
    },
    volumeOrWeight: {
      type: String,
      default: '100 ml',
    },
    skinOrHairType: {
      type: String,
      default: 'All Skin / Hair Types',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.mrp && this.price && this.mrp > this.price) {
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
