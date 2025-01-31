import PocketbaseQuery from ".";

describe("PocketbaseQuery", () => {
  it("should create a simple equality query", () => {
    const query = PocketbaseQuery.getInstance<{ name: string }>()
      .equal("name", "John")
      .build();

    expect(query).toBe('name="John"');
  });

  it("should create a query with inequality operator", () => {
    const query = PocketbaseQuery.getInstance<{ age: number }>()
      .notEqual("age", "25")
      .build();

    expect(query).toBe('age!="25"');
  });

  it("should create a query with greater than operator", () => {
    const query = PocketbaseQuery.getInstance<{ salary: number }>()
      .greaterThan("salary", "5000")
      .build();

    expect(query).toBe('salary>"5000"');
  });

  it("should create a query with less than or equal operator", () => {
    const query = PocketbaseQuery.getInstance<{ experience: number }>()
      .lessThanOrEqual("experience", "10")
      .build();

    expect(query).toBe('experience<="10"');
  });

  it("should create a query with AND condition", () => {
    const query = PocketbaseQuery.getInstance<{
      age: number;
      active: boolean;
    }>()
      .greaterThan("age", "18")
      .and()
      .equal("active", true)
      .build();

    expect(query).toBe('age>"18" && active=true');
  });

  it("should create a query with OR condition", () => {
    const query = PocketbaseQuery.getInstance<{
      city: string;
      country: string;
    }>()
      .equal("city", "Paris")
      .or()
      .equal("country", "France")
      .build();

    expect(query).toBe('city="Paris" || country="France"');
  });

  it("should create a query with complex conditions using brackets", () => {
    const query = PocketbaseQuery.getInstance<{
      age: number;
      salary: number;
      city: string;
    }>()
      .openBracket()
      .greaterThan("age", "30")
      .and()
      .lessThan("salary", "7000")
      .closeBracket()
      .or()
      .equal("city", "London")
      .build();
    expect(query).toBe('(age>"30" && salary<"7000") || city="London"');
  });

  it("should create a query with LIKE operator", () => {
    const query = PocketbaseQuery.getInstance<{ name: string }>()
      .like("name", "Jo")
      .build();

    expect(query).toBe('name~"Jo"');
  });

  it("should create an IN clause simulation", () => {
    const query = PocketbaseQuery.getInstance<{ color: string }>()
      .in("color", ["Red", "Blue", "Green"])
      .build();

    expect(query).toBe('color~"Red" || color~"Blue" || color~"Green"');
  });

  it("should create a custom filter query", () => {
    const query = PocketbaseQuery.getInstance<{ customField: string }>()
      .customFilter('customField="value" && otherField!="otherValue"')
      .build();

    expect(query).toBe('customField="value" && otherField!="otherValue"');
  });

  it("should handle no filter gracefully", () => {
    const query = PocketbaseQuery.getInstance<{ name: string }>()
      .customFilter("")
      .build();

    expect(query).toBe("");
  });

  it("should reset query after build", () => {
    const instance = PocketbaseQuery.getInstance<{ name: string }>()
      .equal("name", "John")
      .build();

    expect(instance).toBe('name="John"');

    const query2 = PocketbaseQuery.getInstance<{ age: number }>()
      .greaterThan("age", "30")
      .build();

    expect(query2).toBe('age>"30"');
  });
});
