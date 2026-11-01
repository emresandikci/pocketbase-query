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

`@emresandikci/pocketbase-query` is a small, zero-dependency TypeScript query builder for [PocketBase filters](https://pocketbase.io/docs/api-rules-and-filters/). It builds filter strings through a fluent, chainable API, escapes values safely, and drops conditions whose value is empty, which keeps optional filters (search forms, table filters) simple.

It follows the PocketBase v0.40 filter syntax.

---

## Installation

```bash
npm i @emresandikci/pocketbase-query
```

```typescript
// ESM / TypeScript
import PocketbaseQuery from '@emresandikci/pocketbase-query';

// CommonJS
const PocketbaseQuery = require('@emresandikci/pocketbase-query').default;
```

---

## Usage

`getInstance<T>()` returns a new query builder. `T` is your record type and gives you autocomplete and type checking on field names. Every call returns its own instance, so queries can be built side by side or nested.

```typescript
import PocketBase from 'pocketbase';
import PocketbaseQuery from '@emresandikci/pocketbase-query';

interface Post {
  title: string;
  status: string;
  comments: number;
  tags: string[];
  created: string;
}

const pb = new PocketBase('http://127.0.0.1:8090');

const filter = PocketbaseQuery.getInstance<Post>()
  .equal('status', 'active')
  .and()
  .greaterThan('comments', 50)
  .build();
// status="active" && comments>50

const posts = await pb.collection('posts').getFullList({
  filter,
  expand: 'comments_via_post',
});
```

### Optional filters

Conditions with an empty value (`null`, `undefined`, `''`, `NaN`) are skipped, together with the `&&` / `||` and empty brackets left around them. You can chain every possible filter and let the builder drop the unused ones:

```typescript
function buildFilter(form: { search?: string; status?: string; tag?: string }) {
  return PocketbaseQuery.getInstance<Post>()
    .openBracket()
    .like('title', form.search)
    .or()
    .anyLike('tags', form.tag)
    .closeBracket()
    .and()
    .equal('status', form.status)
    .build();
}

buildFilter({ search: 'pocketbase' }); // (title~"pocketbase")
buildFilter({ status: 'active' }); // status="active"
buildFilter({}); // ""
```

---

## Fields and values

### Fields

`field` is a key of `T`, optionally with:

- a modifier: `title:lower` (case-insensitive), `tags:length` (item count), `tags:each` (every item)
- a relation path: `author.name`

```typescript
query.like('title:lower', 'news').and().greaterThan('tags:length', 2).and().equal('author.name', 'John');
// title:lower~"news" && tags:length>2 && author.name="John"
```

### Values

`value` can be `string | number | boolean | Date | null | undefined`.

| Value | Output |
|---|---|
| `'active'` | `"active"`, escaped like `pb.filter()` in the official SDK, so quotes and backslashes in user input cannot break out of the string |
| `50`, `true` | `50`, `true` (no quotes) |
| `new Date('2026-01-02T03:04:05Z')` | `"2026-01-02 03:04:05.000Z"` (PocketBase datetime format) |
| `'@now'`, `'@todayStart'`, ... | `@now`, `@todayStart` (datetime macros, no quotes) |
| `null`, `undefined`, `''`, `NaN` | condition is skipped |

Supported macros: `@now`, `@second`, `@minute`, `@hour`, `@weekday`, `@day`, `@month`, `@year`, `@yesterday`, `@tomorrow`, `@todayStart`, `@todayEnd`, `@monthStart`, `@monthEnd`, `@yearStart`, `@yearEnd`.

Editors suggest these macros as you type a value, and field names with their modifiers as you type a field. Any other string still works as a normal value.

```typescript
query.greaterThanOrEqual('created', '@todayStart').and().lessThan('created', new Date('2026-12-31'));
// created>=@todayStart && created<"2026-12-31 00:00:00.000Z"
```

---

## API

### Comparison methods

All methods take `(field, value)` and return the builder for chaining.

| Method | Operator | Method (any item of an array field) | Operator |
|---|---|---|---|
| `equal` | `=` | `anyEqual` | `?=` |
| `notEqual` | `!=` | `anyNotEqual` | `?!=` |
| `greaterThan` | `>` | `anyGreaterThan` | `?>` |
| `greaterThanOrEqual` | `>=` | `anyGreaterThanOrEqual` | `?>=` |
| `lessThan` | `<` | `anyLessThan` | `?<` |
| `lessThanOrEqual` | `<=` | `anyLessThanOrEqual` | `?<=` |
| `like` | `~` | `anyLike` | `?~` |
| `notLike` | `!~` | `anyNotLike` | `?!~` |

`like` / `notLike` match partially: PocketBase wraps the value in `%` unless you add a `%` wildcard yourself (`'Lorem%'`).

```typescript
query.anyEqual('tags', 'sale');
// tags?="sale"
```

### `in(field, values)`

Joins one `like` condition per value with `||`. Empty values are skipped.

```typescript
query.in('status', ['draft', 'review']);
// status~"draft" || status~"review"
```

Because it uses `~`, `'act'` also matches `active` and `inactive`. Use `equal` with `or()` for exact matches.

### `customFilter(filter)`

Appends a raw filter string for syntax the builder does not cover, such as `strftime()`, `geoDistance()`, `@request.*` or `@collection.*`. It is **not escaped**, so never pass untrusted input.

```typescript
query
  .customFilter("strftime('%Y-%m', created) = '2026-01'")
  .and()
  .customFilter('geoDistance(address.lon, address.lat, 23.32, 42.69) < 25');
```

### Grouping and logic

| Method | Adds |
|---|---|
| `and()` | `&&` |
| `or()` | `\|\|` |
| `openBracket()` / `closeBracket()` | `(` / `)` |

```typescript
query
  .openBracket()
  .equal('status', 'active')
  .or()
  .equal('status', 'pending')
  .closeBracket()
  .and()
  .greaterThan('comments', 50)
  .build();
// (status="active" || status="pending") && comments>50
```

### Output

| Method | Returns |
|---|---|
| `build()` | The final filter string. Removes leftover operators and empty brackets, then resets the builder. |
| `getQuery()` | The raw string built so far, without cleanup or reset. Useful for debugging. |
| `getLastQueryValue()` | The last value added to the query. |

---

## Development

```bash
npm ci
npm test           # jest
npm run typecheck  # tsc
npm run validate   # prettier --check + eslint
npm run build      # tsup -> dist/ (ESM + CJS + types)
```

## Releases

Versions and npm releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release). Every push to `main` runs the tests, and when the commits since the last tag contain a `fix:`, `feat:` or breaking change, the next version is published to npm with provenance, tagged, and added to [CHANGELOG.md](CHANGELOG.md). Pull requests get a comment with the version they would release.

Commit with `npm run commit` or write [Conventional Commits](https://www.conventionalcommits.org/) by hand.

---

## License

MIT License
