import {
  Value,
  PlistFormat,
  HEADER_BINARY,
  HEADER_OPENSTEP_UTF8,
} from '@plist/common';
import { parse as parseBinary } from '@plist/binary.parse';
import { parse as parseXML } from '@plist/xml.parse';
import { parse as parseOpenstep } from '@plist/openstep.parse';

const IS_ASCII = /^[\u0000-\u007f]*$/;
const DECODER = new TextDecoder('utf-8');

export const detectFormat = (input: string | ArrayBuffer): PlistFormat => {
  if (typeof input === 'string') {
    if (input.startsWith(HEADER_BINARY)) {
      return PlistFormat.BINARY;
    }

    const trim = input.substring(0, 16).replace(/[\s\t\n\r]+/g, '');
    if (trim.startsWith('<?xml') || trim.startsWith('<plist')) {
      return PlistFormat.XML;
    }

    if (
      input.trimStart().startsWith(HEADER_OPENSTEP_UTF8) ||
      IS_ASCII.test(trim)
    ) {
      return PlistFormat.OPENSTEP;
    }

    throw new Error('Unknown format');
  } else {
    const headerBytes = input.slice(0, HEADER_BINARY.length);
    if (DECODER.decode(headerBytes) === HEADER_BINARY) {
      return PlistFormat.BINARY;
    }

    return detectFormat(DECODER.decode(input.slice(0, 16)));
  }
};

export const parse = (input: string | ArrayBuffer): Value => {
  const format = detectFormat(input);

  switch (format) {
    case PlistFormat.BINARY:
      if (typeof input === 'string') {
        throw new Error('Binary plists must be passed as ArrayBuffer');
      }

      return parseBinary(input);
    case PlistFormat.XML:
      if (input instanceof ArrayBuffer) {
        return parseXML(DECODER.decode(input));
      }

      return parseXML(input);
    case PlistFormat.OPENSTEP:
      if (input instanceof ArrayBuffer) {
        return parseOpenstep(DECODER.decode(input));
      }

      return parseOpenstep(input);
  }

  throw new Error('Unsupported format');
};
