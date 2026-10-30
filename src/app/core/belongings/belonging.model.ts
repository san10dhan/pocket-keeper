export const BELONGING_CATEGORIES = [
  'Electronics',
  'Documents',
  'Accessories',
  'Home',
  'Clothing',
  'Other',
] as const;

export type BelongingCategory = (typeof BELONGING_CATEGORIES)[number];

export interface Belonging {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: BelongingCategory;
  location: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
  imageId?: string;
}

export type BelongingDraft = Pick<
  Belonging,
  'name' | 'description' | 'category' | 'location' | 'lastSeenAt'
> & {
  imageId?: string;
};
