import { ChevronLeft, ChevronRight, ExternalLink, ImageOff, PlayCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { redirectUrl } from '../lib/api';
import type { Product, ProductMedia } from '../types';
import { MarketplaceBadge } from './MarketplaceBadge';

function productMedia(product: Product): ProductMedia[] {
  if (product.media?.length) return [...product.media].sort((a, b) => a.sortOrder - b.sortOrder);
  if (!product.imageUrl) return [];
  return [
    {
      id: `legacy-${product.id}`,
      productId: product.id,
      type: 'IMAGE',
      url: product.imageUrl,
      thumbnailUrl: null,
      sortOrder: 0,
    },
  ];
}

export function ProductCard({ product }: { product: Product }) {
  const media = useMemo(() => productMedia(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = media[activeIndex];

  function previous() {
    setActiveIndex((current) => (current - 1 + media.length) % media.length);
  }

  function next() {
    setActiveIndex((current) => (current + 1) % media.length);
  }

  return (
    <motion.article
      layout
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-50">
        {activeMedia?.type === 'IMAGE' ? (
          <img
            src={activeMedia.url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : activeMedia?.type === 'VIDEO' ? (
          <video
            src={activeMedia.url}
            poster={activeMedia.thumbnailUrl || undefined}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-slate-950 object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400"><ImageOff size={38} /></div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <MarketplaceBadge marketplace={product.marketplace} />
          {product.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-violet-700 shadow-sm backdrop-blur">
              <Sparkles size={11} /> Pilihan
            </span>
          )}
          {media.some((item) => item.type === 'VIDEO') && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur">
              <PlayCircle size={11} /> Video
            </span>
          )}
        </div>

        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 opacity-0 shadow-lg transition group-hover:opacity-100 focus:opacity-100"
              aria-label="Media sebelumnya"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 opacity-0 shadow-lg transition group-hover:opacity-100 focus:opacity-100"
              aria-label="Media berikutnya"
            >
              <ChevronRight size={17} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-slate-950/40 px-2.5 py-1.5 backdrop-blur">
              {media.map((item, index) => (
                <button
                  key={item.id || `${item.url}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
                  aria-label={`Buka media ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <p className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900">{product.name}</p>
        <div className="mt-3 flex items-end justify-between gap-2">

          {/*}
          <div>
            <p className="text-sm font-extrabold text-violet-700">{product.priceLabel || 'Lihat harga'}</p>
            {product.originalPriceLabel && (
              <p className="text-xs text-slate-400 line-through">{product.originalPriceLabel}</p>
            )}
          </div>
          */}
          
          <a
            href={redirectUrl(product.slug)}
            target="_blank"
            rel="noreferrer sponsored"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-violet-600"
          >
            Beli <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
