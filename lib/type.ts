import { Post } from "./wordpress";

export type Category = {
  nepali: string;
  english: string;
  slug: string;
};

export interface HomePagePosts {
  featured: Post[];
  trending: Post[];
  latest: Post[];
  politics: Post[];
  society: Post[];
  breaking: Post[];
  economy: Post[];
  technology: Post[];
  arts: Post[];
  sports: Post[];
  world: Post[];
  podcast: Post[];
  multimedia?: Post[];
  international?: Post[];
  opinion?: Post[];
  legal?: Post[];
  health?: Post[];
  exclusive?: Post[];
}

export interface DbPostItem {
  id: string;
  databaseId?: number;
  uri?: string | null;
  title: string | null;
  slug: string;
  status?: string;
  link?: string;
  date?: string;
  content: string | null;
  featuredImage?: any;
  excerpt?: string | null;
  images?: string[];
  categorySlug?: string;
  categoryName?: string;
  author?: {
    node?: {
      name?: string;
    };
  } | null;
  isBreaking?: boolean;
  isFeatured?: boolean;
}

export interface DbHomePagePosts {
  featured: DbPostItem[];
  trending: DbPostItem[];
  latest: DbPostItem[];
  politics: DbPostItem[];
  society: DbPostItem[];
  breaking: DbPostItem[];
  economy: DbPostItem[];
  technology: DbPostItem[];
  arts: DbPostItem[];
  sports: DbPostItem[];
  world: DbPostItem[];
  podcast: DbPostItem[];
  multimedia?: DbPostItem[];
  international?: DbPostItem[];
  opinion?: DbPostItem[];
  legal?: DbPostItem[];
  health?: DbPostItem[];
  exclusive?: DbPostItem[];
}

export interface BreakingNewsType {
  title: string;
  slug: string;
  image?: string;
  excerpt?: string;
  link?: string;
  databaseId?: number;
  categorySlug?: string;
}

export type CardType = {
  title:string,
  content:string,
  images:string[],
  link:string
}

export interface BannerAd {
  id: string;                 // unique identifier
  title: string;  
  adTitle:string;            // admin reference
  slug?: string;              // optional, for dynamic routes
  category?: string;          // optional, filtering
  adImage?: string;           // image URL
  link?: string;              // clickable link
  priority?: number;          // optional, for ordering
  active?: boolean;           // enable/disable
}

