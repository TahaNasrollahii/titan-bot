/* Shape of the website's /api/fortnite-shop (titan-front/src/lib/fortniteShop.ts). */
import { env } from '@/lib/env';

export type ShopFilterCategory =
  | 'all'
  | 'bundle'
  | 'outfit'
  | 'emote'
  | 'pickaxe'
  | 'backpack'
  | 'glider'
  | 'wrap'
  | 'track'
  | 'car'
  | 'instrument'
  | 'other';

export interface ShopBundleItem {
  id: string;
  name: string;
  typeEn: string;
  typeFa: string;
  rarityKey: string;
  rarityColor: string;
  image: string | null;
}

/** Tile colours from the in-game shop layout (fortnite-api `colors`). */
export interface ShopCardColors {
  primary: string;
  secondary: string | null;
  accent: string | null;
  plate: string | null;
}

export interface ShopEntry {
  id: string;
  name: string;
  description: string | null;
  image: string;
  category: Exclude<ShopFilterCategory, 'all'>;
  typeEn: string;
  typeFa: string;
  rarityKey: string;
  rarityEn: string;
  rarityFa: string;
  rarityColor: string;
  cardBgColor: string | null;
  cardColors: ShopCardColors | null;
  regularPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercent: number;
  banner: string | null;
  isBundle: boolean;
  bundleItems: ShopBundleItem[];
  giftable: boolean;
  inDate: string | null;
  outDate: string | null;
  tileSize: string | null;
  sectionName?: string;
}

export interface ShopSection {
  id: string;
  name: string;
  nameFa: string | null;
  rank: number;
  index: number;
  entries: ShopEntry[];
}

export interface FortniteShopData {
  date: string;
  resetsAt: string;
  vbuckIcon: string;
  source: 'fortnite-api.com' | 'fn-api.cc';
  totalEntries: number;
  sections: ShopSection[];
}


export async function fetchFortniteShop(signal?: AbortSignal): Promise<FortniteShopData> {
  const response = await fetch(`${env.siteUrl}/api/fortnite-shop`, { signal });
  if (!response.ok) throw new Error('fortnite_shop_unavailable');
  return (await response.json()) as FortniteShopData;
}
