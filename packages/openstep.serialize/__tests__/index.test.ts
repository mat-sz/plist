import { serialize } from '../src';

const encoder = new TextEncoder();

describe('openstep:serialize', () => {
  describe('string', () => {
    it('serializes unquoted strings', () => {
      expect(serialize('test')).toBe('test');
      expect(serialize('testTEST1234_$+/:.-')).toBe('testTEST1234_$+/:.-');
    });

    it('serializes quoted strings', () => {
      expect(serialize('test abc def')).toBe('"test abc def"');
    });

    it('serializes numbers', () => {
      expect(serialize(1234)).toBe('1234');
      expect(serialize(12.34)).toBe('12.34');
      expect(serialize(BigInt('123123123123123123123'))).toBe(
        '123123123123123123123'
      );
    });

    it('serializes booleans', () => {
      expect(serialize(true)).toBe('1');
      expect(serialize(false)).toBe('0');
    });

    it('escapes characters', () => {
      expect(serialize('test"hello')).toBe('"test\\"hello"');
      expect(serialize('\u1000')).toBe('"\\u1000"');
      expect(serialize('✓')).toBe('"\\u2713"');
    });
  });

  describe('data', () => {
    it('serializes data', () => {
      expect(serialize(encoder.encode('😊').buffer)).toBe('<f09f988a>');
    });
  });

  describe('array', () => {
    it('serializes arrays', () => {
      expect(serialize([])).toBe('()');
      expect(serialize(['a', 'b', 'c'])).toBe('(a,b,c)');
      expect(serialize([1, 2, 3])).toBe('(1,2,3)');
    });

    it('serializes nested arrays', () => {
      expect(serialize([[[]]])).toBe('((()))');
      expect(serialize(['a', ['b', ['c']]])).toBe('(a,(b,(c)))');
    });
  });

  describe('dict', () => {
    it('serializes dicts', () => {
      expect(serialize({})).toBe('{}');
      expect(serialize({ test: 'test' })).toBe('{test=test;}');
      expect(serialize({ test: 'test', hello: 'world' })).toBe(
        '{test=test;hello=world;}'
      );
    });

    it('serializes nested dicts', () => {
      expect(serialize({ hello: { world: true } })).toBe('{hello={world=1;};}');
      expect(serialize({ hello: ['a', 'b', 'c'] })).toBe('{hello=(a,b,c);}');
    });

    it('serializes data in dictionary', () => {
      expect(serialize({ hello: encoder.encode('😊').buffer })).toBe(
        '{hello=<f09f988a>;}'
      );
    });
  });
});
