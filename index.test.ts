import { describe, it, expect } from "bun:test";
import { keyBy, groupBy } from "./index";

interface Person {
  id: number;
  name: string;
  group: string;
}

/**
 * Our “maybe‑null” test data.
 * Note that some entries are null/undefined.
 */
const peopleMaybeNull: Array<Person | null | undefined> = [
  { id: 1, name: "Alice", group: "admin" },
  { id: 2, name: "Bob", group: "user" },
  null,
  { id: 3, name: "Charlie", group: "admin" },
  undefined,
  { id: 4, name: "Diana", group: "user" },
];

// Derive non‑null array from peopleMaybeNull.
const people = peopleMaybeNull.filter((p) => p != null);

//
// ===================== KEYBY TESTS =====================
//

describe("keyBy", () => {
  describe("Using non‑null data (property‑/function‑based)", () => {
    it('should create a map keyed by a property', () => {
      const result = keyBy(people, "id");
      expect(result.size).toBe(4);
      expect(result.get(1)?.name).toBe("Alice");
      expect(result.get(3)?.group).toBe("admin");
    });

    it('should create a map keyed by a property', () => {
      const result = keyBy(people, "name");
      expect(result.size).toBe(4);
      expect(result.get("Bob")?.id).toBe(2);
    });

    it("should allow specifying a property for the map value", () => {
      const result = keyBy(people, "id", "group");
      expect(result.size).toBe(4);
      expect(result.get(1)).toBe("admin");
    });

    it("should allow a function-based value transformer", () => {
      const result = keyBy(people, "name", (p) => p.name.toUpperCase());
      expect(result.size).toBe(4);
      expect(result.get("Alice")).toBe("ALICE");
    });

    it("should work with a function-based key extractor", () => {
      // Use a callback that adds the array index to the id.
      const result = keyBy(people, (p, i) => p.id + i);
      expect(result.size).toBe(4);
      // For the first item, key = 1 + 0 = 1.
      expect(result.get(1)?.name).toBe("Alice");
    });

    it("should allow a key function that returns nullish keys (when not excluding them)", () => {
      // For demonstration, return null for odd ids and the id for even ids.
      const result = keyBy(people, (p) => (p.id % 2 === 0 ? p.id : null));
      // For our data: id=1 and id=3 yield null (last one wins), and id=2 and id=4 produce 2 and 4.
      expect(result.size).toBe(3);
      expect(result.get(null)?.id).toBe(3);
      expect(result.get(2)?.name).toBe("Bob");
      expect(result.get(4)?.name).toBe("Diana");
    });

    it("should allow a value transformer that returns nullish values", () => {
      // Return null for "Alice", and the name otherwise.
      const result = keyBy(people, "id", (p) => (p.name === "Alice" ? null : p.name), { excludeNullish: true });
      expect(result.get(1)).toBeNull();
      expect(result.get(2)).toBe("Bob");
    });

    it("should overwrite earlier entries with later duplicate keys", () => {
      const duplicateData = [
        { id: 1, name: "First" },
        { id: 1, name: "Second" }
      ];
      const result = keyBy(duplicateData, "id");
      expect(result.size).toBe(1);
      expect(result.get(1)?.name).toBe("Second");
    });
  });

  describe("Using maybe‑null data with excludeNullish:true", () => {
    it("should skip nullish items", () => {
      const result = keyBy(peopleMaybeNull, "id", { excludeNullish: true });
      // Only the 4 valid Person objects are used.
      expect(result.size).toBe(4);
      expect(result.get(1)?.name).toBe("Alice");

      // Neither key extracted from null/undefined (or computed as nullish) will appear.
      // @ts-expect-error Types indicate we won't have null key: still checking anyway
      expect(result.has(null)).toBe(false);
      // @ts-expect-error Types indicate we won't have undefined key: still checking anyway
      expect(result.has(undefined)).toBe(false);
    });

    it("should allow property‑based key usage", () => {
      const result = keyBy(peopleMaybeNull, "name", { excludeNullish: true });
      expect(result.size).toBe(4);
      expect(result.get("Charlie")?.id).toBe(3);
    });

    it("should allow function‑based key extractor and value transformer", () => {
      const result = keyBy(peopleMaybeNull, (p) => p.id, (p) => p.group.toUpperCase(), { excludeNullish: true });
      expect(result.size).toBe(4);
      expect(result.get(1)).toBe("ADMIN");
    });
  });

  describe("Using maybe‑null data without excludeNullish (function‑based only)", () => {
    it("should include the nullish items in the output", () => {
      // When using a function‑based key extractor on a maybe‑null array,
      // the callback receives the raw (possibly null) items.
      const result = keyBy(peopleMaybeNull, (_p, idx) => idx);
      expect(result.size).toBe(6);
      // Index 2 corresponds to a null item, and index 4 to undefined.
      expect(result.get(2)).toBeNull();
      expect(result.get(4)).toBeUndefined();
    });
  });

  describe("Type‑check enforcement for keyBy", () => {
    it("should have non‑null callback parameter when using non‑null data", () => {
      keyBy(people, (p) => {
        // Here, p is inferred as Person (not Person|null), so properties are accessible directly.
        const id: number = p.id;
        return id;
      });
    });

    it("should have a callback parameter that is possibly null when using maybe‑null data without excludeNullish", () => {
      keyBy(peopleMaybeNull, (p) => {
        // p is inferred as Person|null|undefined.

        try {
          // @ts-expect-error testing unsafe access
          p.id
        } catch { /* Ignore runtime error */ }

        if (p) {
          const id: number = p.id;
          expect(typeof id).toBe("number");
        }
        return 0;
      });
    });

    it("should disallow using a property‑based key on a maybe‑null array without excludeNullish", () => {
      // @ts-expect-error — property‑based key usage is disallowed on maybe‑null arrays unless excludeNullish is set.
      keyBy(peopleMaybeNull, "id");
    });

    it("should allow property‑based key usage on maybe‑null arrays with excludeNullish", () => {
      // When excludeNullish is set, the function assumes all items are non‑null,
      // so property‑based extraction is allowed.
      keyBy(peopleMaybeNull, "id", { excludeNullish: true });
    });

    it("should error when using an array of non‑objects", () => {
      // @ts-expect-error: keyBy expects an array of objects, not primitives.
      keyBy([1, "foo"], "toString");
    });
  });

  it("should return an empty map for an empty array", () => {
    const result = keyBy([], "id");
    expect(result.size).toBe(0);
  });

  it("should handle empty strings as valid keys/values", () => {
    const data = [{ id: "", name: "EmptyKey" }];
    const result = keyBy(data, "id");
    expect(result.has("")).toBe(true);
    expect(result.get("")).toEqual(data[0]);
  });

  it("should not mutate the input array", () => {
    const data = [{ id: 1 }, { id: 2 }];
    const copy = [...data];
    keyBy(data, "id");
    expect(data).toEqual(copy);
  });

  it("should handle non-primitive keys", () => {
    const data = [{ id: 1 }, { id: 2 }];
    const keyObj = { key: "obj" };
    const result = keyBy(data, () => keyObj);
    // Since the same object is used as the key, all entries should map to the last one.
    expect(result.size).toBe(1);
  });

  it("should throw an error when non-array input is provided", () => {
    // Here, we pass a string instead of an array.
    expect(() => {
      // @ts-expect-error: intentional misuse for testing purposes
      keyBy("not an array", "id");
    }).toThrow();

    expect(() => {
      // @ts-expect-error: intentional misuse for testing purposes
      keyBy(42, "id");
    }).toThrow();
  });
});

