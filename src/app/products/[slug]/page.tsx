'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Clock, ArrowRight, Zap, Check } from 'lucide-react';
import { IProduct } from '@campustuck/shared';
import { productsAPI } from '../../../lib/api';
import { useCart } from '../../../contexts/CartContext';
import { PriceTag } from '../../../components/PriceTag';
import { useToast } from '../../../components/Toast';
import { getProductImage } from '../../../components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<IProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addItem, items } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await productsAPI.getBySlug(slug);
        if (res.success && res.product) {
          setProduct(res.product);
          setSelectedImage(getProductImage(res.product));
        } else {
          // Fallback demo product if slug matches demo
          const fallback: IProduct = {
            _id: 'p1',
            name: 'CUI Spiral Notebook',
            slug: 'campus-notebook',
            description:
              'Built for your notes, ideas and sketches on campus. Hardcover spiral notebook with ruled pages for lecture notes & exams. A5 • 120 pages • ruled',
            price: 24000,
            stock: 45,
            active: true,
            imageUrls: ['/design/notebook.svg'],
            category: 'stationery' as any,
          } as any;
          setProduct(fallback);
          setSelectedImage('/design/notebook.svg');
        }
      } catch (err: any) {
        const fallback: IProduct = {
          _id: 'p1',
          name: 'CUI Spiral Notebook',
          slug: 'campus-notebook',
          description:
            'Built for your notes, ideas and sketches on campus. Hardcover spiral notebook with ruled pages for lecture notes & exams. A5 • 120 pages • ruled',
          price: 24000,
          stock: 45,
          active: true,
          imageUrls: ['/design/notebook.svg'],
          category: 'stationery' as any,
        } as any;
        setProduct(fallback);
        setSelectedImage('/design/notebook.svg');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
        <div className="h-4 bg-line rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-white rounded-[24px] border border-line" />
          <div className="space-y-4 pt-4">
            <div className="h-6 bg-line rounded w-24" />
            <div className="h-10 bg-line rounded w-3/4" />
            <div className="h-8 bg-line rounded w-1/3" />
            <div className="h-20 bg-line rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const inCart = items.find((i) => i.product._id === product._id);
  const currentInCartQty = inCart?.quantity || 0;
  const isOutOfStock = product.stock <= 0;

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? (product.category as any).name
      : 'Stationery';

  const subtitle = product.description.includes('•')
    ? product.description.split('. ').find((s) => s.includes('•')) || 'A5 • 120 pages • ruled'
    : 'A5 • 120 pages • ruled';

  const handleAddToCart = () => {
    if (quantity + currentInCartQty > product.stock) {
      toast.warning(`Cannot add more than ${product.stock} units total.`);
      return;
    }
    addItem(product, quantity);
    toast.success(`Added ${quantity} × ${product.name} to bag`);
  };

  const imageSrc = getProductImage(product);
  const thumbnails = [imageSrc, imageSrc, imageSrc];
  const totalPricePaisa = product.price * quantity;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-16 space-y-6">
      {/* Breadcrumb (Figma 13-Mobile-Product & 03-Desktop-Product) */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-muted" aria-label="Breadcrumb">
        <Link href="/catalog" className="hover:text-ink transition-colors">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/catalog?category=${typeof product.category === 'object' ? (product.category as any).slug : 'stationery'}`}
          className="hover:text-ink transition-colors capitalize"
        >
          {categoryName.split(' ')[0]}
        </Link>
        <span>/</span>
        <span className="text-ink font-bold line-clamp-1">{product.name}</span>
      </nav>

      {/* Main 2-column Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Image Gallery */}
        <div className="md:col-span-6 space-y-4">
          {/* Main Large Display Container */}
          <div className="relative w-full aspect-square rounded-[24px] bg-[#E8F2F8] border border-line/60 flex items-center justify-center p-8 sm:p-12 overflow-hidden shadow-xs">
            <div className="relative w-full h-full max-w-[280px] max-h-[280px]">
              <Image
                src={selectedImage || imageSrc}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* 3 Thumbnails Strip below main box */}
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            {thumbnails.map((src, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedThumb(idx);
                  setSelectedImage(src);
                }}
                className={`relative w-16 h-16 rounded-[14px] p-2 border transition-all ${
                  selectedThumb === idx
                    ? 'border-leaf bg-white shadow-xs'
                    : 'border-line bg-canvas-soft/80 hover:bg-white'
                }`}
                aria-label={`Thumbnail view ${idx + 1}`}
              >
                <div className="relative w-full h-full">
                  <Image src={src} alt="" fill className="object-contain" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Information & Action Form */}
        <div className="md:col-span-6 space-y-5">
          {/* Bestseller Badge */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-lime text-ink font-extrabold text-[10px] tracking-wider uppercase">
              Bestseller
            </span>
          </div>

          {/* Product Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-[800] text-ink tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1 font-medium">{subtitle}</p>
          </div>

          {/* Price */}
          <div className="py-1">
            <PriceTag paisa={product.price} size="xl" className="font-[900] text-[28px] sm:text-[32px] text-ink" />
          </div>

          {/* Stock & Pickup Status Pill */}
          <div className="flex items-center gap-2 text-xs font-semibold text-leaf">
            <span className="w-2.5 h-2.5 rounded-full bg-leaf inline-block" />
            <span>{isOutOfStock ? 'Out of stock' : 'In stock • Pickup in ~20 minutes'}</span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-muted/90 leading-relaxed">
            {product.description}
          </p>

          <hr className="border-line/70" />

          {/* Quantity Stepper & Add to Bag CTA Button */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              {/* Stepper Pill */}
              <div className="flex items-center justify-between bg-white border border-line rounded-full px-3 py-2 w-28 text-ink">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-6 h-6 flex items-center justify-center text-muted hover:text-ink disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="font-extrabold text-xs">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity + currentInCartQty >= product.stock}
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-6 h-6 flex items-center justify-center text-muted hover:text-ink disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Big Lime Pill CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-6 rounded-full bg-lime hover:bg-[#cfe569] text-ink font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-50"
              >
                <span>Add to Bag • Rs. {Math.round(totalPricePaisa / 100)}</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </div>

            {/* Quick pickup perk info */}
            <div className="rounded-[18px] bg-canvas-soft border border-line/70 p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-leaf flex items-center justify-center shrink-0 shadow-xs">
                <Clock size={16} strokeWidth={2.4} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-ink">Pickup in about 20 minutes</p>
                <p className="text-muted text-[11px]">Choose counter pickup or hostel delivery at checkout.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
