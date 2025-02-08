import { describe, it, expect } from "bun:test";
import { keyBy, groupBy } from "./index";

interface Person {
  id: number;
  name: string;
  group: string;
}

/**
 * Strict array: no null/undefined
 * => safe to use property-based key with no excludeNullish option
 */
const peopleNonNull: Person[] = [
  { id: 1, name: "Alice", group: "admin" },
  { id: 2, name: "Bob", group: "user" },
  { id: 3, name: "Charlie", group: "admin" },
  { id: 4, name: "Diana", group: "user" },
];

/**
 * Array containing nullish
 * => must set excludeNullish: true if using property-based key,
 * or use function-based key (with optional excludeNullish).
 */
const peopleMaybeNull: Array<Person | null | undefined> = [
  { id: 1, name: "Alice", group: "admin" },
  { id: 2, name: "Bob", group: "user" },
  null,
  { id: 3, name: "Charlie", group: "admin" },
  undefined,
  { id: 4, name: "Diana", group: "user" },
];

/** ============ keyBy Tests ============ */
describe("keyBy - property-based key, no excludeNullish => must use peopleNonNull", () => {
  it("creates a Map keyed by a numeric property name", () => {
    const result = keyBy(peopleNonNull, "id");
    let check: Map<number, Person> = result;
    expect(result.size).toBe(4);

    const charlie = result.get(3);
    expect(charlie?.name).toBe("Charlie");
    expect(charlie?.group).toBe("admin");
  });

  it("creates a Map keyed by a string property name", () => {
    const result = keyBy(peopleNonNull, "name");
    let check: Map<string, Person> = result;

    expect(result.size).toBe(4);
    expect(result.get("Bob")?.id).toBe(2);
  });

  it("overwrites items with the same key", () => {
    const data: Person[] = [
      { id: 1, name: "First", group: "test" },
      { id: 1, name: "Second", group: "test2" },
    ];
    const result = keyBy(data, "id");
    expect(result.size).toBe(1);
    expect(result.get(1)?.name).toBe("Second");
  });

  it("type checks property key usage", () => {
    keyBy(peopleNonNull, "id");
    keyBy(peopleNonNull, "name");

    // @ts-expect-error 'unknownProp' does not exist
    keyBy(peopleNonNull, "unknownProp");

    // @ts-expect-error 123 is not a valid property key
    keyBy(peopleNonNull, 123);
  });
});

describe("keyBy - property-based key, excludeNullish => can use peopleMaybeNull", () => {
  it("skips null and undefined items", () => {
    const data: ({ id: number } | null | undefined)[] = [null, undefined];
    const result = keyBy(data, "id", { excludeNullish: true });
    expect(result.size).toBe(0);
  });

  it("creates a Map keyed by 'id', skipping nullish", () => {
    const result = keyBy(peopleMaybeNull, "id", { excludeNullish: true });
    let check: Map<number, Person> = result;
    expect(result.size).toBe(4);

    const charlie = result.get(3);
    expect(charlie?.name).toBe("Charlie");
  });

  it("creates a Map keyed by 'name', skipping nullish", () => {
    const result = keyBy(peopleMaybeNull, "name", { excludeNullish: true });
    let check: Map<string, Person> = result;
    expect(result.size).toBe(4);
    expect(result.get("Alice")?.id).toBe(1);
  });

  it("allows specifying a property value for the map value", () => {
    const result = keyBy(peopleMaybeNull, "id", "name", { excludeNullish: true });
    let check: Map<number, string> = result;
    expect(result.size).toBe(4);
    expect(result.get(1)).toBe("Alice");
  });

  it("allows specifying a function value for the map value", () => {
    // key = "name", value => p.group.toUpperCase()
    const result = keyBy(
      peopleMaybeNull,
      "name",
      (p) => p.group.toUpperCase(),
      { excludeNullish: true }
    );
    let check: Map<string, string> = result;

    expect(result.size).toBe(4);
    expect(result.get("Alice")).toBe("ADMIN");
  });
});

describe("keyBy - function-based key (always can use maybeNull)", () => {
  it("skips null/undefined if excludeNullish=true", () => {
    const byDoubleId = keyBy(
      peopleMaybeNull,
      (p) => p.id * 2,
      { excludeNullish: true }
    );
    let checkNumKey: Map<number, Person> = byDoubleId;
    expect(byDoubleId.size).toBe(4);
    expect(byDoubleId.get(2)?.name).toBe("Alice");
  });

  it("includes null/undefined if excludeNullish not set", () => {
    const result = keyBy(peopleMaybeNull, (_p, idx) => idx);
    expect(result.size).toBe(6); // includes them
    expect(result.get(2)).toBeNull();
    expect(result.get(4)).toBeUndefined();
  });

  it("function-based key + function-based value", () => {
    const result = keyBy(
      peopleMaybeNull,
      (p) => p.id % 2,    // key
      (p) => p.name,      // value
      { excludeNullish: true }
    );
    // Collisions: id=1,3 => key=1 => last one wins => "Charlie"
    // id=2,4 => key=0 => last one wins => "Diana"
    expect(result.size).toBe(2);
    expect(result.get(1)).toBe("Charlie");
    expect(result.get(0)).toBe("Diana");
  });
});

