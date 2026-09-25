'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Check } from 'lucide-react';
import { IProduct } from '@campustuck/shared';
import { PriceTag } from './PriceTag';
import { useCart } from '../contexts/CartContext';
import { useToast } from './Toast';

// Background tints matching Figma design cards
const TINTS: Record<string, string> = {
  'campus-notebook': '#E8F0F8',
  'cui-spiral-notebook': '#E8F0F8',
  'pakola-ice-cream-soda-250ml': '#E3F2E9',
  'pakola-ice-cream-soda': '#E3F2E9',
  'chocolate-cookie': '#FDF1E7',
  'lays-masala-potato-chips-large': '#FDE8DE',
  'lays-masala-chips': '#FDE8DE',
  'sanitizing-hand-gel': '#EBF3FA',
  'sanitizing-hand-gel-carabiner-50ml': '#EBF3FA',
  'mineral-water': '#EBF3FA',
  'iced-matcha-latte': '#E8F4EC',
  'chicken-wrap': '#FDF1E7',
  'study-pen-set': '#E8F0F8',
};

export function getProductImage(product: { slug: string; imageUrls?: string[] }): string {
  const s = product.slug.toLowerCase();
  if (s.includes('notebook')) return '/design/notebook.svg';
  if (s.includes('pakola')) return '/design/pakola.svg';
  if (s.includes('cookie')) return '/design/cookie.svg';
  if (s.includes('lays') || s.includes('chips')) return '/design/chips.svg';
  if (s.includes('sanitiz')) return '/design/sanitizer.svg';
  if (s.includes('water')) return '/design/water.svg';
  if (s.includes('matcha')) return '/design/matcha.svg';
  if (s.includes('wrap')) return '/design/wrap.svg';
  if (s.includes('pen')) return '/design/pens.svg';
  if (product.imageUrls?.[0]) return product.imageUrls[0];
  return '/design/notebook.svg';
}

export function ProductCard({ product }: { product: IProduct }) {
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = React.useState(false);

  const cartItem = items.find((i) => i.product._id === product._id);
  const quantityInCart = cartItem?.quantity || 0;
  const isOutOfStock = product.stock <= 0;

  const bgTint = TINTS[product.slug] || '#EFF2E7';
  const displayImage = getProductImage(product);

  // Extract clean subtitle specs (e.g. "A5 • 120 pages" or "Chilled • 250 ml")
  const subtitle = React.useMemo(() => {
    if (!product.description) return '';
    const parts = product.description.split('. ');
    const bulletPart = parts.find((p) => p.includes('•'));
    if (bulletPart) return bulletPart;
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
    toast.success(`Added ${product.name} to bag`);
  };

  return (
    <article className="product-card group bg-white rounded-[20px] p-3 border border-line/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Visual Container */}
      <Link
        href={`/products/${product.slug}`}
        className="product-image-container relative w-full aspect-[1/0.95] rounded-[16px] overflow-hidden flex items-center justify-center transition-transform group-hover:scale-[1.01]"
        style={{ backgroundColor: bgTint }}
      >
        <div className="relative w-[80%] h-[80%]">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
        </div>
        {isOutOfStock && (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-ink/70 text-white text-[10px] font-bold tracking-wide">
            Out of stock
          </span>
        )}
      </Link>

      {/* Info Container */}
      <div className="pt-3 pb-1 px-1 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/products/${product.slug}`} className="no-underline block">
            <h3
              className="text-[14px] sm:text-[15px] font-bold text-ink leading-snug hover:text-leaf transition-colors line-clamp-1"
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>
          <p
            className="text-[11px] sm:text-[12px] text-muted mt-0.5 line-clamp-1 font-normal"
            title={subtitle}
          >
            {subtitle}
          </p>
        </div>

        {/* Price & Add Button Row */}
        <div className="flex items-center justify-between pt-3 mt-1">
          <PriceTag
            paisa={product.price}
            size="sm"
            className="font-extrabold text-[15px] sm:text-[16px] text-ink"
          />
          <button
            type="button"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              justAdded
                ? 'bg-leaf text-lime'
                : 'bg-ink text-white hover:bg-leaf hover:scale-105'
            }`}
            aria-label={`Add ${product.name} to bag`}
            disabled={isOutOfStock || quantityInCart >= product.stock}
            onClick={handleAdd}
            title={justAdded ? 'Added!' : 'Add to bag'}
          >
            {justAdded ? <Check size={15} strokeWidth={2.6} /> : <Plus size={16} strokeWidth={2.4} />}
          </button>
        </div>
      </div>
    </article>
  );
}
