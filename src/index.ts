enum OperatorEnum {
  Equal = '=',
  NotEqual = '!=',
  GreaterThan = '>',
  GreaterThanOrEqual = '>=',
  LessThan = '<',
  LessThanOrEqual = '<=',
  Like = '~',
  NotLike = '!~',
  AnyEqual = '?=',
  AnyNotEqual = '?!=',
  AnyGreaterThan = '?>',
  AnyGreaterThanOrEqual = '?>=',
  AnyLessThan = '?<',
  AnyLessThanOrEqual = '?<=',
  AnyLike = '?~',
  AnyNotLike = '?!~',
}

type OperatorType = `${OperatorEnum}`;

const MACROS = [
  '@now',
  '@second',
  '@minute',
  '@hour',
  '@weekday',
  '@day',
  '@month',
  '@year',
  '@yesterday',
  '@tomorrow',
  '@todayStart',
  '@todayEnd',
  '@monthStart',
  '@monthEnd',
  '@yearStart',
  '@yearEnd',
] as const;

type Macro = (typeof MACROS)[number];

// `string & {}` keeps the macro literals in autocomplete instead of collapsing them into `string`.
type FilterValue = Macro | (string & {}) | number | boolean | Date | null | undefined;

type FieldModifier = 'lower' | 'length' | 'each';

type FieldName<T> = keyof T & string;

type Field<T> = FieldName<T> | `${FieldName<T>}:${FieldModifier}` | `${FieldName<T>}.${string}`;

interface Expression<T> {
  field: Field<T>;
  operator: OperatorType;
  value: FilterValue;
}

const STRING_LITERAL = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;

class PocketbaseQuery<T> {
  private query: string;
  private lastQueryValue: string;

  constructor() {
    this.query = '';
    this.lastQueryValue = '';
  }

  /**
   * Returns a new, empty query builder. Each call is independent, so queries can be built
   * side by side or nested.
   *
   * @returns {PocketbaseQuery<T>} A new query builder.
   */
  public static getInstance<T>(): PocketbaseQuery<T> {
    return new PocketbaseQuery<T>();
  }

  getLastQueryValue() {
    return this.lastQueryValue;
  }

