import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Hair Care',
    slug: 'Hair Care',
    itemCount: '11 products',
    description: 'Salon-size professional shampoos, repair masks, deep conditioners, and therapeutic oils.',
    image: 'https://res.cloudinary.com/dg8z7pxju/image/upload/v1786912072/shree-gopi-traders/products/v5/professional-standing-hair-steamer-hood-dryer-machine-front-1786912072310.png',
  },
  {
    name: 'Hair Color & Treatment',
    slug: 'Hair Color & Treatment',
    itemCount: '8 products',
    description: 'Dust-free bleach powders, developers, bond rebuilder plex solutions, and smoothening agents.',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Makeup',
    slug: 'Makeup',
    itemCount: '8 products',
    description: 'Longwear liquid foundations, setting sprays, eyeshadow palettes, and liquid lipstick sets.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Salon Furniture',
    slug: 'Salon Furniture',
    itemCount: '17 products',
    description: 'Hydraulic styling chairs, glass top manicure tables, facial beds, and shampoo backwash stations.',
    image: 'https://res.cloudinary.com/dg8z7pxju/image/upload/v1786912064/shree-gopi-traders/products/v5/professional-glass-top-manicure-table-desk-dust-collector-front-1786912062998.png',
  },
  {
    name: 'Skin Care',
    slug: 'Skin Care',
    itemCount: '27 products',
    description: 'Salon facial kits, pure hyaluronic serums, detox charcoal peel-off masks, and moisturizers.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Waxing',
    slug: 'Waxing',
    itemCount: '14 products',
    description: 'Italian liposoluble stripless wax beans, dual wax warmer heaters, and soothing pre/post gels.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Professional Equipment',
    slug: 'Professional Equipment',
    itemCount: '20 products',
    description: 'Facial ozone steamers with magnifying lamps, LED ring lights, hot towel warmers, and skin scrubbers.',
    image: 'https://res.cloudinary.com/dg8z7pxju/image/upload/v1786912079/shree-gopi-traders/products/v5/2-in-1-facial-ozone-steamer-magnifying-lamp-combo-station-front-1786912079553.jpg',
  },
  {
    name: 'Barber Supplies',
    slug: 'Barber Supplies',
    itemCount: '22 products',
    description: 'Cordless barber hair clippers, zero-gap skeleton trimmers, titanium shears, and spray bottles.',
    image: 'https://res.cloudinary.com/dg8z7pxju/image/upload/v1786912095/shree-gopi-traders/products/v5/professional-barber-continuous-spray-bottle-neck-duster-set-front-1786912095224.png',
  },
];

export default function CategoriesPage() {
  return (
    <div className="flex-1 bg-white">
      {/* Header Banner */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 py-12 text-white">
        <div className="container-page max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Taj Traders Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">All Categories</h1>
          <p className="mt-2 text-sm text-brand-200">
            Browse every category of professional salon, parlour, beauty, and spa supplies at wholesale rates.
          </p>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="container-page py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-50 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {cat.itemCount}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-700">
                  <span>Browse Products</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
