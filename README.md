# Keygie — A Type-Safe `keyBy` and `groupBy` for TypeScript

Keygie is a lightweight, type-safe utility library for TypeScript that provides two helper functions:

- **`keyBy`**: Transform an array into a `Map` keyed by a specified property or computed value.  
  Optionally, you can also provide a "value getter" to choose what each map entry contains.
- **`groupBy`**: Group array items into a `Map` where each key corresponds to an array of items sharing a common property or computed value.  
  Optionally, you can also provide a "value getter" so that each group stores only the transformed data you care about.

Both functions automatically skip over `null` and `undefined` items, ensuring a clean and predictable output.

## Features

- **Type Safety:** Leverage TypeScript’s strong typing with overloads that enforce correct key usage.
- **Flexible Keying & Values:**  
  - Provide a property name or callback function to determine the map/group keys.  
  - *Optionally*, provide a property name or callback function to determine the values stored.
- **Simple Grouping:** Efficiently group items without additional boilerplate.

## Usage

~~~typescript
import { keyBy, groupBy } from "keygie";

const items = [
  { id: 1, name: "Alice", group: "admin" },
  { id: 2, name: "Bob", group: "user" },
  { id: 3, name: "Charlie", group: "admin" },
  { id: 4, name: "Diana", group: "user" },
];
~~~

### Basic Usage

#### `keyBy`

1. **Key by a property (entire object stored as value):**

   ~~~typescript
   const mapById = keyBy(items, "id");
   /* 
   Map<number, { id: number; name: string; group: string }> 
   Map {
     1 => { id: 1, name: 'Alice', group: 'admin' },
     2 => { id: 2, name: 'Bob', group: 'user' },
     3 => { id: 3, name: 'Charlie', group: 'admin' },
     4 => { id: 4, name: 'Diana', group: 'user' }
   }
   */
   ~~~

2. **Key by a function (entire object stored as value):**

   ~~~typescript
   const mapByGroupLength = keyBy(items, (item) => item.group.length);
   /* 
   Map<number, { id: number; name: string; group: string }> 
   (For example, "admin".length === 5 and "user".length === 4)
   */
   ~~~

3. **Key by property, and also specify a property value:**

   ~~~typescript
   const mapIdToName = keyBy(items, "id", "name");
   /* 
   Map<number, string> 
   Map {
     1 => 'Alice',
     2 => 'Bob',
     3 => 'Charlie',
     4 => 'Diana'
   }
   */
   ~~~

4. **Key by function, value by function:**

   ~~~typescript
   const mapNameToUpper = keyBy(
     items, 
     (item) => item.name, 
     (item) => item.name.toUpperCase()
   );
   /* 
   Map<string, string> 
   Map {
     'Alice' => 'ALICE',
     'Bob' => 'BOB',
     'Charlie' => 'CHARLIE',
     'Diana' => 'DIANA'
   }
   */
   ~~~

#### `groupBy`

1. **Group by a property (entire objects in each group):**

   ~~~typescript
   const groupsByGroup = groupBy(items, "group");
   /* 
   Map<string, { id: number; name: string; group: string }[]> 
   Map {
     'admin' => [
       { id: 1, name: 'Alice', group: 'admin' },
       { id: 3, name: 'Charlie', group: 'admin' }
     ],
     'user' => [
       { id: 2, name: 'Bob', group: 'user' },
       { id: 4, name: 'Diana', group: 'user' }
     ]
   }
   */
   ~~~

2. **Group by a function (entire objects in each group):**

   ~~~typescript
   const groupsByEvenOddId = groupBy(items, (item) => item.id % 2 === 0);
   /* 
   Map<boolean, { id: number; name: string; group: string }[]> 
   true => [
     { id: 2, name: 'Bob', group: 'user' },
     { id: 4, name: 'Diana', group: 'user' }
   ]
   false => [
     { id: 1, name: 'Alice', group: 'admin' },
     { id: 3, name: 'Charlie', group: 'admin' }
   ]
   */
   ~~~

3. **Group by property, value is a property:**

   ~~~typescript
   const groupsByGroupNames = groupBy(items, "group", "name");
   /* 
   Map<string, string[]> 
   Map {
     'admin' => ['Alice', 'Charlie'],
     'user'  => ['Bob', 'Diana']
   }
   */
   ~~~

4. **Group by function, value by function:**

   ~~~typescript
   const groupsByGroupNameUpper = groupBy(
     items,
     (item) => item.group, 
     (item) => item.name.toUpperCase()
   );
   /* 
   Map<string, string[]> 
   Map {
     'admin' => ['ALICE', 'CHARLIE'],
     'user'  => ['BOB', 'DIANA']
   }
   */
   ~~~

## Skipping Nullish Items

Both functions automatically skip `null` and `undefined` entries. You don’t need to manually filter them out beforehand.

## Testing

This project uses Bun for testing. To run tests:

~~~bash
bun test
~~~

## License

This project is open source. See the [LICENSE](LICENSE) file for details.
