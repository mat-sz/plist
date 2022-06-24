import { fromByteArray } from 'base64-js';
import { XMLBuilder } from 'fast-xml-parser';
import { Value } from '@plist/common';

const builder = new XMLBuilder({
  preserveOrder: true,
  suppressEmptyNode: true,
});

const pad = (n: number) => {
  return n < 10 ? '0' + n : n;
};

const ISODateString = (d: Date): string => {
  return (
    d.getUTCFullYear() +
    '-' +
    pad(d.getUTCMonth() + 1) +
    '-' +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    ':' +
    pad(d.getUTCMinutes()) +
    ':' +
    pad(d.getUTCSeconds()) +
    'Z'
  );
};

const getStringNode = (type: string, value: string): any => {
  return { [type]: [{ '#text': value }] };
};

const serializeValue = (value: Value): any => {
  if (value === null) {
    throw new Error('Unsupported null value');
  }

  switch (typeof value) {
    case 'string':
      return getStringNode('string', value);
    case 'bigint':
      return getStringNode('integer', value.toString());
    case 'number':
      return getStringNode(
        Number.isInteger(value) ? 'integer' : 'real',
        value.toString()
      );
    case 'boolean':
      return { [value ? 'true' : 'false']: [] };
    case 'object':
      if (Array.isArray(value)) {
        return { array: value.map(serializeValue) };
      } else if (value instanceof Date) {
        return getStringNode('date', ISODateString(value));
      } else if (value instanceof ArrayBuffer) {
        return getStringNode('data', fromByteArray(new Uint8Array(value)));
      } else {
        const dict: any[] = [];
        for (const key of Object.keys(value)) {
          if (typeof value[key] === 'undefined' || value[key] === null) {
            continue;
          }

          dict.push(getStringNode('key', key));
          dict.push(serializeValue(value[key]));
        }
        return { dict };
      }
  }

  throw new Error(`Unsupported type '${typeof value}'`);
};

export const serialize = (value: Value): string => {
  const xml = builder.build([serializeValue(value)]);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
${xml}
</plist>`;
};
