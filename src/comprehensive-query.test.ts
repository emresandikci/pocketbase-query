import PocketbaseQuery from '.';

// Mock type for testing
interface TestRecord {
  title: string;
  content: string;
  tags: string;
  notebook: string;
  status: string;
  age: number;
  price: number;
  category: string;
  name: string;
  description: string;
  comments: number;
  active: boolean;
  owner: string;
  published: boolean;
  collaborators: string[];
  visibility: string;
}

describe('PocketbaseQuery Comprehensive Tests', () => {
  let query: PocketbaseQuery<TestRecord>;

  beforeEach(() => {
    // Get a fresh instance before each test
    query = PocketbaseQuery.getInstance<TestRecord>();
  });

  describe('Basic Query Building', () => {
    test('should build simple equality query', () => {
      const result = query.equal('status', 'active').build();
      expect(result).toBe('status="active"');
    });

    test('should build query with AND operator', () => {
      const result = query
        .equal('status', 'active')
        .and()
        .greaterThan('comments', '50')
        .build();
      expect(result).toBe('status="active" && comments>"50"');
    });

    test('should build query with OR operator', () => {
      const result = query
        .equal('status', 'active')
        .or()
        .equal('status', 'pending')
        .build();
      expect(result).toBe('status="active" || status="pending"');
    });

    test('should handle boolean values', () => {
      const result = query.equal('active', true).build();
      expect(result).toBe('active=true');
    });
  });

  describe('Bracket Handling - Fixed Scenarios', () => {
    test('should handle brackets with all valid conditions', () => {
      const result = query
        .openBracket()
        .like('title', 'test')
        .or()
        .like('content', 'test')
        .or()
        .like('tags', 'tag123')
        .closeBracket()
        .and()
        .notEqual('notebook', 'trash123')
        .build();

      expect(result).toBe('(title~"test" || content~"test" || tags~"tag123") && notebook!="trash123"');
    });

    test('should handle brackets without additional conditions', () => {
      const result = query
        .openBracket()
        .like('title', 'test')
        .or()
        .like('content', 'test')
        .or()
        .like('tags', 'tag123')
        .closeBracket()
        .build();

      expect(result).toBe('(title~"test" || content~"test" || tags~"tag123")');
    });

    test('should handle single condition in brackets', () => {
      const result = query
        .openBracket()
        .like('title', 'test')
        .closeBracket()
        .and()
        .equal('status', 'active')
        .build();

      expect(result).toBe('(title~"test") && status="active"');
    });
  });

  describe('Empty Value Handling - Bug Fixes', () => {
    test('should skip empty string conditions in brackets', () => {
      const result = query
        .openBracket()
        .like('title', 'fo')
        .or()
        .like('content', 'fo')
        .or()
        .like('tags', '') // Empty string - should be skipped
        .closeBracket()
        .and()
        .notEqual('notebook', 'trash123')
        .build();

      expect(result).toBe('(title~"fo" || content~"fo") && notebook!="trash123"');
      expect(result).not.toContain('|| )');
      expect(result).not.toContain('||)');
    });

    test('should skip undefined values', () => {
      const result = query
        .openBracket()
        .like('title', 'test')
        .or()
        .like('content', undefined as any)
        .or()
        .like('tags', 'tag123')
        .closeBracket()
        .build();

      expect(result).toBe('(title~"test" || tags~"tag123")');
    });

    test('should skip null values', () => {
      const result = query
        .openBracket()
        .like('title', 'test')
        .or()
        .like('content', null as any)
        .or()
        .like('tags', 'tag123')
        .closeBracket()
        .build();

      expect(result).toBe('(title~"test" || tags~"tag123")');
    });

    test('should handle all empty conditions in brackets', () => {
      const result = query
        .openBracket()
        .like('title', '')
        .or()
        .like('content', '')
        .or()
        .like('tags', '')
        .closeBracket()
        .and()
        .notEqual('notebook', 'trash123')
        .build();

      expect(result).toBe('notebook!="trash123"');
    });

    test('should handle mixed valid and empty conditions', () => {
      const result = query
        .openBracket()
        .like('title', 'test')
        .or()
        .like('content', '')
        .or()
        .like('tags', 'tag123')
        .closeBracket()
        .and()
        .equal('status', 'active')
        .build();

      expect(result).toBe('(title~"test" || tags~"tag123") && status="active"');
    });
  });

  describe('Exact Bug Reproduction from GitHub Issue', () => {
    test('should reproduce and fix the exact bug scenario', () => {
      const searchInput = 'fo ';
      const searchedTagId = '';
      const trashID = '6z3w9jjsbag070z';

      const result = query
        .openBracket()
        .like('title', searchInput)
        .or()
        .like('content', searchInput)
        .or()
        .like('tags', searchedTagId)
        .closeBracket()
        .and()
        .notEqual('notebook', trashID)
        .build();

      expect(result).toBe('(title~"fo " || content~"fo ") && notebook!="6z3w9jjsbag070z"');
      expect(result).not.toContain('|| )');
      expect(result).not.toContain('||)');
    });

    test('should handle the brackets-only scenario from the issue', () => {
      const searchInput = 'fo ';
      const searchedTagId = '';

      const result = query
        .openBracket()
        .like('title', searchInput)
        .or()
        .like('content', searchInput)
        .or()
        .like('tags', searchedTagId)
        .closeBracket()
        .build();

      expect(result).toBe('(title~"fo " || content~"fo ")');
      expect(result).not.toContain('|| )');
    });
  });

  describe('Complex Query Scenarios', () => {
    test('should handle nested logical conditions', () => {
      const result = query
        .openBracket()
        .like('title', 'search')
        .or()
        .openBracket()
        .like('content', 'search')
        .and()
        .equal('status', 'published')
        .closeBracket()
        .closeBracket()
        .and()
        .notEqual('notebook', 'trash')
        .build();

      expect(result).toBe('(title~"search" || (content~"search" && status="published")) && notebook!="trash"');
    });

    test('should handle multiple bracket groups', () => {
      const result = query
        .openBracket()
        .like('title', 'test')
        .or()
        .like('content', 'test')
        .closeBracket()
        .and()
        .openBracket()
        .equal('status', 'active')
        .or()
        .equal('status', 'published')
        .closeBracket()
        .build();

      expect(result).toBe('(title~"test" || content~"test") && (status="active" || status="published")');
    });

    test('should handle complex query with empty values', () => {
      const result = query
        .openBracket()
        .like('title', 'search')
        .or()
        .like('content', '')
        .or()
        .like('description', 'search')
        .closeBracket()
        .and()
        .openBracket()
        .equal('status', 'active')
        .or()
        .equal('category', '')
        .or()
        .equal('status', 'published')
        .closeBracket()
        .build();

      expect(result).toBe('(title~"search" || description~"search") && (status="active" || status="published")');
    });
  });

  describe('All Operator Methods', () => {
    test('should handle all comparison operators', () => {
      const queries = [
        { method: 'equal', field: 'age', value: '25', expected: 'age="25"' },
        { method: 'notEqual', field: 'status', value: 'inactive', expected: 'status!="inactive"' },
        { method: 'greaterThan', field: 'age', value: '18', expected: 'age>"18"' },
        { method: 'greaterThanOrEqual', field: 'age', value: '18', expected: 'age>="18"' },
        { method: 'lessThan', field: 'price', value: '100', expected: 'price<"100"' },
        { method: 'lessThanOrEqual', field: 'price', value: '100', expected: 'price<="100"' },
        { method: 'like', field: 'name', value: 'John', expected: 'name~"John"' },
        { method: 'notLike', field: 'description', value: 'spam', expected: 'description!~"spam"' },
      ];

      queries.forEach(({ method, field, value, expected }) => {
        const testQuery = PocketbaseQuery.getInstance<TestRecord>();
        const result = (testQuery as any)[method](field, value).build();
        expect(result).toBe(expected);
      });
    });

    test('should handle array operators', () => {
      const queries = [
        { method: 'anyEqual', field: 'tags', value: 'important', expected: 'tags?="important"' },
        { method: 'anyNotEqual', field: 'tags', value: 'spam', expected: 'tags?!="spam"' },
        { method: 'anyGreaterThan', field: 'scores', value: '80', expected: 'scores?>"80"' },
        { method: 'anyGreaterThanOrEqual', field: 'scores', value: '80', expected: 'scores?>="80"' },
        { method: 'anyLessThan', field: 'scores', value: '60', expected: 'scores?<"60"' },
        { method: 'anyLessThanOrEqual', field: 'scores', value: '60', expected: 'scores?<="60"' },
        { method: 'anyLike', field: 'tags', value: 'tech', expected: 'tags?~"tech"' },
        { method: 'anyNotLike', field: 'tags', value: 'spam', expected: 'tags?!~"spam"' },
      ];

      queries.forEach(({ method, field, value, expected }) => {
        const testQuery = PocketbaseQuery.getInstance<TestRecord>();
        const result = (testQuery as any)[method](field, value).build();
        expect(result).toBe(expected);
      });
    });
  });

  describe('IN Method', () => {
    test('should handle IN with multiple values', () => {
      const result = query.in('category', ['electronics', 'furniture', 'books']).build();
      expect(result).toBe('category~"electronics" || category~"furniture" || category~"books"');
    });

    test('should filter out empty values in IN', () => {
      const result = query.in('category', ['electronics', '', 'furniture', null, 'books', undefined]).build();
      expect(result).toBe('category~"electronics" || category~"furniture" || category~"books"');
    });

    test('should handle empty array in IN', () => {
      const result = query.in('category', []).build();
      expect(result).toBe('');
    });

    test('should handle array with only empty values in IN', () => {
      const result = query.in('category', ['', null, undefined]).build();
      expect(result).toBe('');
    });
  });

  describe('Custom Filter', () => {
    test('should handle custom filter', () => {
      const result = query.customFilter('created > "2023-01-01"').build();
      expect(result).toBe('created > "2023-01-01"');
    });

    test('should combine custom filter with other conditions', () => {
      const result = query
        .equal('status', 'active')
        .and()
        .customFilter('created > "2023-01-01"')
        .build();
      expect(result).toBe('status="active" && created > "2023-01-01"');
    });

    test('should handle empty custom filter', () => {
      const result = query
        .equal('status', 'active')
        .and()
        .customFilter('')
        .and()
        .equal('category', 'tech')
        .build();
      expect(result).toBe('status="active" && category="tech"');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle completely empty query', () => {
      const result = query.build();
      expect(result).toBe('');
    });

    test('should handle only logical operators', () => {
      const result = query.and().or().build();
      expect(result).toBe('');
    });

    test('should handle only brackets', () => {
      const result = query.openBracket().closeBracket().build();
      expect(result).toBe('');
    });

    test('should handle nested empty brackets', () => {
      const result = query
        .openBracket()
        .openBracket()
        .closeBracket()
        .closeBracket()
        .and()
        .equal('status', 'active')
        .build();
      expect(result).toBe('status="active"');
    });

    test('should handle trailing operators', () => {
      const result = query
        .equal('status', 'active')
        .or()
        .build();
      expect(result).toBe('status="active"');
    });

    test('should handle leading operators in brackets', () => {
      const result = query
        .openBracket()
        .or()
        .equal('status', 'active')
        .closeBracket()
        .build();
      expect(result).toBe('(status="active")');
    });
  });

  describe('Query State Management', () => {
    test('should reset query after build', () => {
      query.equal('status', 'active');
      const firstResult = query.build();
      const secondResult = query.equal('category', 'tech').build();
      
      expect(firstResult).toBe('status="active"');
      expect(secondResult).toBe('category="tech"');
    });

    test('should maintain singleton behavior', () => {
      const query1 = PocketbaseQuery.getInstance<TestRecord>();
      const query2 = PocketbaseQuery.getInstance<TestRecord>();
      
      expect(query1).toBe(query2);
    });

    test('should reset state on getInstance', () => {
      query.equal('status', 'active');
      const newQuery = PocketbaseQuery.getInstance<TestRecord>();
      const result = newQuery.equal('category', 'tech').build();
      
      expect(result).toBe('category="tech"');
    });
  });

  describe('getQuery method', () => {
    test('should return current query without building', () => {
      query.equal('status', 'active').and().like('title', 'test');
      const currentQuery = query.getQuery();
      const builtQuery = query.build();
      
      expect(currentQuery).toBe('status="active" && title~"test"');
      expect(builtQuery).toBe('status="active" && title~"test"');
    });

    test('should show intermediate query state', () => {
      query.equal('status', 'active');
      expect(query.getQuery()).toBe('status="active"');
      
      query.and().like('title', 'test');
      expect(query.getQuery()).toBe('status="active" && title~"test"');
    });
  });

  describe('Real-world Usage Scenarios', () => {
    test('should handle search with filters scenario', () => {
      const searchTerm = 'javascript';
      const category = 'programming';
      const minPrice = '0';
      const maxPrice = '100';
      
      const result = query
        .openBracket()
        .like('title', searchTerm)
        .or()
        .like('description', searchTerm)
        .closeBracket()
        .and()
        .equal('category', category)
        .and()
        .greaterThanOrEqual('price', minPrice)
        .and()
        .lessThanOrEqual('price', maxPrice)
        .build();
      
      expect(result).toBe('(title~"javascript" || description~"javascript") && category="programming" && price>="0" && price<="100"');
    });

    test('should handle user permissions scenario', () => {
      const userId = 'user123';
      
      const result = query
        .openBracket()
        .equal('owner', userId)
        .or()
        .equal('visibility', 'public')
        .or()
        .anyEqual('collaborators', userId)
        .closeBracket()
        .and()
        .notEqual('status', 'deleted')
        .build();
      
      expect(result).toBe('(owner="user123" || visibility="public" || collaborators?="user123") && status!="deleted"');
    });

    test('should handle conditional search with optional filters', () => {
      const title = 'test';
      const category = '';
      const tags = 'tech';
      const status = '';
      
      const result = query
        .openBracket()
        .like('title', title)
        .or()
        .like('category', category)
        .or()
        .anyLike('tags', tags)
        .closeBracket()
        .and()
        .equal('status', status)
        .and()
        .equal('published', true)
        .build();
      console.log('resulteee:',result);
      expect(result).toBe('(title~"test" || tags?~"tech") && published=true');
    });
  });
});