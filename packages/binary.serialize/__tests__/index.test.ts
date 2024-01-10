import path from 'path';
import { readFileSync } from 'fs';
import { serialize } from '../src/index.js';

const encoder = new TextEncoder();
const TEST_FILE_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '__tests__',
  'binary'
);

describe('binary:serialize', () => {
  describe('string', () => {
    it('serializes strings', () => {
      expect(new Uint8Array(serialize('test'))).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'string.plist'))
        )
      );
    });

    it('serializes UTF-16 strings', () => {
      expect(new Uint8Array(serialize('天翼阅读'))).toEqual(
        new Uint8Array(
          readFileSync(
            path.join(TEST_FILE_PATH, 'data_types', 'string-utf16.plist')
          )
        )
      );
    });
  });

  describe('boolean', () => {
    it('serializes true', () => {
      expect(new Uint8Array(serialize(true))).toEqual(
        new Uint8Array(
          readFileSync(
            path.join(TEST_FILE_PATH, 'data_types', 'boolean-true.plist')
          )
        )
      );
    });

    it('serializes false', () => {
      expect(new Uint8Array(serialize(false))).toEqual(
        new Uint8Array(
          readFileSync(
            path.join(TEST_FILE_PATH, 'data_types', 'boolean-false.plist')
          )
        )
      );
    });
  });

  describe('number', () => {
    it('serializes floating point numbers', () => {
      expect(new Uint8Array(serialize(20.22))).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'double.plist'))
        )
      );
    });

    it('serializes bytes', () => {
      expect(new Uint8Array(serialize(2))).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'byte.plist'))
        )
      );
    });

    it('serializes 2-byte numbers', () => {
      expect(new Uint8Array(serialize(256))).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'short.plist'))
        )
      );
    });

    it('serializes 4-byte numbers', () => {
      expect(new Uint8Array(serialize(70000))).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'int.plist'))
        )
      );
    });

    it('serializes 8-byte numbers', () => {
      expect(new Uint8Array(serialize(4394967295))).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'long.plist'))
        )
      );
    });

    it('serializes signed numbers', () => {
      expect(new Uint8Array(serialize(-2022))).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'signed.plist'))
        )
      );
    });
  });

  describe('UID', () => {
    it('serializes UID', () => {
      expect(new Uint8Array(serialize({ CF$UID: 8 }))).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'uid.plist'))
        )
      );
    });
  });

  describe('dict', () => {
    it('serializes string dictionaries', () => {
      expect(
        new Uint8Array(
          serialize({
            hello: 'world',
            whats: 'up',
          })
        )
      ).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'dict.plist'))
        )
      );
    });

    it('serializes nested dictionaries', () => {
      expect(
        new Uint8Array(
          serialize({
            hello: {
              nested: {
                dict: true,
              },
            },
          })
        )
      ).toEqual(
        new Uint8Array(
          readFileSync(
            path.join(TEST_FILE_PATH, 'data_types', 'dict-nested.plist')
          )
        )
      );
    });
  });

  describe('array', () => {
    it('serializes string arrays', () => {
      expect(new Uint8Array(serialize(['hello', 'world']))).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'array.plist'))
        )
      );
    });

    it('serializes utf-16 string arrays', () => {
      expect(new Uint8Array(serialize(['😋', '👌']))).toEqual(
        new Uint8Array(
          readFileSync(
            path.join(TEST_FILE_PATH, 'data_types', 'array-emoji.plist')
          )
        )
      );
    });

    it('serializes nested arrays', () => {
      expect(
        new Uint8Array(serialize(['hello', ['nested', ['array']]]))
      ).toEqual(
        new Uint8Array(
          readFileSync(
            path.join(TEST_FILE_PATH, 'data_types', 'array-nested.plist')
          )
        )
      );
    });

    it('serializes arrays with dictionaries', () => {
      expect(new Uint8Array(serialize(['hello', { world: true }]))).toEqual(
        new Uint8Array(
          readFileSync(
            path.join(TEST_FILE_PATH, 'data_types', 'array-dict.plist')
          )
        )
      );
    });
  });

  describe('date', () => {
    it('serializes dates', () => {
      expect(
        new Uint8Array(serialize(new Date('2022-01-01T01:01:01Z')))
      ).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'date.plist'))
        )
      );
    });
  });

  describe('data', () => {
    it('serializes data', () => {
      expect(
        new Uint8Array(serialize(encoder.encode('✓ à la mode').buffer))
      ).toEqual(
        new Uint8Array(
          readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'data.plist'))
        )
      );
    });
  });
});
