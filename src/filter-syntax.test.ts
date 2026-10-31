import PocketbaseQuery from '.';

interface Post {
  title: string;
  views: number;
  published: boolean;
  created: string;
  tags: string[];
  author: string;
}

describe('PocketBase filter syntax', () => {
  let query: PocketbaseQuery<Post>;

  beforeEach(() => {
    query = PocketbaseQuery.getInstance<Post>();
  });

  describe('value escaping', () => {
    it('escapes double quotes so a value cannot break out of its string', () => {
      const result = query.equal('author', 'x" || author != "').build();
      expect(result).toBe('author="x\\" || author != \\""');
    });

    it('escapes backslashes', () => {
      expect(query.equal('title', 'a\\b').build()).toBe('title="a\\\\b"');
    });

    it('keeps brackets, operators and spacing inside values untouched', () => {
      const result = query
        .openBracket()
        .like('title', '() &&  ||')
        .and()
        .notEqual('author', '')
        .closeBracket()
        .build();
      expect(result).toBe('(title~"() &&  ||")');
    });

    it('escapes values passed to in()', () => {
      expect(query.in('author', ['a"b']).build()).toBe('author~"a\\"b"');
    });
  });

  describe('typed values', () => {
    it('writes numbers without quotes', () => {
      expect(query.greaterThan('views', 50).and().lessThanOrEqual('views', 0).build()).toBe(
        'views>50 && views<=0'
      );
    });

    it('skips NaN', () => {
      expect(query.equal('views', NaN).and().equal('published', false).build()).toBe(
        'published=false'
      );
    });

    it('writes dates in PocketBase datetime format', () => {
      const result = query
        .greaterThanOrEqual('created', new Date('2026-01-02T03:04:05.000Z'))
        .build();
      expect(result).toBe('created>="2026-01-02 03:04:05.000Z"');
    });
  });

  describe('datetime macros', () => {
    it('writes macros without quotes', () => {
      const result = query
        .greaterThanOrEqual('created', '@todayStart')
        .and()
        .lessThan('created', '@now')
        .build();
      expect(result).toBe('created>=@todayStart && created<@now');
    });

    it('quotes strings that only look like macros', () => {
      expect(query.equal('title', '@nowhere').build()).toBe('title="@nowhere"');
    });
  });

  describe('field paths', () => {
    it('accepts field modifiers', () => {
      const result = query
        .like('title:lower', 'test')
        .and()
        .greaterThan('tags:length', 1)
        .and()
        .like('tags:each', 'news')
        .build();
      expect(result).toBe('title:lower~"test" && tags:length>1 && tags:each~"news"');
    });

    it('accepts relation paths', () => {
      expect(query.equal('author.name', 'John').build()).toBe('author.name="John"');
    });

    it('keeps a closing bracket followed by a modified field joined with &&', () => {
      const result = query
        .openBracket()
        .equal('published', true)
        .closeBracket()
        .greaterThan('tags:length', 0)
        .build();
      expect(result).toBe('(published=true) && tags:length>0');
    });
  });

  describe('customFilter', () => {
    it('leaves quoted text inside a custom filter untouched', () => {
      const result = query
        .customFilter('strftime(\'%Y-%m\', created) = "2026-01"')
        .and()
        .customFilter('geoDistance(address.lon, address.lat, 23.32, 42.69) < 25')
        .build();
      expect(result).toBe(
        'strftime(\'%Y-%m\', created) = "2026-01" && geoDistance(address.lon, address.lat, 23.32, 42.69) < 25'
      );
    });
  });
});
