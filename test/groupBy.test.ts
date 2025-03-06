import { describe, it, expect } from 'bun:test';
import { groupBy } from '../src/index';
import { people, peopleMaybeNull } from './test-data';

describe('groupBy', () => {
  describe('Using non-null data (property-/function-based)', () => {
    it('should group items by a property', () => {
      const result = groupBy(people, 'group');
      expect(result.size).toBe(2);
      const adminGroup = result.get('admin');
      expect(adminGroup?.length).toBe(2);
      expect(adminGroup?.[0].name).toBe('Alice');
    });

    it('should group with a property value transformer', () => {
      const result = groupBy(people, 'group', 'name');
      expect(result.get('admin')).toEqual(['Alice', 'Charlie']);
    });

    it('should use function-based key and value', () => {
      const result = groupBy(
        people,
        (p) => p.id % 2 === 0,
        (p) => p.name.toUpperCase(),
      );
      expect(result.get(true)).toEqual(['BOB', 'DIANA']);
    });

    it('should handle nullish keys', () => {
      const result = groupBy(people, (p) => (p.id % 2 === 0 ? p.id : null));
      expect(result.size).toBe(3);
      expect(result.get(null)?.map((p) => p.id)).toEqual([1, 3]);
    });

    it('should handle nullish values with excludeNullish', () => {
      const result = groupBy(
        people,
        'group',
        (p) => (p.name === 'Alice' ? null : p.name),
        { excludeNullish: true },
      );
      expect(result.get('admin')).toEqual([null, 'Charlie']);
    });
  });

  describe('Using maybe-null data with excludeNullish: true', () => {
    it('should skip nullish items', () => {
      const result = groupBy(peopleMaybeNull, 'group', {
        excludeNullish: true,
      });
      expect(result.size).toBe(2);
    });

    it('should support property-based key and value', () => {
      const result = groupBy(peopleMaybeNull, 'group', 'id', {
        excludeNullish: true,
      });
      expect(result.get('admin')).toEqual([1, 3]);
    });
  });

  describe('Using maybe-null data without excludeNullish', () => {
    it('should include nullish items with function-based key', () => {
      const result = groupBy(peopleMaybeNull, (_p, i) => i);
      expect(result.get(2)).toEqual([null]);
      expect(result.get(4)).toEqual([undefined]);
    });
  });

  describe('Type-check enforcement', () => {
    it('should enforce non-null callback for non-null data', () => {
      groupBy(people, (p) => p.group);
    });

    it('should allow nullish callback without excludeNullish', () => {
      groupBy(peopleMaybeNull, (p) => (p ? p.id : 0));
    });

    it('should disallow property key on maybe-null without excludeNullish', () => {
      // @ts-expect-error
      groupBy(peopleMaybeNull, 'group');
    });

    it('should disallow non-object arrays', () => {
      // @ts-expect-error
      groupBy([1, 'foo'], 'valueOf');
    });

    it('should filter null/undefined key types when using excludeNullish', () => {
      const result = groupBy([{ id: 1 }, null, undefined], 'id', {
        excludeNullish: true,
      });
      // @ts-expect-error ✅ No null allowed in map keys
      expect(result.has(null)).toBe(false);
      // @ts-expect-error ✅ No undefined allowed in map keys
      expect(result.has(undefined)).toBe(false);
    });
  });

  it('should return empty map for empty array', () => {
    const result = groupBy([], 'group');
    expect(result.size).toBe(0);
  });

  it('should preserve order in grouped arrays', () => {
    const data = [
      { id: 1, group: 'A' },
      { id: 2, group: 'B' },
      { id: 3, group: 'A' },
    ];
    const result = groupBy(data, 'group');
    expect(result.get('A')).toEqual([data[0], data[2]]);
  });

  it('should throw on non-array input', () => {
    expect(() => {
      // @ts-expect-error
      groupBy({} as any, 'group');
    }).toThrow();
  });
  
  it('should work with readonly arrays', () => {
    const readonlyArray: readonly { readonly id: number, readonly group: string }[] = [
      { id: 1, group: 'A' },
      { id: 2, group: 'B' },
      { id: 3, group: 'A' }
    ];
    const result = groupBy(readonlyArray, 'group');
    expect(result.size).toBe(2);
    expect(result.get('A')?.length).toBe(2);
    expect(result.get('B')?.length).toBe(1);
  });
});
