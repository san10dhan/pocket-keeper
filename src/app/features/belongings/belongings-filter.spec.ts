import { describe, expect, it } from 'vitest';
import { filterBelongings } from './belongings-filter';

const items = [
  {
    name: 'Laptop',
    location: 'Study room',
    category: 'Electronics',
    description: 'Work laptop',
    updatedAt: '2026-03-10T10:00:00.000Z',
  },
  {
    name: 'Chair',
    location: 'Living room',
    category: 'Furniture',
    description: 'Office chair',
    updatedAt: '2026-03-12T10:00:00.000Z',
  },
  {
    name: 'Camera',
    location: 'Bedroom',
    category: 'Electronics',
    description: 'Travel camera',
    updatedAt: '2026-03-11T10:00:00.000Z',
  },
];

describe('filterBelongings', () => {
  it('searches by name', () => {
    const result = filterBelongings(items, {
      query: 'laptop',
      category: 'All',
      sortOrder: 'newest',
    });

    expect(result.map((item) => item.name)).toEqual(['Laptop']);
  });

  it('searches by location', () => {
    const result = filterBelongings(items, {
      query: 'living room',
      category: 'All',
      sortOrder: 'newest',
    });

    expect(result.map((item) => item.name)).toEqual(['Chair']);
  });

  it('filters by category', () => {
    const result = filterBelongings(items, {
      query: '',
      category: 'Electronics',
      sortOrder: 'newest',
    });

    expect(result.map((item) => item.name)).toEqual(['Camera', 'Laptop']);
  });

  it('sorts by name', () => {
    const result = filterBelongings(items, {
      query: '',
      category: 'All',
      sortOrder: 'name',
    });

    expect(result.map((item) => item.name)).toEqual(['Camera', 'Chair', 'Laptop']);
  });

  it('does not mutate the original array', () => {
    const original = [...items];

    filterBelongings(items, {
      query: '',
      category: 'All',
      sortOrder: 'oldest',
    });

    expect(items).toEqual(original);
  });
});
