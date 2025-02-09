# Keygie — A Type-Safe `keyBy` and `groupBy` for TypeScript

Keygie is a lightweight, type-safe utility library for TypeScript that provides two helper functions:

- **`keyBy`**: Transform an array into a `Map` keyed by a specified property or computed value.  
  Optionally, provide a "value getter" to choose what each map entry stores.
- **`groupBy`**: Group array items into a `Map` where each key corresponds to an array of items sharing a common property or computed value.  
  Optionally, provide a "value getter" to transform the grouped items however you’d like.

## Features

- **Type Safety:** Leverage TypeScript’s strong typing with overloads that enforce correct usage for property‑ or function‑based keys.
- **Flexible Keying & Values:**  
  - Provide a property name or callback function to determine the map/group keys.  
  - *Optionally*, provide a property name or callback function to determine the stored values.
- **Explicit Nullish Handling:** Fine‑grained control over whether you skip `null`/`undefined` items (via `excludeNullish: true`).

## Installation

Install Keygie via npm:

~~~bash
npm install keygie
~~~

Or via yarn:

~~~bash
yarn add keygie
~~~

## Usage

### Importing

~~~typescript
import { keyBy, groupBy } from "keygie";
~~~

### `keyBy` Examples

#### Key by a Property (Storing the Entire Object as the Value)

~~~typescript
const items = [
  { id: 1, name: "Alice", group: "admin" },
  { id: 2, name: "Bob", group: "user" },
  null,         // Included by default
  { id: 3, name: "Charlie", group: "admin" },
  undefined,    // Included by default
  { id: 4, name: "Diana", group: "user" },
];

const mapById = keyBy(items, "id");
// Without filtering, null/undefined items are included.
// Depending on your data shape, this may affect the result when using property‑based key extraction.
~~~

#### Key by a Property with a Value Getter

~~~typescript
const mapIdToName = keyBy(items, "id", "name");
// Result: Map<number, string>
// Nullish items or keys/values will be included unless filtered out explicitly.
~~~

#### Key by a Function (For More Control)

~~~typescript
const mapByCustom = keyBy(items, (item, index) => {
  // Handle nullish items as needed.
  return item ? item.id : index;
});
~~~

### `groupBy` Examples

#### Group by a Property (Storing Entire Objects)

~~~typescript
const groupsByGroup = groupBy(items, "group");
// Result: Map<string, Array<{ id: number; name: string; group: string }>>
~~~

#### Group by a Property with a Value Getter

~~~typescript
const groupsByGroupNames = groupBy(items, "group", "name");
// Result: Map<string, string[]>
~~~

#### Group by a Function with a Value Getter

~~~typescript
const groupsByCustom = groupBy(
  items,
  (item, index) => (item ? item.group : "unknown"),
  (item) => (item ? item.name.toUpperCase() : "N/A")
);
~~~

## Handling Nullish Values

Keygie includes `null` and `undefined` items by default. This means that all data—including nullish values—will appear in your results. To filter out any nullish items, keys, or values, pass the option `{ excludeNullish: true }`:

~~~typescript
const cleanedMap = keyBy(items, "id", { excludeNullish: true });
const cleanedGroups = groupBy(items, "group", { excludeNullish: true });
~~~

_Note:_ When working with arrays that might contain `null` or `undefined` values, using property-based key extraction without `{ excludeNullish: true }` is disallowed by TypeScript to ensure safety. If you need to handle such cases explicitly, use a function-based key getter and manage nullish values within your callback.

## Type-Checking and Overloads

Keygie provides multiple overloads for both functions to cover a variety of use cases:
- **Property-based keying:** Use a property name to extract keys and optionally values. When working with maybe-null arrays, you must specify `{ excludeNullish: true }` to use property-based extraction.
- **Function-based keying:** Use a callback to compute keys (and/or values), giving you full control over handling nullish values.

Refer to the TypeScript definitions for detailed information on overloads and behaviors.

## Testing

This project uses Bun for testing. To run tests:

~~~bash
bun test
~~~

## License

This project is open source. See the [LICENSE](LICENSE) file for details.
