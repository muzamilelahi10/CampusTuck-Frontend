'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Check } from 'lucide-react';
import { IProduct } from '@campustuck/shared';
import { PriceTag } from './PriceTag';
import { useCart } from '../contexts/CartContext';
import { useToast } from './Toast';

// Background tints matching 02-Catalog-Desktop.svg
const TINTS: Record<string, string> = {
  'iced-matcha-latte': '#E9F1D5',
  'campus-notebook': '#E7EBE4',
  'mineral-water': '#E7ECF4',
  'chicken-wrap': '#F7E9DA',
  'study-pen-set': '#E8EDE7',
  'chocolate-cookie': '#F2E6DF',
};

export function ProductCard({ product }: { product: IProduct }) {
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = React.useState(false);

  const cartItem = items.find((i) => i.product._id === product._id);
  const quantityInCart = cartItem?.quantity || 0;
  const isOutOfStock = product.stock <= 0;

  const bgTint = TINTS[product.slug] || '#EFF2E7';

  // Format subtitle from description (e.g. "Freshly made • 350 ml")
  const subtitle = React.useMemo(() => {
    if (!product.description) return '';
    const parts = product.description.split('. ');
    return parts[parts.length - 1] || parts[0];
  }, [product.description]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (quantityInCart >= product.stock) {
      toast.warning(`Only ${product.stock} units available in stock.`);
      return;
    }

    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <article className="product-card group">
      <Link href={`/products/${product.slug}`} className="product-image" style={{ backgroundColor: bgTint }}>
        {product.imageUrls?.[0] ? (
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-muted text-xs font-medium p-4 text-center">{product.name}</span>
        )}
        {isOutOfStock && <span className="stock-label">Out of stock</span>}
      </Link>

      <div className="product-info">
        <Link href={`/products/${product.slug}`} className="no-underline">
          <h3 className="hover:text-leaf transition-colors">{product.name}</h3>
        </Link>
        <p title={product.description}>{subtitle || product.description}</p>

        <div className="product-bottom">
          <PriceTag paisa={product.price} size="sm" className="font-bold text-[14px]" />
          <button
            type="button"
            className="product-add-btn"
            aria-label={`Add ${product.name} to cart`}
            disabled={isOutOfStock || quantityInCart >= product.stock}
            onClick={handleAdd}
            title={justAdded ? 'Added!' : `Add to cart (${quantityInCart} currently in cart)`}
          >
            {justAdded ? <Check size={16} className="text-lime" /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </article>
  );
}
