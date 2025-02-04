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
  it("creates a Map keyed by a property name", () => {
    const result = keyBy(people, "id");
    expect(result.size).toBe(4);

    // Check a known key
    const charlie = result.get(3);
    expect(charlie?.name).toBe("Charlie");
    expect(charlie?.group).toBe("admin");
  });

  it("creates a Map keyed by a function", () => {
    const result = keyBy(people, (p) => p.name);
    expect(result.size).toBe(4);

    // Check a known key from function
    const bob = result.get("Bob");
    expect(bob?.id).toBe(2);
    expect(bob?.group).toBe("user");
  });

  it("overwrites items with the same key", () => {
    const data = [
      { id: 1, name: "X", group: "test" },
      { id: 1, name: "Y", group: "test2" },
    ];
    const result = keyBy(data, "id");

    // Because both have id=1, the second item overwrites the first.
    expect(result.size).toBe(1);
    const item = result.get(1);
    expect(item?.name).toBe("Y");
  });

  it("skips null and undefined items", () => {
    const data = [null, undefined];
    const result = keyBy(data, "id" as any); // as any for test convenience
    expect(result.size).toBe(0);
  });

  it("type checks property key usage", () => {
    // Ensuring type checking is correct for property keys:
    keyBy(people, "id"); // valid
    keyBy(people, "name"); // valid

    // @ts-expect-error - 'unknownProp' does not exist on 'Person'
    keyBy(people, "unknownProp");

    // @ts-expect-error - not a valid property key
    keyBy(people, 123);
  });

  it("type checks function usage", () => {
    // Passing a function that returns a string key
    keyBy(people, (p) => `${p.id}-${p.name}`); // valid

    // @ts-expect-error - function must return a string, not a number
    keyBy(people, (p) => p.id);

    // @ts-expect-error - function param must be 'Person', can't be e.g. a number
    keyBy(people, (n: number) => `foo-${n}`);
  });
});

describe("groupBy", () => {
  it("groups items by a property name", () => {
    const result = groupBy(people, "group");
    expect(result.size).toBe(2);

    const adminGroup = result.get("admin");
    expect(adminGroup?.length).toBe(2);
    expect(adminGroup?.[0].name).toBe("Alice");
    expect(adminGroup?.[1].name).toBe("Charlie");

    const userGroup = result.get("user");
    expect(userGroup?.length).toBe(2);
    expect(userGroup?.[0].name).toBe("Bob");
    expect(userGroup?.[1].name).toBe("Diana");
  });

  it("groups items by a function", () => {
    const result = groupBy(people, (p) => p.group.toUpperCase());
    expect(result.size).toBe(2);

    const adminGroup = result.get("ADMIN");
    expect(adminGroup?.length).toBe(2);
  });

  it("handles collisions by adding items to an array", () => {
    const data = [
      { id: 1, group: "g1", name: "Foo" },
      { id: 2, group: "g1", name: "Bar" },
    ];
    const result = groupBy(data, "group");
    expect(result.size).toBe(1);

    const arr = result.get("g1");
    expect(arr?.length).toBe(2);
    expect(arr?.[0].name).toBe("Foo");
    expect(arr?.[1].name).toBe("Bar");
  });

  it("skips null and undefined items", () => {
    const data = [null, undefined];
    const result = groupBy(data, "id" as any);
    expect(result.size).toBe(0);
  });

  it("type checks property key usage for groupBy", () => {
    groupBy(people, "name"); // valid

    // @ts-expect-error - 'notARealKey' does not exist on Person
    groupBy(people, "notARealKey");
  });

  it("type checks function usage for groupBy", () => {
    groupBy(people, (p) => p.name.toLowerCase()); // valid

    // @ts-expect-error - function must return a string
    groupBy(people, (p) => p.id);

    // @ts-expect-error - param must be a Person, not a boolean
    groupBy(people, (b: boolean) => (b ? "yes" : "no"));
  });
});
