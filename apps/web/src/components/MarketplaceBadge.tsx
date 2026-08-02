import type { Marketplace } from '../types';

const labels: Record<Marketplace, string> = {
  SHOPEE: 'Shopee',
  TOKOPEDIA: 'Tokopedia',
  TIKTOK: 'TikTok Shop',
  OTHER: 'Marketplace',
};

const styles: Record<Marketplace, string> = {
  SHOPEE: 'bg-orange-50 text-orange-700 ring-orange-100',
  TOKOPEDIA: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  TIKTOK: 'bg-slate-900 text-white ring-slate-800',
  OTHER: 'bg-blue-50 text-blue-700 ring-blue-100',
};

export function MarketplaceBadge({ marketplace }: { marketplace: Marketplace }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${styles[marketplace]}`}>
      {labels[marketplace]}
    </span>
  );
}

export function marketplaceLabel(marketplace: Marketplace) {
  return labels[marketplace];
}
