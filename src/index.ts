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

type OperatorType = `${OperatorEnum}`;

interface Expression<T> {
  field: keyof T;
  operator: OperatorType;
  value: any;
}

class PocketbaseQuery<T> {
  private query: string;
  private static instance: PocketbaseQuery<any>;
  private lastQueryValue: string;

  constructor() {
    this.query = "";
    this.lastQueryValue = "";
  }

/**
 * Retrieves the singleton instance of `PocketbaseQuery`.
 * If the instance does not exist, it creates a new one.
 * Resets the query string of the instance before returning it.
 *
 * @returns {PocketbaseQuery<T>} The singleton instance of the query builder.
 */
  public static getInstance<T>(): PocketbaseQuery<T> {
    if (!PocketbaseQuery.instance) {
      PocketbaseQuery.instance = new PocketbaseQuery<T>();
    }
    PocketbaseQuery.instance.query = "";
    return PocketbaseQuery.instance;
  }

  /**
   * Private helper method to add an expression to the query string.
   * It takes an expression object with the following properties:
   * - `field`: The field name to add to the query.
   * - `operator`: The operator to use for this expression.
   * - `value`: The value to add to the query.
   * 
   * If the value is a boolean, it will be appended to the query string
   * without quotes. Otherwise, the value will be appended with double
   * quotes around it.
   * 
   * The method also keeps track of the last query value and will reset it
   * after adding the expression to the query string.
   * 
   * @param {Expression<T>} expression The expression object to add to the query.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  private addExpression({ field, operator, value }: Expression<T>) {
    this.lastQueryValue = value;
    if (typeof value === "boolean") {
      this.query += `${field.toString()}${operator}${value}`;
      return this;
    }
    if (value) this.query += `${field.toString()}${operator}"${value}"`;
    return this;
  }

  /**
   * Adds an AND condition to the query string.
   * If the last query value was not empty, it will add " && " to the query
   * string to separate the expressions.
   * 
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  and() {
    if (this.lastQueryValue) this.query += " && ";
    this.lastQueryValue = "";
    return this;
  }

/**
 * Adds an OR condition to the query string.
 * If the last query value was not empty, it will add " || " to the query
 * string to separate the expressions.
 * 
 * @returns {PocketbaseQuery<T>} The current instance for chaining.
 */
  or() {
    if (this.lastQueryValue) this.query += " || ";
    this.lastQueryValue = "";
   return this;
  }

  /**
   * Opens a bracket to group expressions.
   * It will add "(" to the query string.
   * 
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  openBracket() {
    this.query += "(";
    return this;
  }

  /**
   * Closes a bracket to group expressions.
   * It will add ")" to the query string.
   * 
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  closeBracket() {
    this.query += ")";
    return this;
  }

  /**
   * Adds an equality condition to the query for the specified field and value.
   * The condition is formatted as `field="value"` or `field=true/false` if
   * the value is a boolean.
   * 
   * @param {keyof T} field - The field name to be compared.
   * @param {string | boolean} value - The value to compare against; can be a string or boolean.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  equal(field: keyof T, value: string | boolean) {
    return this.addExpression({ field, operator: OperatorEnum.Equal, value });
  }

  /**
   * Adds a not-equal condition to the query for the specified field and value.
   * The condition is formatted as `field!="value"`.
   * 
   * @param {keyof T} field - The field name to be compared.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  notEqual(field: keyof T, value: string) {
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
   * @param {keyof T} field - The field name to be compared.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  greaterThan(field: keyof T, value: string) {
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
   * @param {keyof T} field - The field name to be compared.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  greaterThanOrEqual(field: keyof T, value: string) {
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
   * @param {keyof T} field - The field name to be compared.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  lessThan(field: keyof T, value: string) {
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
   * @param {keyof T} field - The field name to be compared.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  lessThanOrEqual(field: keyof T, value: string) {
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
   * @param {keyof T} field - The field name to be compared.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  like(field: keyof T, value: string) {
    return this.addExpression({ field, operator: OperatorEnum.Like, value });
  }

  /**
   * Adds a NOT LIKE condition to the query for the specified field and value.
   * The condition is formatted as `field!~"value"`.
   * 
   * @param {keyof T} field - The field name to be compared.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  notLike(field: keyof T, value: string) {
    return this.addExpression({ field, operator: OperatorEnum.NotLike, value });
  }

  /**
   * Adds an equality condition for array fields to the query for the specified field and value.
   * The condition is formatted as `field?="value"`.
   * 
   * @param {keyof T} field - The field name to be compared, which should be an array.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyEqual(field: keyof T, value: string) {
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
   * @param {keyof T} field - The field name to be compared, which should be an array.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyNotEqual(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyNotEqual,
      value,
    });
  }

  /**
   * Adds a greater-than condition for array fields to the query for the specified field and value.
   * The condition is formatted as `field?>="value"`.
   * 
   * @param {keyof T} field - The field name to be compared, which should be an array.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyGreaterThan(field: keyof T, value: string) {
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
   * @param {keyof T} field - The field name to be compared, which should be an array.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyGreaterThanOrEqual(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyGreaterThanOrEqual,
      value,
    });
  }

  /**
   * Adds a less-than condition for array fields to the query for the specified field and value.
   * The condition is formatted as `field?<="value"`.
   * 
   * @param {keyof T} field - The field name to be compared, which should be an array.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyLessThan(field: keyof T, value: string) {
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
   * @param {keyof T} field - The field name to be compared, which should be an array.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyLessThanOrEqual(field: keyof T, value: string) {
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
   * @param {keyof T} field - The field name to be compared, which should be an array.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyLike(field: keyof T, value: string) {
    return this.addExpression({ field, operator: OperatorEnum.AnyLike, value });
  }

  /**
   * Adds a NOT LIKE condition (partial match) for array fields to the query for the specified field and value.
   * The condition is formatted as `field?!~"value"`.
   * 
   * @param {keyof T} field - The field name to be compared, which should be an array.
   * @param {string} value - The value to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  anyNotLike(field: keyof T, value: string) {
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
   * @param {keyof T} field - The field name to be compared.
   * @param {any[]} values - The values to compare against.
   * @returns {PocketbaseQuery<T>} The current instance for chaining.
   */
  in(field: keyof T, values: any[]) {
    if (!values.length) return this;
    values.forEach((value, index) => {
      this.addExpression({ field, operator: OperatorEnum.Like, value });
      if (index < values.length - 1) this.or();
    });
    return this;
  }
  /**
   * Adds a custom filter string to the query.
   * This can be useful when you need to create a filter that is not supported by the query builder.
   * The custom filter string will be appended to the query.
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

    if (result.endsWith(" ||")) {
      result = result.slice(0, -3);
    }

    if (result.endsWith(" &&")) {
      result = result.slice(0, -3);
    }

    this.query = "";
    this.lastQueryValue = "";
    return result.trim();
  }
}

export default PocketbaseQuery;