describe("groupBy - property-based key, no excludeNullish => must use peopleNonNull", () => {
  it("groups items by a numeric property", () => {
    const result = groupBy(peopleNonNull, "id");
    let check: Map<number, Person[]> = result;
    expect(result.size).toBe(4);

    const group1 = result.get(1);
    expect(group1?.length).toBe(1);
    expect(group1?.[0].name).toBe("Alice");
  });

  it("groups items by a string property", () => {
    const result = groupBy(peopleNonNull, "group");
    let check: Map<string, Person[]> = result;
    expect(result.size).toBe(2);

    const adminGroup = result.get("admin");
    expect(adminGroup?.length).toBe(2);
    expect(adminGroup?.[0].name).toBe("Alice");
    expect(adminGroup?.[1].name).toBe("Charlie");
  });

  it("handles multiple items with same key", () => {
    const data: Person[] = [
      { id: 1, group: "A", name: "Foo" },
      { id: 2, group: "A", name: "Bar" },
    ];
    const result = groupBy(data, "group");
    expect(result.size).toBe(1);
    const arr = result.get("A");
    expect(arr?.length).toBe(2);
  });
});

describe("groupBy - property-based key, excludeNullish => can use maybeNull array", () => {
  it("skips null and undefined items", () => {
    const data: ({ id: number } | null | undefined)[] = [null, undefined];
    const result = groupBy(data, "id", { excludeNullish: true });
    expect(result.size).toBe(0);
  });

  it("groups items by a numeric property (skip nullish)", () => {
    const result = groupBy(peopleMaybeNull, "id", { excludeNullish: true });
    let check: Map<number, Person[]> = result;
    expect(result.size).toBe(4);

    const group1 = result.get(1);
    expect(group1?.[0].name).toBe("Alice");
  });

  it("groups items by a string property (skip nullish)", () => {
    const result = groupBy(peopleMaybeNull, "group", { excludeNullish: true });
    let check: Map<string, Person[]> = result;
    expect(result.size).toBe(2);

    const adminGroup = result.get("admin");
    expect(adminGroup?.length).toBe(2);
  });

  it("allows specifying a property value for grouped items", () => {
    const result = groupBy(peopleMaybeNull, "group", "name", { excludeNullish: true });
    let check: Map<string, string[]> = result;

    expect(result.get("admin")).toEqual(["Alice", "Charlie"]);
    expect(result.get("user")).toEqual(["Bob", "Diana"]);
  });

  it("allows specifying a function value for grouped items", () => {
    const result = groupBy(
      peopleMaybeNull,
      "group",
      (p) => p.name.toUpperCase(),
      { excludeNullish: true }
    );
    let check: Map<string, string[]> = result;

    expect(result.get("admin")).toEqual(["ALICE", "CHARLIE"]);
    expect(result.get("user")).toEqual(["BOB", "DIANA"]);
  });
});

describe("groupBy - function-based key", () => {
  it("groups items by callback returning any type (skip nullish)", () => {
    const byOddEven = groupBy(
      peopleMaybeNull,
      (p) => p.id % 2 === 0,
      { excludeNullish: true }
    );
    let check: Map<boolean, Person[]> = byOddEven;
    expect(byOddEven.size).toBe(2);

    expect(byOddEven.get(true)?.map((p) => p.name)).toEqual(["Bob", "Diana"]);
    expect(byOddEven.get(false)?.map((p) => p.name)).toEqual(["Alice", "Charlie"]);
  });

  it("function-based key, excludeNullish=false => includes the nullish in the map", () => {
    const result = groupBy(peopleMaybeNull, (_p, i) => i);
    
    expect(result.size).toBe(6);
    expect(result.get(2)).toEqual([null]);
    expect(result.get(4)).toEqual([undefined]);
  });

  it("function-based key with function-based value", () => {
    const indexedGroups = groupBy(
      peopleMaybeNull,
      (person, idx) => `${person.group}-${idx}`,
      (person, idx) => `${person.name}:${idx}`,
      { excludeNullish: true }
    );
    expect(indexedGroups.get("admin-0")).toEqual(["Alice:0"]);
    expect(indexedGroups.get("user-1")).toEqual(["Bob:1"]);
  });
});

describe("type-check enforcement for property-based key + maybe-null array", () => {
  it("should fail if we pass maybe-null array but no excludeNullish", () => {
    // @ts-expect-error
    keyBy(peopleMaybeNull, "id");
    // @ts-expect-error
    groupBy(peopleMaybeNull, "id");
  });
});