//
// ===================== GROUPBY TESTS =====================
//

describe("groupBy", () => {
  describe("Using non‑null data (property‑/function‑based)", () => {
    it('should group items by a property', () => {
      const result = groupBy(people, "group");
      // There should be two groups: "admin" and "user"
      expect(result.size).toBe(2);
      const adminGroup = result.get("admin");
      expect(adminGroup?.length).toBe(2);
      expect(adminGroup?.[0].name).toBe("Alice");
      expect(adminGroup?.[1].name).toBe("Charlie");
    });

    it("should allow specifying a property for the grouped values", () => {
      const result = groupBy(people, "group", "name");
      // Expected: "admin" → ["Alice", "Charlie"], "user" → ["Bob", "Diana"]
      expect(result.get("admin")).toEqual(["Alice", "Charlie"]);
      expect(result.get("user")).toEqual(["Bob", "Diana"]);
    });

    it("should allow function‑based key extractor and value transformer", () => {
      // Group by even/odd id and return upper‑cased names.
      const result = groupBy(people, (p, i) => p.id % 2 === 0, (p, i) => p.name.toUpperCase());
      expect(result.get(true)).toEqual(["BOB", "DIANA"]);
      expect(result.get(false)).toEqual(["ALICE", "CHARLIE"]);
    });

    it("should allow a key callback that returns nullish keys", () => {
      // Use a callback that returns null for odd ids.
      const result = groupBy(people, (p) => (p.id % 2 === 0 ? p.id : null));
      // For our data, odd items (id 1 and 3) are grouped together under null.
      expect(result.size).toBe(3);
      expect(result.get(null)?.map((p) => p.id)).toEqual([1, 3]);
      expect(result.get(2)?.[0].name).toBe("Bob");
    });

    it("should allow a value transformer that returns nullish values", () => {
      // For group "admin", return null for "Alice" and the name for others.
      const result = groupBy(people, "group", (p) => (p.name === "Alice" ? null : p.name), { excludeNullish: true });
      // The "admin" group should have [null, "Charlie"].
      expect(result.get("admin")).toEqual([null, "Charlie"]);
    });
  });

  describe("Using maybe‑null data with excludeNullish:true", () => {
    it("should skip nullish items", () => {
      const result = groupBy(peopleMaybeNull, "group", { excludeNullish: true });
      // Only the 4 valid Person objects are grouped.
      expect(result.size).toBe(2);
    });

    it("should allow property‑based key usage", () => {
      const result = groupBy(peopleMaybeNull, "group", "id", { excludeNullish: true });
      expect(result.get("admin")).toEqual([1, 3]);
      expect(result.get("user")).toEqual([2, 4]);
    });

    it("should allow function‑based key extractor and value transformer", () => {
      const result = groupBy(peopleMaybeNull, (p, i) => p.id, (p, i) => p.name.toLowerCase(), { excludeNullish: true });
      // Each group here should be a one‑element array since keys (the id) are unique.
      expect(result.get(1)).toEqual(["alice"]);
      expect(result.get(3)).toEqual(["charlie"]);
    });
  });

  describe("Using maybe‑null data without excludeNullish (function‑based only)", () => {
    it("should include the nullish items in the groups", () => {
      const result = groupBy(peopleMaybeNull, (_p, i) => i);
      // At index 2 we expect [null] and at index 4 we expect [undefined].
      expect(result.get(2)).toEqual([null]);
      expect(result.get(4)).toEqual([undefined]);
    });
  });

  describe("Type‑check enforcement for groupBy", () => {
    it("should have non‑null callback parameter when using non‑null data", () => {
      groupBy(people, (p) => {
        // p is inferred as Person.
        const name: string = p.name;
        return p.group;
      });
    });

    it("should have a callback parameter that is possibly null when using maybe‑null data without excludeNullish", () => {
      groupBy(peopleMaybeNull, (p) => {
        // p is inferred as Person|null|undefined.

        try {
          // @ts-expect-error testing unsafe access
          p.id
        } catch { /* Ignore runtime error */ }

        if (p) {
          const id: number = p.id;
        }
        return 0;
      });
    });

    it("should disallow using a property‑based key on a maybe‑null array without excludeNullish", () => {
      // @ts-expect-error — property‑based key usage is disallowed on maybe‑null arrays unless excludeNullish is specified.
      groupBy(peopleMaybeNull, "group");
    });

    it("should error when using an array of non‑objects", () => {
      // @ts-expect-error: groupBy expects an array of objects, not primitives.
      groupBy([1, "foo"], "valueOf");
    });
  });

  it("should return an empty map for an empty array", () => {
    const result = groupBy([], "group");
    expect(result.size).toBe(0);
  });

  it("should preserve order in arrays", () => {
    const data = [
      { id: 1, group: "A" },
      { id: 2, group: "B" },
      { id: 3, group: "A" }
    ];
    const result = groupBy(data, "group");
    expect(result.get("A")).toEqual([data[0], data[2]]);
  });

  it("should throw an error when non-array input is provided", () => {
    expect(() => {
      // @ts-expect-error: intentional misuse for testing purposes
      groupBy({} as any, "group");
    }).toThrow();
  });
});
