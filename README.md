# Mapwise — `keyBy` and `groupBy` for Maps in TypeScript

Mapwise is a lightweight, type-safe utility library for TypeScript that provides two helper functions:

- **`keyBy`**: Transform an array into a `Map` keyed by a specified property or computed value.  
  Optionally, provide a *value transformer* to choose what each map entry stores.
- **`groupBy`**: Group array items into a `Map` where each key corresponds to an array of items sharing a common property or computed value.  
  Optionally, provide a *value transformer* to transform the grouped items however you’d like.

Mapwise is designed after both `lodash` and the recent [Map.groupBy](https://caniuse.com/?search=Map.groupBy) function.

### Why Maps?

Using Maps instead of Records (as in `lodash`) offers a clear type safety advantage. When you access a key in a Record via bracket notation (e.g. `result[nonExistingKey]`), TypeScript may not always include `undefined` in the inferred type — even if the key is absent — potentially masking runtime errors. In contrast, Maps require using the `get` method (e.g. `resultMap.get(nonExistingKey)`), which correctly returns a type of `T | undefined`. This ensures that the possibility of a missing key is always accounted for in consuming code.


## Features

- **Type Safety:** Leverage TypeScript’s strong typing with overloads that enforce correct usage for property‑ or function‑based keys.
- **Flexible Keying & Values:**  
  - Provide a property name or callback function to determine the map/group keys (a **key extractor**).  
  - *Optionally*, provide a property name or callback function (a **value transformer**) to determine the stored values.
- **Explicit Nullish Handling:** Fine‑grained control over whether you skip `null`/`undefined` items and keys (via `excludeNullish: true`).

## Installation

~~~bash
bun add mapwise
~~~

_Not using Bun? Ehem.. I guess that's OK too.._

## Usage

### Importing

~~~typescript
import { keyBy, groupBy } from "mapwise";
~~~

### `keyBy` Examples

#### Key by a Property (Storing the Entire Object as the Value)

~~~typescript
const items: Person[] = [
  { id: 1, name: "Alice", group: "admin" },
  { id: 2, name: "Bob", group: "user" },
  { id: 3, name: "Diana", group: "user" },
];

const mapById = keyBy(items, "id");
// Result: Map<number, Person>
~~~

#### Key by a Property with a Value Transformer

~~~typescript
const mapIdToName = keyBy(items, "id", "name");
// Result: Map<number, string>
~~~

#### Key by a Function (For More Control)

~~~typescript
const mapByCustom = keyBy(items, (item, index) => {
  // Use a key extractor callback. Handle nullish items as needed.
  return item ? item.id : index;
});
~~~

### `groupBy` Examples

#### Group by a Property (Storing Entire Objects)

~~~typescript
const groupsByGroup = groupBy(items, "group");
// Result: Map<string, Person[]>
~~~

#### Group by a Property with a Value Transformer

~~~typescript
const groupsByGroupNames = groupBy(items, "group", "name");
// Result: Map<string, string[]>
~~~

#### Group by a Function with a Value Transformer

~~~typescript
const groupsByCustom = groupBy(
  items,
  (item, index) => (item ? item.group : "unknown"),
  (item, index) => (item ? item.name.toUpperCase() : "N/A")
);
~~~

## Handling Nullish Values

Mapwise includes `null` and `undefined` items by default. This means that all data—including nullish values—will appear in your results. To filter out any nullish **items and keys**, pass the option `{ excludeNullish: true }`:

~~~typescript
const cleanedMap = keyBy(items, "id", { excludeNullish: true });
const cleanedGroups = groupBy(items, "group", { excludeNullish: true });
~~~

_Note:_ When working with arrays that might contain `null` or `undefined` values, using property‑based key extraction without `{ excludeNullish: true }` is disallowed by TypeScript to ensure safety. If you need to handle such cases explicitly, use a function‑based key extractor and manage nullish values within your callback.

## Testing

~~~bash
bun test
~~~

## License

This project is open source. See the [LICENSE](LICENSE) file for details.
