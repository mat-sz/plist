import path from 'path';
import { readFileSync } from 'fs';
import { TextEncoder } from 'util';
import { parse } from '../src';

const encoder = new TextEncoder();
const TEST_FILE_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '__tests__',
  'binary'
);

describe('binary:parse', () => {
  describe('string', () => {
    it('parses strings', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'string.plist'))
      );
      const string = parse(buffer) as any;

      expect(string).toBe('test');
    });

    it('parses UTF-16 strings', () => {
      const { buffer } = new Uint8Array(
        readFileSync(
          path.join(TEST_FILE_PATH, 'data_types', 'string-utf16.plist')
        )
      );
      const string = parse(buffer) as any;

      expect(string).toBe('天翼阅读');
    });
  });

  describe('boolean', () => {
    it('parses true', () => {
      const { buffer } = new Uint8Array(
        readFileSync(
          path.join(TEST_FILE_PATH, 'data_types', 'boolean-true.plist')
        )
      );
      const bool = parse(buffer) as any;

      expect(bool).toBe(true);
    });

    it('parses false', () => {
      const { buffer } = new Uint8Array(
        readFileSync(
          path.join(TEST_FILE_PATH, 'data_types', 'boolean-false.plist')
        )
      );
      const bool = parse(buffer) as any;

      expect(bool).toBe(false);
    });
  });

  describe('number', () => {
    it('parses floating point numbers', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'double.plist'))
      );
      const int = parse(buffer) as any;

      expect(int).toBe(20.22);
    });

    it('parses bytes', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'byte.plist'))
      );
      const int = parse(buffer) as any;

      expect(int).toBe(2);
    });

    it('parses 2-byte numbers', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'short.plist'))
      );
      const int = parse(buffer) as any;

      expect(int).toBe(256);
    });

    it('parses 4-byte numbers', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'int.plist'))
      );
      const int = parse(buffer) as any;

      expect(int).toBe(70000);
    });

    it('parses 8-byte numbers', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'long.plist'))
      );
      const int = parse(buffer) as any;

      expect(int).toBe(BigInt(4394967295));
    });

    it('parses signed numbers', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'signed.plist'))
      );
      const int = parse(buffer) as any;

      expect(int).toBe(BigInt(-2022));
    });
  });

  describe('UID', () => {
    it('parses UID', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'uid.plist'))
      );
      const uid = parse(buffer) as any;

      expect(uid).toStrictEqual({ CF$UID: 8 });
    });
  });

  describe('dict', () => {
    it('parses string dictionaries', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'dict.plist'))
      );
      const dict = parse(buffer) as any;

      expect(dict).toStrictEqual({
        hello: 'world',
        whats: 'up',
      });
    });

    it('parses nested dictionaries', () => {
      const { buffer } = new Uint8Array(
        readFileSync(
          path.join(TEST_FILE_PATH, 'data_types', 'dict-nested.plist')
        )
      );
      const dict = parse(buffer) as any;

      expect(dict).toStrictEqual({
        hello: {
          nested: {
            dict: true,
          },
        },
      });
    });
  });

  describe('array', () => {
    it('parses string arrays', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'array.plist'))
      );
      const array = parse(buffer) as any;

      expect(array).toStrictEqual(['hello', 'world']);
    });

    it('parses utf-16 string arrays', () => {
      const { buffer } = new Uint8Array(
        readFileSync(
          path.join(TEST_FILE_PATH, 'data_types', 'array-emoji.plist')
        )
      );
      const array = parse(buffer) as any;

      expect(array).toStrictEqual(['😋', '👌']);
    });

    it('parses nested arrays', () => {
      const { buffer } = new Uint8Array(
        readFileSync(
          path.join(TEST_FILE_PATH, 'data_types', 'array-nested.plist')
        )
      );
      const array = parse(buffer) as any;

      expect(array).toStrictEqual(['hello', ['nested', ['array']]]);
    });

    it('parses arrays with dictionaries', () => {
      const { buffer } = new Uint8Array(
        readFileSync(
          path.join(TEST_FILE_PATH, 'data_types', 'array-dict.plist')
        )
      );
      const array = parse(buffer) as any;

      expect(array).toStrictEqual(['hello', { world: true }]);
    });
  });

  describe('date', () => {
    it('parses dates', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'date.plist'))
      );
      const date = parse(buffer) as any;

      expect(date).toStrictEqual(new Date('2022-01-01T01:01:01Z'));
    });
  });

  describe('data', () => {
    it('parses data', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'data.plist'))
      );
      const data = parse(buffer) as any;

      expect(new Uint8Array(data)).toStrictEqual(encoder.encode('✓ à la mode'));
    });
  });

  describe('integration', () => {
    it('iTunes Small', () => {
      const { buffer } = new Uint8Array(
        readFileSync(
          path.join(TEST_FILE_PATH, 'data_parse', 'iTunes-small.plist')
        )
      );
      const dict = parse(buffer) as any;

      expect(dict['Application Version']).toBe('9.0.3');
      expect(dict['Library Persistent ID']).toBe('6F81D37F95101437');
    });

    it('sample1', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_parse', 'sample1.plist'))
      );
      const dict = parse(buffer) as any;

      expect(dict['CFBundleIdentifier']).toBe('com.apple.dictionary.MySample');
    });

    it('sample2', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_parse', 'sample2.plist'))
      );
      const dict = parse(buffer) as any;

      expect(dict['PopupMenu'][2]['Key']).toBe(
        '\n        #import <Cocoa/Cocoa.h>\n\n#import <MacRuby/MacRuby.h>\n\nint main(int argc, char *argv[])\n{\n  return macruby_main("rb_main.rb", argc, argv);\n}\n'
      );
    });

    it('airplay', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_parse', 'airplay.plist'))
      );
      const dict = parse(buffer) as any;

      expect(dict['duration']).toBe(5555.0495000000001);
      expect(dict['position']).toBe(4.6269989039999997);
    });

    it('utf16', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_parse', 'utf16.plist'))
      );
      const dict = parse(buffer) as any;

      expect(dict['CFBundleName']).toBe('sellStuff');
      expect(dict['CFBundleShortVersionString']).toBe('2.6.1');
      expect(dict['NSHumanReadableCopyright']).toBe(
        '©2008-2012, sellStuff, Inc.'
      );
    });

    it('utf16chinese', () => {
      const { buffer } = new Uint8Array(
        readFileSync(
          path.join(TEST_FILE_PATH, 'data_parse', 'utf16_chinese.plist')
        )
      );
      const dict = parse(buffer) as any;

      expect(dict['CFBundleName']).toBe('天翼阅读');
      expect(dict['CFBundleDisplayName']).toBe('天翼阅读');
    });

    it('uid', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_parse', 'uid.plist'))
      );
      const dict = parse(buffer) as any;

      expect(dict['$objects'][1]['NS.keys']).toStrictEqual([
        { CF$UID: 2 },
        { CF$UID: 3 },
        { CF$UID: 4 },
      ]);
      expect(dict['$objects'][1]['NS.objects']).toStrictEqual([
        { CF$UID: 5 },
        { CF$UID: 6 },
        { CF$UID: 7 },
      ]);
      expect(dict['$top']['root']).toStrictEqual({ CF$UID: 1 });
    });

    it('int64', () => {
      const { buffer } = new Uint8Array(
        readFileSync(path.join(TEST_FILE_PATH, 'data_parse', 'int64.plist'))
      );
      const dict = parse(buffer) as any;

      expect(dict['zero']).toBe(0);
      expect(dict['int32item']).toBe(1234567890);
      expect(dict['int32itemsigned']).toBe(BigInt('-1234567890'));
      expect(dict['int64item']).toBe(BigInt('12345678901234567890'));
    });
  });
});
