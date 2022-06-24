import { PlistFormat } from '@plist/common';
import { readFileSync } from 'fs';
import path from 'path';
import { detectFormat, parse } from '../src';

const TEST_FILE_PATH = path.join(__dirname, '..', '..', '..', '__tests__');

describe('detectFormat', () => {
  it('correctly recognizes XML plists when passed as string', () => {
    const file = readFileSync(path.join(TEST_FILE_PATH, 'xml', 'test.plist'), {
      encoding: 'utf-8',
    });
    expect(detectFormat(file)).toBe(PlistFormat.XML);
  });
  it('correctly recognizes XML plists when passed as ArrayBuffer', () => {
    const { buffer } = new Uint8Array(
      readFileSync(path.join(TEST_FILE_PATH, 'xml', 'test.plist'))
    );
    expect(detectFormat(buffer)).toBe(PlistFormat.XML);
  });
  it('correctly recognizes binary plists when passed as string', () => {
    const file = readFileSync(
      path.join(TEST_FILE_PATH, 'binary', 'test.plist'),
      {
        encoding: 'utf-8',
      }
    );
    expect(detectFormat(file)).toBe(PlistFormat.BINARY);
  });
  it('correctly recognizes binary plists when passed as ArrayBuffer', () => {
    const { buffer } = new Uint8Array(
      readFileSync(path.join(TEST_FILE_PATH, 'binary', 'test.plist'))
    );
    expect(detectFormat(buffer)).toBe(PlistFormat.BINARY);
  });
  it('correctly recognizes OpenStep plists when passed as string', () => {
    const file = readFileSync(
      path.join(TEST_FILE_PATH, 'openstep', 'test.plist'),
      {
        encoding: 'utf-8',
      }
    );
    expect(detectFormat(file)).toBe(PlistFormat.OPENSTEP);
  });
  it('correctly recognizes OpenStep plists when passed as ArrayBuffer', () => {
    const { buffer } = new Uint8Array(
      readFileSync(path.join(TEST_FILE_PATH, 'openstep', 'test.plist'))
    );
    expect(detectFormat(buffer)).toBe(PlistFormat.OPENSTEP);
  });
});

describe('parse', () => {
  it('correctly parses XML plists when passed as string', () => {
    const file = readFileSync(path.join(TEST_FILE_PATH, 'xml', 'test.plist'), {
      encoding: 'utf-8',
    });
    expect(parse(file)).toStrictEqual({ hello: true });
  });
  it('correctly parses XML plists when passed as ArrayBuffer', () => {
    const { buffer } = new Uint8Array(
      readFileSync(path.join(TEST_FILE_PATH, 'xml', 'test.plist'))
    );
    expect(parse(buffer)).toStrictEqual({ hello: true });
  });
  it('throws when binary plists are passed as string', () => {
    const file = readFileSync(
      path.join(TEST_FILE_PATH, 'binary', 'test.plist'),
      {
        encoding: 'utf-8',
      }
    );
    expect(() => parse(file)).toThrow();
  });
  it('correctly parses binary plists when passed as ArrayBuffer', () => {
    const { buffer } = new Uint8Array(
      readFileSync(path.join(TEST_FILE_PATH, 'binary', 'test.plist'))
    );
    expect(parse(buffer)).toStrictEqual({
      hello: 'world',
      whats: 'up',
    });
  });
  it('correctly parses OpenStep plists when passed as string', () => {
    const file = readFileSync(
      path.join(TEST_FILE_PATH, 'openstep', 'test.plist'),
      {
        encoding: 'utf-8',
      }
    );
    expect(parse(file)).toStrictEqual({
      entry: 'value',
      array: ['a', 'b', 'c'],
    });
  });
  it('correctly parses OpenStep plists when passed as ArrayBuffer', () => {
    const { buffer } = new Uint8Array(
      readFileSync(path.join(TEST_FILE_PATH, 'openstep', 'test.plist'))
    );
    expect(parse(buffer)).toStrictEqual({
      entry: 'value',
      array: ['a', 'b', 'c'],
    });
  });
});
