import { XMLParser } from 'fast-xml-parser';
import { toByteArray } from 'base64-js';
import { Dictionary, Value } from '@plist/common';

const parser = new XMLParser({
  preserveOrder: true,
  ignoreDeclaration: true,
  ignorePiTags: true,
  parseTagValue: false,
  cdataPropName: '#cdata',
});

const isEmpty = (value: any) => {
  return typeof value === 'undefined' || value === null || value === '';
};

const parseObject = (object: any): Value => {
  const keys = Object.keys(object);
  if (keys.length !== 1) {
    throw new Error(
      'An object must only contain a tag name and no properties.'
    );
  }

  const tag = keys[0];
  const value = object[tag]?.[0]?.['#text'];

  switch (tag) {
    case 'dict':
      const length = object[tag]?.length;
      if (length === 0) {
        return {};
      }

      if (length > 1 && length % 2 === 1) {
        throw new Error('Invalid dictionary.');
      }

      const result: Dictionary = {};
      for (let i = 0; i < length; i += 2) {
        const key = object[tag][i];
        const value = object[tag][i + 1];

        if (!key.hasOwnProperty('key')) {
          throw new Error('Expected <key>');
        }

        if (!value) {
          throw new Error('Value missing for key inside <dict>');
        }

        const keyText = key?.['key']?.[0]?.['#text'] || '';
        if (keyText === '__proto__') {
          throw new Error('Attempted prototype pollution.');
        }

        result[keyText] = parseObject(value);
      }

      return result;
    case 'array':
      return object[tag]?.map(parseObject);
    case 'string':
      const values = object[tag];
      if (values.length === 0) {
        return '';
      }

      return values.reduce((result: string, value: any) => {
        if (value.hasOwnProperty('#cdata')) {
          result += value['#cdata'].reduce((result: string, cdata: any) => {
            return result + cdata['#text'];
          }, '');
        }

        if (value.hasOwnProperty('#text')) {
          result += value['#text'];
        }

        return result;
      }, '');
    case 'integer':
      if (isEmpty(value)) {
        throw new Error('Encountered empty <integer>');
      }

      if (value > Number.MAX_SAFE_INTEGER) {
        return BigInt(value);
      }

      return parseInt(value);
    case 'real':
      if (isEmpty(value)) {
        throw new Error('Encountered empty <real>');
      }

      return parseFloat(value);
    case 'data':
      if (isEmpty(value)) {
        return new Uint8Array([]).buffer;
      }

      return toByteArray(value.replace(/[\s\r\n\t]*/g, '')).buffer;
    case 'date':
      if (isEmpty(value)) {
        throw new Error('Encountered empty <date>');
      }

      return new Date(value);
    case 'true':
      return true;
    case 'false':
      return false;
  }

  throw new Error('Invalid type.');
};

export const parse = (input: string): Value => {
  const parsedXml = parser.parse(input);

  if (!Array.isArray(parsedXml)) {
    throw new Error('Invalid XML.');
  }

  const plists = parsedXml.filter(obj => obj.hasOwnProperty('plist'));
  if (plists.length !== 1) {
    throw new Error('The document must contain exactly one plist tag.');
  }

  const plist = plists[0]['plist'];
  if (!Array.isArray(plist)) {
    throw new Error('plist tag must contain objects.');
  }

  if (plist.length !== 1) {
    throw new Error('plist tag must contain exactly one object.');
  }

  return parseObject(plist[0]);
};
