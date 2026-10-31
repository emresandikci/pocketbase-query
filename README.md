# Pocketbase Query

<a href="https://www.npmjs.com/package/@emresandikci/pocketbase-query"><img src="https://img.shields.io/npm/v/@emresandikci/pocketbase-query?color=birgtgreen"></a>
<img src="https://img.shields.io/npm/l/@emresandikci/pocketbase-query">
<img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
<a href="https://twitter.com/emresand1kc1" target="\_parent">
  <img alt="" src="https://img.shields.io/twitter/follow/emresandikci.svg?style=social&label=Follow" />
</a>
<a href="https://www.producthunt.com/posts/pocketbase-query" target="\_parent">
  <img alt="" src="https://img.shields.io/badge/Product%20Hunt-DA552F?logo=producthunt&logoColor=fff" />
</a>

## Overview

`@emresandikci/pocketbase-query` is a TypeScript-based query builder designed to generate complex filter queries for PocketBase. It allows for easy construction of queries using various operators while maintaining a fluent and chainable API.

---

## Installation

This library can be used in any TypeScript/JavaScript project. Simply import it as needed:

```bash
npm i @emresandikci/pocketbase-query
```

```typescript
import PocketbaseQuery from '@emresandikci/pocketbase-query';
```

---

## Usage

### Creating an Instance

Use `getInstance()` to get a new query builder. Every call returns its own instance, so queries can be built side by side:


```typescript
const query = PocketbaseQuery.getInstance<MyType>();
```

## Example

```typescript
import PocketbaseQuery from '@emresandikci/pocketbase-query';

const query = PocketbaseQuery.getInstance<{ status: string; comments: number }>();

const customFilters = query
  .equal('status', 'active')
  .and()
  .greaterThan('comments', 50)
  .build();

console.log(customFilters); // Outputs: status="active" && comments>50

await pb.collection('posts').getFullList({
	filter: customFilters,
	expand: [{ key: 'comments_via_post' }],
})
```

---

## API Methods

### Operators Enum

`OperatorEnum` defines a set of operators for use in queries:

```typescript
enum OperatorEnum {
  Equal = "=",
  NotEqual = "!=",
  GreaterThan = ">",
  GreaterThanOrEqual = ">=",
  LessThan = "<",
  LessThanOrEqual = "<=",
  Like = "~",
  NotLike = "!~",
  AnyEqual = "?=",
  AnyNotEqual = "?!=",
  AnyGreaterThan = "?>",
  AnyGreaterThanOrEqual = "?>=",
  AnyLessThan = "?<",
  AnyLessThanOrEqual = "?<=",
  AnyLike = "?~",
  AnyNotLike = "?!~",
}
```

### Fields and values

`field` is a key of `T`, optionally with a PocketBase modifier (`title:lower`, `tags:length`, `tags:each`) or a relation path (`author.name`).

`value` is a `FilterValue`: `string | number | boolean | Date | null | undefined`.

- Strings and dates are quoted and escaped the same way as `pb.filter()` in the official SDK, so user input cannot break out of the string.
- Numbers and booleans are written without quotes.
- Datetime macros (`@now`, `@todayStart`, `@monthEnd`, ...) are written without quotes.
- `null`, `undefined`, `''` and `NaN` are skipped, along with the `&&` / `||` / brackets left around them.

```typescript
query
  .like('title:lower', 'news')
  .and()
  .greaterThanOrEqual('created', '@todayStart')
  .and()
  .greaterThan('tags:length', 0)
  .build();
// title:lower~"news" && created>=@todayStart && tags:length>0
```

### Query Builder Methods

#### `equal(field, value)`

Adds an equality condition to the query.

```typescript
query.equal("status", "active");
```

#### `notEqual(field, value)`

Adds a not-equal condition to the query.

```typescript
query.notEqual("category", "archived");
```

#### `greaterThan(field, value)`

Adds a greater-than condition.

```typescript
query.greaterThan("age", 18);
```

#### `lessThan(field, value)`

Adds a less-than condition.

```typescript
query.lessThan("price", 100);
```

#### `like(field, value)`

Adds a LIKE condition (partial match).

```typescript
query.like("name", "John");
```

#### `notLike(field, value)`

Adds a NOT LIKE condition.

```typescript
query.notLike("description", "discount");
```

#### `anyEqual(field, value)`

Adds an equality condition for array fields.

```typescript
query.anyEqual("tags", "sale");
```

#### `in(field, values)`

Adds an OR condition for multiple values, using `~` (partial match) for each value.

```typescript
query.in("category", ["electronics", "furniture"]);
```

#### `customFilter(filter: string)`

Adds a custom filter string to the query as-is, for syntax the builder does not cover (`strftime()`, `geoDistance()`, `@request.*`, back-relations). It is not escaped, so never pass untrusted input.

```typescript
query.customFilter("strftime('%Y-%m', created) = '2026-01'");
```

---

### Logical Operators

#### `and()`

Joins multiple conditions with `&&`.

```typescript
query.equal("status", "active").and().greaterThan("price", 50);
```

#### `or()`

Joins multiple conditions with `||`.

```typescript
query.equal("status", "active").or().equal("status", "pending");
```

#### `openBracket()` and `closeBracket()`

Groups conditions using parentheses.

```typescript
query.openBracket().equal("status", "active").or().equal("status", "pending").closeBracket().and().greaterThan("price", 50);
```

---

### Query Execution

#### `getQuery()`

Returns the current query string.

```typescript
const queryString = query.getQuery();
```

#### `build()`

Finalizes and returns the query string while clearing the internal state.

```typescript
const finalQuery = query.build();
```


## Notes

- The `.build()` method resets the query, so ensure you store the generated string if you need it.
- The `in()` method applies `OR` between multiple values.

---

## Releases

Versions and npm releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release). Every push to `main` runs the tests, and when the commits since the last tag contain a `fix:`, `feat:` or breaking change, the next version is published to npm, tagged, and added to `CHANGELOG.md`. Pull requests get a comment with the version they would release.

Commit with `npm run commit` or write [Conventional Commits](https://www.conventionalcommits.org/) by hand.

---

## License

MIT License

