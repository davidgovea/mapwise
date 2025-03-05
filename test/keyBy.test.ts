import { describe, it, expect } from 'bun:test';
import { keyBy } from '../src/index';
import { people, peopleMaybeNull } from './test-data';

describe('keyBy', () => {
  describe('Using non-null data (property-/function-based)', () => {
    it('should create a map keyed by a property', () => {
      const result = keyBy(people, 'id');
      expect(result.size).toBe(4);
      expect(result.get(1)?.name).toBe('Alice');
      expect(result.get(3)?.group).toBe('admin');
    });

    it('should create a map keyed by a property with a property value', () => {
      const result = keyBy(people, 'id', 'group');
      expect(result.size).toBe(4);
      expect(result.get(1)).toBe('admin');
    });

    it('should use a function-based value transformer', () => {
      const result = keyBy(people, 'name', (p) => p.name.toUpperCase());
      expect(result.size).toBe(4);
      expect(result.get('Alice')).toBe('ALICE');
    });

    it('should use a function-based key extractor', () => {
      const result = keyBy(people, (p, i) => p.id + i);
      expect(result.size).toBe(4);
      expect(result.get(1)?.name).toBe('Alice');
    });

    it('should handle nullish keys when not excluded', () => {
      const result = keyBy(people, (p) => (p.id % 2 === 0 ? p.id : null));
      expect(result.size).toBe(3);
      expect(result.get(null)?.id).toBe(3);
    });

    it('should handle nullish values with excludeNullish', () => {
      const result = keyBy(
        people,
        'id',
        (p) => (p.name === 'Alice' ? null : p.name),
        { excludeNullish: true },
      );
      expect(result.get(1)).toBeNull();
    });

    it('should overwrite duplicate keys with later entries', () => {
      const duplicateData = [
        { id: 1, name: 'First' },
        { id: 1, name: 'Second' },
      ];
      const result = keyBy(duplicateData, 'id');
      expect(result.size).toBe(1);
      expect(result.get(1)?.name).toBe('Second');
    });
  });

  describe('Using maybe-null data with excludeNullish: true', () => {
    it('should skip nullish items', () => {
      const result = keyBy(peopleMaybeNull, 'id', { excludeNullish: true });
      expect(result.size).toBe(4);
      expect(result.get(1)?.name).toBe('Alice');
    });

    it('should support function-based key and value', () => {
      const result = keyBy(
        peopleMaybeNull,
        (p) => p.id,
        (p) => p.group.toUpperCase(),
        { excludeNullish: true },
      );
      expect(result.size).toBe(4);
      expect(result.get(1)).toBe('ADMIN');
    });
  });

  describe('Using maybe-null data without excludeNullish', () => {
    it('should include nullish items with function-based key', () => {
      const result = keyBy(peopleMaybeNull, (_p, idx) => idx);
      expect(result.size).toBe(6);
      expect(result.get(2)).toBeNull();
      expect(result.get(4)).toBeUndefined();
    });
  });

  describe('Type-check enforcement', () => {
    it('should enforce non-null callback parameter for non-null data', () => {
      keyBy(people, (p) => p.id);
    });

    it('should allow nullish callback parameter without excludeNullish', () => {
      keyBy(peopleMaybeNull, (p) => (p ? p.id : 0));
    });

    it('should disallow property key on maybe-null without excludeNullish', () => {
      // @ts-expect-error
      keyBy(peopleMaybeNull, 'id');
    });

    it('should disallow non-object arrays', () => {
      // @ts-expect-error
      keyBy([1, 'foo'], 'toString');
    });

    it('should filter null/undefined key types when using excludeNullish', () => {
      const result = keyBy([{ id: 1 }, null, undefined], 'id', {
        excludeNullish: true,
      });
      // @ts-expect-error ✅ No null allowed in map keys
      expect(result.has(null)).toBe(false);
      // @ts-expect-error ✅ No undefined allowed in map keys
      expect(result.has(undefined)).toBe(false);
    });
  });

  it('should return empty map for empty array', () => {
    const result = keyBy([], 'id');
    expect(result.size).toBe(0);
  });

  it('should handle empty string keys', () => {
    const data = [{ id: '', name: 'EmptyKey' }];
    const result = keyBy(data, 'id');
    expect(result.has('')).toBe(true);
  });

  it('should not mutate input array', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const copy = [...data];
    keyBy(data, 'id');
    expect(data).toEqual(copy);
  });

  it('should throw on non-array input', () => {
    expect(() => {
      // @ts-expect-error
      keyBy('not an array', 'id');
    }).toThrow();
  });
});
