import { describe, it, expect } from "bun:test";
import { keyBy, groupBy } from "./index";

interface Person {
  id: number;
  name: string;
  group: string;
}

const people: (Person | null | undefined)[] = [
  { id: 1, name: "Alice", group: "admin" },
  { id: 2, name: "Bob", group: "user" },
  null,
  { id: 3, name: "Charlie", group: "admin" },
  undefined,
  { id: 4, name: "Diana", group: "user" },
];

describe("keyBy", () => {
  it("creates a Map keyed by a numeric property name", () => {
    const result = keyBy(people, "id");
    // Should be Map<number, Person>
    type ResultType = typeof result; 
    let check: Map<number, Person> = result;
    expect(result.size).toBe(4);

    const charlie = result.get(3);
    expect(charlie?.name).toBe("Charlie");
    expect(charlie?.group).toBe("admin");
  });

  it("creates a Map keyed by a string property name", () => {
    const result = keyBy(people, "name");
    let check: Map<string, Person> = result;

    expect(result.size).toBe(4);

    const bob = result.get("Bob");
    expect(bob?.id).toBe(2);
  });

  it("creates a Map keyed by a function (any return type)", () => {
    const byDoubleId = keyBy(people, (p) => p.id * 2);
    let checkNumKey: Map<number, Person> = byDoubleId;

    expect(byDoubleId.size).toBe(4);
    expect(byDoubleId.get(2)?.name).toBe("Alice");

    const byIsAdmin = keyBy(people, (p) => p.group === "admin");
    let checkBoolKey: Map<boolean, Person> = byIsAdmin;

    expect(byIsAdmin.size).toBe(2);
    expect(byIsAdmin.get(true)?.name).toBe("Charlie");
  });

  it("skips null and undefined items", () => {
    const data = [null, undefined];
    const result = keyBy(data, "id" as any);
    expect(result.size).toBe(0);
  });

  it("overwrites items with the same key", () => {
    const data = [
      { id: 1, name: "First", group: "test" },
      { id: 1, name: "Second", group: "test2" },
    ];
    const result = keyBy(data, "id");
    expect(result.size).toBe(1);
    expect(result.get(1)?.name).toBe("Second");
  });

  it("type checks property key usage", () => {
    // Good usage: property key is 'id' or 'name'
    keyBy(people, "id"); 
    keyBy(people, "name");

    // @ts-expect-error 'unknownProp' does not exist on Person
    keyBy(people, "unknownProp");

    // @ts-expect-error 123 is not a valid property key
    keyBy(people, 123);
  });

  it("type checks function usage", () => {
    keyBy(people, (p) => p.id);
    keyBy(people, (p) => new Date(p.id * 1000));
    keyBy(people, (p) => `${p.id}-${p.name}`);

    // @ts-expect-error - function param must be Person, not number
    keyBy(people, (n: number) => n * 2);
  });

  // NEW TESTS for Value Getter
  it("allows specifying a property value for the map value", () => {
    // key by "id", value is "name"
    const result = keyBy(people, "id", "name");
    let check: Map<number, string> = result;

    expect(result.size).toBe(4);
    expect(result.get(1)).toBe("Alice");
  });

  it("allows specifying a function value for the map value", () => {
    // key by "name", value is (p) => p.group
    const result = keyBy(people, "name", (p) => p.group.toUpperCase());
    let check: Map<string, string> = result;

    expect(result.size).toBe(4);
    expect(result.get("Alice")).toBe("ADMIN");
  });

  it("works with function key + function value", () => {
    // key = p => p.name.length, value = p => p.name.toUpperCase()
    const result = keyBy(people, (p) => p.name.length, (p) => p.name.toUpperCase());
    // This yields Map<number, string>
    let check: Map<number, string> = result;

    // Notice collisions can happen: "Bob" (3 letters) and "Eve" (3 letters) etc.
    // Here, we only have "Alice"(5), "Bob"(3), "Charlie"(7), "Diana"(5).
    // So final map size might reflect overwrites for same lengths.
    expect(Array.from(result.keys()).sort()).toEqual([3,5,7]);
    expect(result.get(3)).toBe("BOB"); // Bob overwrote any other length=3
    expect(result.get(5)).toBe("DIANA");
    expect(result.get(7)).toBe("CHARLIE");
  });
});

describe("groupBy", () => {
  it("groups items by a numeric property", () => {
    const result = groupBy(people, "id");
    let check: Map<number, Person[]> = result;
    expect(result.size).toBe(4);

    const group1 = result.get(1);
    expect(group1?.length).toBe(1);
    expect(group1?.[0].name).toBe("Alice");
  });

  it("groups items by a string property", () => {
    const result = groupBy(people, "group");
    let check: Map<string, Person[]> = result;

    expect(result.size).toBe(2);

    const adminGroup = result.get("admin");
    expect(adminGroup?.length).toBe(2);
    expect(adminGroup?.[0].name).toBe("Alice");
    expect(adminGroup?.[1].name).toBe("Charlie");
  });

  it("groups items by callback returning any type", () => {
    const byOddEven = groupBy(people, (p) => p.id % 2 === 0);
    let check: Map<boolean, Person[]> = byOddEven;
    expect(byOddEven.size).toBe(2);

    expect(byOddEven.get(true)?.map((p) => p.name)).toEqual(["Bob", "Diana"]);
    expect(byOddEven.get(false)?.map((p) => p.name)).toEqual(["Alice", "Charlie"]);
  });

  it("skips null and undefined items", () => {
    const data = [null, undefined];
    const result = groupBy(data, "id" as any);
    expect(result.size).toBe(0);
  });

  it("handles multiple items with same key", () => {
    const data = [
      { id: 1, group: "A", name: "Foo" },
      { id: 2, group: "A", name: "Bar" },
    ];
    const result = groupBy(data, "group");
    expect(result.size).toBe(1);

    const arr = result.get("A");
    expect(arr?.length).toBe(2);
    expect(arr?.[0].name).toBe("Foo");
    expect(arr?.[1].name).toBe("Bar");
  });

  it("type checks property key usage in groupBy", () => {
    groupBy(people, "name"); // valid

    // @ts-expect-error - 'notARealKey' does not exist on Person
    groupBy(people, "notARealKey");
  });

  it("type checks function usage in groupBy", () => {
    groupBy(people, (p) => p.name.toLowerCase()); // valid
    groupBy(people, (p) => p.id * 100);

    // @ts-expect-error - param must be a Person, not a boolean
    groupBy(people, (b: boolean) => (b ? "yes" : "no"));
  });

  // NEW TESTS for Value Getter
  it("allows specifying a property value for grouped items", () => {
    const result = groupBy(people, "group", "name");
    // => Map<string, string[]>
    let check: Map<string, string[]> = result;

    const adminGroup = result.get("admin");
    expect(adminGroup).toEqual(["Alice", "Charlie"]);

    const userGroup = result.get("user");
    expect(userGroup).toEqual(["Bob", "Diana"]);
  });

  it("allows specifying a function value for grouped items", () => {
    const result = groupBy(people, (p) => p.group, (p) => p.name.toUpperCase());
    // => Map<string, string[]>
    let check: Map<string, string[]> = result;

    const adminGroup = result.get("admin");
    expect(adminGroup).toEqual(["ALICE", "CHARLIE"]);

    const userGroup = result.get("user");
    expect(userGroup).toEqual(["BOB", "DIANA"]);
  });
});
