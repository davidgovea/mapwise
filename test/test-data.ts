/**
 * Shared test data for keyBy and groupBy tests.
 */

export interface Person {
  id: number;
  name: string;
  group: string;
}

/**
 * Array containing some null/undefined entries for testing nullish handling.
 */
export const peopleMaybeNull: Array<Person | null | undefined> = [
  { id: 1, name: 'Alice', group: 'admin' },
  { id: 2, name: 'Bob', group: 'user' },
  null,
  { id: 3, name: 'Charlie', group: 'admin' },
  undefined,
  { id: 4, name: 'Diana', group: 'user' },
];

/**
 * Non-null array derived from peopleMaybeNull.
 */
export const people = peopleMaybeNull.filter((p): p is Person => p != null);
