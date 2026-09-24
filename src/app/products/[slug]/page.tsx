'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Clock, ArrowRight } from 'lucide-react';
import { IProduct } from '@campustuck/shared';
import { productsAPI } from '../../../lib/api';
import { useCart } from '../../../contexts/CartContext';
import { PriceTag } from '../../../components/PriceTag';
import { useToast } from '../../../components/Toast';

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
          setSelectedImage(res.product.imageUrls?.[0] || '/design/matcha.svg');
        } else {
          toast.error('Product not found.');
          router.push('/catalog');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load product details.');
        router.push('/catalog');
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
      <div className="product-detail-page animate-pulse">
        <div className="h-4 bg-line rounded w-48 mb-6" />
        <div className="detail-layout">
          <div className="aspect-[1.2] bg-line rounded-[18px]" />
          <div className="space-y-4">
            <div className="h-6 bg-line rounded w-24" />
            <div className="h-12 bg-line rounded w-3/4" />
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
      : 'Drinks';

  // Subtitle / attribute slice
  const subtitle = product.description.split('. ')[0] || product.description;
  const attributes = product.description.includes('•')
    ? product.description.split('. ').find((s) => s.includes('•')) || 'Freshly prepared • 350 ml'
    : 'Freshly prepared • 350 ml';

  const handleAddToCart = () => {
    if (quantity + currentInCartQty > product.stock) {
      toast.warning(`Cannot add more than ${product.stock} units total.`);
      return;
    }
    addItem(product, quantity);
    toast.success(`Added ${quantity} × ${product.name} to cart`);
  };

  const imagesList =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : ['/design/matcha.svg'];

  return (
    <div className="product-detail-page">
      {/* Breadcrumb (04-Product-Details.svg) */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <Link href="/catalog">Shop</Link>
        <span>/</span>
        <Link href={`/catalog?category=${typeof product.category === 'object' ? (product.category as any).slug : 'drinks'}`}>
          {categoryName.split(' ')[0]}
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{product.name}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="detail-layout">
        {/* Left Side: Image Gallery */}
        <div className="detail-gallery">
          {/* Main Display Image */}
          <div className="detail-main-image">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-contain p-8 md:p-12"
              priority
            />
          </div>

          {/* 3 Thumbnails Strip */}
          <div className="detail-thumbnails">
            {[0, 1, 2].map((idx) => {
              const src = imagesList[idx % imagesList.length];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedThumb(idx);
                    setSelectedImage(src);
                  }}
                  className={`detail-thumb ${selectedThumb === idx ? 'active' : ''}`}
                  aria-label={`Select product image view ${idx + 1}`}
                >
                  <div className="relative w-full h-full p-2">
                    <Image src={src} alt="" fill className="object-contain p-2" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Information & Action Form */}
        <div className="detail-info">
          {/* Tag Pill */}
          <span className="detail-badge">BESTSELLER</span>

          {/* Title */}
          <h1>{product.name}</h1>

          {/* Subtitle */}
          <p className="detail-desc">{subtitle}</p>

          {/* Price */}
          <div className="detail-price">
            <PriceTag paisa={product.price} size="xl" className="font-extrabold text-[30px]" />
          </div>

          <div className="detail-divider" />

          {/* Specifications */}
          <p className="detail-specs">{attributes}</p>

          {/* Stock Status Indicator */}
          <div className="detail-status">
            <span className="w-2.5 h-2.5 rounded-full bg-leaf inline-block" />
            <span>
              {isOutOfStock ? 'Currently out of stock' : 'In stock and ready for pickup'}
            </span>
          </div>

          {/* Quantity Selector & Add Button */}
          <div className="pt-2">
            <p className="detail-qty-label">QUANTITY</p>

            <div className="detail-actions-row mt-2">
              <div className="qty-counter">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  disabled={quantity + currentInCartQty >= product.stock}
                  onClick={() => setQuantity((prev) => prev + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="detail-add-cart"
              >
                <span>Add to cart</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          {/* Delivery & Pickup Info Banner */}
          <div className="detail-delivery-banner">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-leaf shrink-0 shadow-sm">
              <Clock size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h4>Pickup in around 20 minutes</h4>
              <p>Select pickup or delivery at checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
