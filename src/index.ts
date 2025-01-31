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

  public static getInstance<T>(): PocketbaseQuery<T> {
    if (!PocketbaseQuery.instance) {
      PocketbaseQuery.instance = new PocketbaseQuery<T>();
    }
    PocketbaseQuery.instance.query = "";
    return PocketbaseQuery.instance;
  }

  private addExpression({ field, operator, value }: Expression<T>) {
    this.lastQueryValue = value;
    if (typeof value === "boolean") {
      this.query += `${field.toString()}${operator}${value}`;
      return this;
    }
    if (value) this.query += `${field.toString()}${operator}"${value}"`;
    return this;
  }

  and() {
    if (this.lastQueryValue) this.query += " && ";
    this.lastQueryValue = "";
    return this;
  }

  or() {
    if (this.lastQueryValue) this.query += " || ";
    this.lastQueryValue = "";
    return this;
  }

  openBracket() {
    this.query += "(";
    return this;
  }

  closeBracket() {
    this.query += ")";
    return this;
  }

  equal(field: keyof T, value: string | boolean) {
    return this.addExpression({ field, operator: OperatorEnum.Equal, value });
  }

  notEqual(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.NotEqual,
      value,
    });
  }

  greaterThan(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.GreaterThan,
      value,
    });
  }

  greaterThanOrEqual(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.GreaterThanOrEqual,
      value,
    });
  }

  lessThan(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.LessThan,
      value,
    });
  }

  lessThanOrEqual(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.LessThanOrEqual,
      value,
    });
  }

  like(field: keyof T, value: string) {
    return this.addExpression({ field, operator: OperatorEnum.Like, value });
  }

  notLike(field: keyof T, value: string) {
    return this.addExpression({ field, operator: OperatorEnum.NotLike, value });
  }

  anyEqual(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyEqual,
      value,
    });
  }

  anyNotEqual(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyNotEqual,
      value,
    });
  }

  anyGreaterThan(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyGreaterThan,
      value,
    });
  }

  anyGreaterThanOrEqual(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyGreaterThanOrEqual,
      value,
    });
  }

  anyLessThan(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyLessThan,
      value,
    });
  }

  anyLessThanOrEqual(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyLessThanOrEqual,
      value,
    });
  }

  anyLike(field: keyof T, value: string) {
    return this.addExpression({ field, operator: OperatorEnum.AnyLike, value });
  }

  anyNotLike(field: keyof T, value: string) {
    return this.addExpression({
      field,
      operator: OperatorEnum.AnyNotLike,
      value,
    });
  }
  in(field: keyof T, values: any[]) {
    if (!values.length) return this;
    values.forEach((value, index) => {
      this.addExpression({ field, operator: OperatorEnum.Like, value });
      if (index < values.length - 1) this.or();
    });
    return this;
  }
  customFilter(filter: string) {
    this.lastQueryValue = filter;
    if (!filter) return this;
    this.query += filter;
    return this;
  }
  getQuery() {
    return this.query;
  }
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
