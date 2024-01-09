import { parse } from '../src';
import { TextDecoder } from 'util';

const decoder = new TextDecoder('utf-8');

describe('openstep:parse', () => {
  describe('string', () => {
    it('parses strings', () => {
      expect(parse('"test"')).toBe('test');
      expect(parse('test')).toBe('test');
      expect(parse('1234')).toBe('1234');
      expect(parse('12.34')).toBe('12.34');
      expect(parse('YES')).toBe('YES');
    });

    it('parses strings with escape characters', () => {
      expect(parse('"te\\"st"')).toBe('te"st');
      expect(parse('"te\\\\st"')).toBe('te\\st');
    });

    it('throws on invalid quoted strings', () => {
      expect(() => parse('"""')).toThrow();
    });

    it('throws on invalid unquoted strings', () => {
      expect(() => parse('%TEST')).toThrow();
    });
  });

  describe('data', () => {
    it('parses data', () => {
      const buffer = parse('<F09F988A>') as ArrayBuffer;
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(decoder.decode(buffer)).toBe('😊');
    });

    it('parses data with whitespace', () => {
      const buffer = parse('< F0 9F 98 8A >') as ArrayBuffer;
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(decoder.decode(buffer)).toBe('😊');
    });

    it('parses data with lowercase hex digits', () => {
      const buffer = parse('<f09f988A>') as ArrayBuffer;
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(decoder.decode(buffer)).toBe('😊');
    });

    it('throws on comments in data', () => {
      expect(() => parse('< F0 9F /* test */ 98 8A >')).toThrow();
    });
  });

  describe('array', () => {
    it('parses string arrays', () => {
      expect(parse('("a", "b", "c")')).toStrictEqual(['a', 'b', 'c']);
      expect(parse('(a, b, c)')).toStrictEqual(['a', 'b', 'c']);
      expect(parse('(a,b, c     )')).toStrictEqual(['a', 'b', 'c']);
    });
  });

  describe('dict', () => {
    it('parses empty dicts', () => {
      expect(parse('{}')).toStrictEqual({});
    });

    it('parses dicts', () => {
      expect(parse('{"test" = "value";}')).toStrictEqual({ test: 'value' });
      expect(parse('{"test" = value;}')).toStrictEqual({ test: 'value' });
      expect(parse('{test = "value";}')).toStrictEqual({ test: 'value' });
      expect(parse('{test = value;}')).toStrictEqual({ test: 'value' });
      expect(
        parse('{"test" = "value"; "another" = "something";}')
      ).toStrictEqual({ test: 'value', another: 'something' });
      expect(parse('{"test" = value; another = "something";}')).toStrictEqual({
        test: 'value',
        another: 'something',
      });
    });

    it('parses nested dicts', () => {
      expect(parse('{"test" = {"value" = "something";};}')).toStrictEqual({
        test: { value: 'something' },
      });
    });

    it('parses nested arrays', () => {
      expect(parse('{"test" = (a, b, c);}')).toStrictEqual({
        test: ['a', 'b', 'c'],
      });
    });

    it('parses nested data', () => {
      const parsed = parse('{"test" = <F09F988A>;}') as any;
      expect(parsed).toHaveProperty('test');
      expect(parsed['test']).toBeInstanceOf(ArrayBuffer);
      expect(decoder.decode(parsed['test'])).toBe('😊');
    });

    it('throws on missing trailing semicolons', () => {
      expect(() => parse('{"test" = "value"}')).toThrow();
      expect(() => parse('{"test" = "value"; "anything" = "else"}')).toThrow();
    });
  });

  describe('comment', () => {
    it('returns null when the input consists only of comments', () => {
      expect(parse('/* comments only */')).toBe(null);
      expect(parse('// comments only')).toBe(null);
    });

    it('ignores comments in output', () => {
      expect(
        parse('{/* comments */ test /* more comments*/ = test /*comment*/;}')
      ).toStrictEqual({ test: 'test' });
      expect(
        parse(`{
        // comments
        hello = /*comment*/"world"; // hello
        /* some comment */
      }`)
      ).toStrictEqual({ hello: 'world' });
    });

    it('throws an error if a comment follows an unquoted string', () => {
      // Expected behavior based on plutil.
      expect(() => parse('test/* comment */')).toThrow();
    });
  });

  describe('invalid', () => {
    it('throws on invalid input', () => {
      expect(() => parse('{;}')).toThrow();
      expect(() => parse('[2]')).toThrow();
      expect(() => parse('{"a" =')).toThrow();
    });

    it('throws on unbalanced quotes', () => {
      expect(() => parse('"test')).toThrow();
      expect(() => parse('test"')).toThrow();
    });

    it('throws on unbalanced parentheses', () => {
      expect(() => parse('(test))')).toThrow();
      expect(() => parse('((test)')).toThrow();
    });

    it('throws on unbalanced brackets', () => {
      expect(() => parse('{"test" = "test";}}')).toThrow();
      expect(() => parse('{{"test" = "test";}')).toThrow();
    });

    it('throws on commas as dict separator', () => {
      expect(() => parse('{"test" = "value", "anything" = "else"}')).toThrow();
    });
  });
});
