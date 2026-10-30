export interface FilterableBelonging {
  name: string;
  location: string;
  category: string;
  description?: string;
  updatedAt: string;
}

export interface BelongingsFilterOptions {
  query: string;
  category: string;
  sortOrder: 'newest' | 'oldest' | 'name';
}

export function filterBelongings<T extends FilterableBelonging>(
  items: readonly T[],
  options: BelongingsFilterOptions,
): T[] {
  const query = options.query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    const matchesSearch = [item.name, item.location, item.description ?? ''].some((value) =>
      value.toLowerCase().includes(query),
    );

    const matchesCategory = options.category === 'All' || item.category === options.category;

    return matchesSearch && matchesCategory;
  });

  return [...filtered].sort((a, b) => {
    switch (options.sortOrder) {
      case 'name':
        return a.name.localeCompare(b.name);

      case 'oldest':
        return a.updatedAt.localeCompare(b.updatedAt);

      case 'newest':
      default:
        return b.updatedAt.localeCompare(a.updatedAt);
    }
  });
}