  /**
   * Serializes a value the same way the official PocketBase SDK does in `pb.filter()`:
   * strings and dates are JSON-quoted (so quotes and backslashes are escaped), numbers and
   * booleans are written as-is, and datetime macros such as `@now` are left unquoted.
   * Returns `null` for values that should be skipped.
   */
  private formatValue(value: FilterValue): string | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null;
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : JSON.stringify(value.toISOString().replace('T', ' '));
    }
    if (MACROS.includes(value as Macro)) return value;
    return JSON.stringify(String(value));
  }

  private addExpression({ field, operator, value }: Expression<T>) {
    const formatted = this.formatValue(value);
    if (formatted === null) return this;

    this.lastQueryValue = String(value);
    this.query += `${field}${operator}${formatted}`;
    return this;
  }

  /**
   * Adds an AND condition to the query string.
   *
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  and() {
    this.query += ' && ';
    this.lastQueryValue = '';
    return this;
  }

  /**
   * Adds an OR condition to the query string.
   *
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  or() {
    this.query += ' || ';
    this.lastQueryValue = '';
    return this;
  }

  /**
   * Opens a bracket to group expressions.
   * It will add "(" to the query string.
   *
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  openBracket() {
    this.query += '(';
    return this;
  }

  /**
   * Closes a bracket to group expressions.
   * It will add ")" to the query string.
   *
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  closeBracket() {
    this.query += ')';
    return this;
  }

  /**
   * Adds an equality condition to the query for the specified field and value.
   * The condition is formatted as `field="value"`.
   *
   * @param {Field<T>} field - The field name to be compared.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  equal(field: Field<T>, value: FilterValue) {
    return this.addExpression({ field, operator: OperatorEnum.Equal, value });
  }

  /**
   * Adds a not-equal condition to the query for the specified field and value.
   * The condition is formatted as `field!="value"`.
   *
   * @param {Field<T>} field - The field name to be compared.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  notEqual(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.NotEqual,
      value,
    });
  }

  /**
   * Adds a greater-than condition to the query for the specified field and value.
   * The condition is formatted as `field>"value"`.
   *
   * @param {Field<T>} field - The field name to be compared.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  greaterThan(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.GreaterThan,
      value,
    });
  }

  /**
   * Adds a greater-than or equal condition to the query for the specified field and value.
   * The condition is formatted as `field>="value"`.
   *
   * @param {Field<T>} field - The field name to be compared.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  greaterThanOrEqual(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.GreaterThanOrEqual,
      value,
    });
  }

  /**
   * Adds a less-than condition to the query for the specified field and value.
   * The condition is formatted as `field<"value"`.
   *
   * @param {Field<T>} field - The field name to be compared.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  lessThan(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.LessThan,
      value,
    });
  }

  /**
   * Adds a less-than or equal condition to the query for the specified field and value.
   * The condition is formatted as `field<="value"`.
   *
   * @param {Field<T>} field - The field name to be compared.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  lessThanOrEqual(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.LessThanOrEqual,
      value,
    });
  }

  /**
   * Adds a LIKE condition (partial match) to the query for the specified field and value.
   * The condition is formatted as `field~"value"`.
   *
   * @param {Field<T>} field - The field name to be compared.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  like(field: Field<T>, value: FilterValue) {
    return this.addExpression({ field, operator: OperatorEnum.Like, value });
  }

  /**
   * Adds a NOT LIKE condition to the query for the specified field and value.
   * The condition is formatted as `field!~"value"`.
   *
   * @param {Field<T>} field - The field name to be compared.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  notLike(field: Field<T>, value: FilterValue) {
    return this.addExpression({ field, operator: OperatorEnum.NotLike, value });
  }

  /**
   * Adds an equality condition for array fields to the query for the specified field and value.
   * The condition is formatted as `field?="value"`.
   *
   * @param {Field<T>} field - The field name to be compared, which should be an array.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyEqual(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyEqual,
      value,
    });
  }

  /**
   * Adds a NOT EQUAL condition for array fields to the query for the specified field and value.
   * The condition is formatted as `field?!="value"`.
   *
   * @param {Field<T>} field - The field name to be compared, which should be an array.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyNotEqual(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyNotEqual,
      value,
    });
  }

  /**
   * Adds a greater-than condition for array fields to the query for the specified field and value.
   * The condition is formatted as `field?>"value"`.
   *
   * @param {Field<T>} field - The field name to be compared, which should be an array.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyGreaterThan(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyGreaterThan,
      value,
    });
  }

  /**
   * Adds a greater-than or equal condition for array fields to the query for the specified field and value.
   * The condition is formatted as `field?>="value"`.
   *
   * @param {Field<T>} field - The field name to be compared, which should be an array.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyGreaterThanOrEqual(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyGreaterThanOrEqual,
      value,
    });
  }

  /**
   * Adds a less-than condition for array fields to the query for the specified field and value.
   * The condition is formatted as `field?<"value"`.
   *
   * @param {Field<T>} field - The field name to be compared, which should be an array.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyLessThan(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyLessThan,
      value,
    });
  }

  /**
   * Adds a less-than or equal condition for array fields to the query for the specified field and value.
   * The condition is formatted as `field?<="value"`.
   *
   * @param {Field<T>} field - The field name to be compared, which should be an array.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyLessThanOrEqual(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyLessThanOrEqual,
      value,
    });
  }

  /**
   * Adds a LIKE condition (partial match) for array fields to the query for the specified field and value.
   * The condition is formatted as `field?~"value"`.
   *
   * @param {Field<T>} field - The field name to be compared, which should be an array.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyLike(field: Field<T>, value: FilterValue) {
    return this.addExpression({ field, operator: OperatorEnum.AnyLike, value });
  }

  /**
   * Adds a NOT LIKE condition (partial match) for array fields to the query for the specified field and value.
   * The condition is formatted as `field?!~"value"`.
   *
   * @param {Field<T>} field - The field name to be compared, which should be an array.
   * @param {FilterValue} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyNotLike(field: Field<T>, value: FilterValue) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyNotLike,
      value,
    });
  }
  /**
   * Adds an IN condition for the specified field and array of values.
   * The condition is formatted as `field~"value1" || field~"value2" || ...`.
   *
   * @param {Field<T>} field - The field name to be compared.
   * @param {FilterValue[]} values - The values to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  in(field: Field<T>, values: FilterValue[]) {
    const validValues = values.filter((value) => this.formatValue(value) !== null);

    validValues.forEach((value, index) => {
      this.addExpression({ field, operator: OperatorEnum.Like, value });
      if (index < validValues.length - 1) this.or();
    });
    return this;
  }
  /**
   * Adds a custom filter string to the query.
   * This can be useful when you need to create a filter that is not supported by the query builder.
   * The custom filter string is appended as-is, without escaping, so never pass untrusted input.
   *
   * @param {string} filter - The custom filter string to be added to the query.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  customFilter(filter: string) {
    this.lastQueryValue = filter;
    if (!filter) return this;
    this.query += filter;
    return this;
  }
  /**
   * Gets the current query string.
   * This is useful for debugging and seeing what filter string is being generated.
   *
   * @returns {string} The current query string.
   */
  getQuery() {
    return this.query;
  }

  /**
   * Builds the query string.
   * This method is used to generate the final filter string from the query builder.
   * It will remove the trailing " ||" and " &&" from the query string and return the result.
   * Also, it will reset the query builder to its initial state, so you can use it again.
   *
   * @returns {string} The generated filter string.
   */
  build() {
    let result = this.query.trim();

    result = this.cleanupQuery(result);

    this.query = '';
    this.lastQueryValue = '';
    return result.trim();
  }

  /**
   * Clean up the query string by removing unnecessary operators, brackets, and whitespace.
   * String literals are swapped for placeholders first so their content is never touched.
   * @param {string} query - The query string to be cleaned.
   * @returns {string} The cleaned query string.
   * @private
   */
  private cleanupQuery(query: string): string {
    const literals: string[] = [];
    let result = query.replace(STRING_LITERAL, (literal) => `"${literals.push(literal) - 1}"`);
    let prevResult = '';

    while (result !== prevResult) {
      prevResult = result;

      // Remove empty brackets
      result = result.replace(/\(\s*\)/g, '');

      // Remove operators before closing brackets: || ) or && )
      result = result.replace(/\s*(&&|\|\|)\s*\)/g, ')');

      // Remove operators after opening brackets: ( || or ( &&
      result = result.replace(/\(\s*(&&|\|\|)\s*/g, '(');

      // Remove double operators: || || or && && or || && or && ||
      result = result.replace(/\s*(&&|\|\|)\s+(&&|\|\|)\s*/g, ' $2 ');

      // Remove trailing operators
      result = result.replace(/\s*(&&|\|\|)\s*$/, '');

      // Remove leading operators
      result = result.replace(/^\s*(&&|\|\|)\s*/, '');

      // Handle specific pattern: ")condition" -> ") && condition"
      result = result.replace(/\)([a-zA-Z_@][\w.:@]*[=!<>~?]+)/g, ') && $1');

      // Clean up spacing around operators
      result = result.replace(/\s*(&&|\|\|)\s*/g, ' $1 ');

      // Clean up any remaining whitespace issues
      result = result.replace(/\s+/g, ' ').trim();
    }

    return result.replace(/"(\d+)"/g, (_, index) => literals[Number(index)]);
  }
}

export default PocketbaseQuery;
