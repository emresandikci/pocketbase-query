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
    PocketbaseQuery.instance.lastQueryValue = "";
    return PocketbaseQuery.instance;
  }

  getLastQueryValue() {
    return this.lastQueryValue;
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
    const isValidValue = value !== null && value !== undefined && value !== '';
    
    if (typeof value === "boolean") {
      this.lastQueryValue = value.toString();
      this.query += `${field.toString()}${operator}${value}`;
      return this;
    }
    
    if (isValidValue) {
      this.lastQueryValue = value;
      this.query += `${field.toString()}${operator}"${value}"`;
    }
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
    this.query += " && ";
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
    this.query += " || ";
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
    const validValues = values.filter(value => 
      value !== null && value !== undefined && value !== ''
    );
    
    if (!validValues.length) return this;
    
    validValues.forEach((value, index) => {
      this.addExpression({ field, operator: OperatorEnum.Like, value });
      if (index < validValues.length - 1) this.or();
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
    
    result = this.cleanupQuery(result);

    this.query = "";
    this.lastQueryValue = "";
    return result.trim();
  }

  /**
   * Clean up the query string by removing unnecessary operators, brackets, and whitespace.
   * This method is used internally by the query builder to generate a valid filter string.
   * @param {string} query - The query string to be cleaned.
   * @returns {string} The cleaned query string.
   * @private
   */
   private cleanupQuery(query: string): string {
    let result = query;
    let prevResult = '';
    
    while (result !== prevResult) {
      prevResult = result;
      
      // Remove empty brackets first
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
      result = result.replace(/\)([a-zA-Z_][a-zA-Z0-9_]*[=!<>~?]+)/g, ') && $1');
      
      // Clean up spacing around operators
      result = result.replace(/\s*(&&|\|\|)\s*/g, ' $1 ');
      
      // Remove empty brackets again after other cleanups
      result = result.replace(/\(\s*\)/g, '');
      
      // Clean up brackets
      result = result.replace(/\(\)\s*([a-zA-Z])/g, '$1');
      result = result.replace(/([a-zA-Z\)"])\s*\(\)/g, '$1');
      
      // Clean up any remaining whitespace issues
      result = result.replace(/\s+/g, ' ').trim();
    }
    
    return result;
  }
}

export default PocketbaseQuery;