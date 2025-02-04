# Keygie — A Type-Safe `keyBy` and `groupBy` for TypeScript

Keygie is a lightweight, type-safe utility library for TypeScript that provides two helper functions:

- **`keyBy`**: Transform an array into a `Map` keyed by a specified property or computed value.
- **`groupBy`**: Group array items into a `Map` where each key corresponds to an array of items sharing a common property or computed value.

Both functions automatically skip over `null` and `undefined` items, ensuring a clean and predictable output.

## Features

- **Type Safety:** Leverage TypeScript’s strong typing with overloads that enforce correct key usage.
- **Flexible Keying:** Use either a property name or a callback function to determine keys.
- **Grouping Made Easy:** Efficiently group items without additional boilerplate.


## Usage

Import the functions in your TypeScript project:

```typescript
import { keyBy, groupBy } from "keygie";

const items = [
  { id: 1, name: "Alice", group: "admin" },
  { id: 2, name: "Bob", group: "user" },
  { id: 3, name: "Diana", group: "user" },
];

// Key items by a property:
const mapById = keyBy(items, "id");
/* =>
Map {
  1 => { id: 1, name: 'Alice', group: 'admin' },
  2 => { id: 2, name: 'Bob', group: 'user' },
  3 => { id: 3, name: 'Diana', group: 'user' }
}
*/

// Group items by a property:
const groupsByGroup = groupBy(items, "group");
/* =>
Map {
  'admin' => [
    { id: 1, name: 'Alice', group: 'admin' },
  ],
  'user' => [
    { id: 2, name: 'Bob', group: 'user' },
    { id: 3, name: 'Diana', group: 'user' }
  ]
}
*/
```

## Testing

This project uses Bun for testing. To run tests:

```bash
bun test
```

## License

This project is open source. See the [LICENSE](LICENSE) file for details.