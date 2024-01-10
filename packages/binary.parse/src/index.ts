import { Dictionary, Value, HEADER_BINARY, EPOCH } from '@plist/common';

const maxObjectSize = 100 * 1000 * 1000; // 100Meg
const maxObjectCount = 32768;

const DECODER_UTF8 = new TextDecoder('utf-8');
const DECODER_UTF16 = new TextDecoder('utf-16');

function readDouble(buffer: ArrayBuffer, start = 0) {
  return new DataView(buffer).getFloat64(start, false);
}

function readFloat(buffer: ArrayBuffer, start = 0) {
  return new DataView(buffer).getFloat32(start, false);
}

function readUInt8(buffer: ArrayBuffer, start = 0) {
  return new DataView(buffer).getUint8(start);
}

function readUInt16(buffer: ArrayBuffer, start = 0) {
  return new DataView(buffer).getUint16(start, false);
}

function readUInt32(buffer: ArrayBuffer, start = 0) {
  return new DataView(buffer).getUint32(start, false);
}

function readUInt64(buffer: ArrayBuffer, start = 0) {
  return new DataView(buffer).getBigUint64(start, false);
}

function readUInt(buffer: ArrayBuffer) {
  switch (buffer.byteLength) {
    case 1:
      return readUInt8(buffer);
    case 2:
      return readUInt16(buffer);
    case 4:
      return readUInt32(buffer);
    case 8:
      return readUInt64(buffer);
    case 16:
      // No support for 128-bit numbers.
      return readUInt64(buffer, 8);
  }

  throw new Error(`Invalid unsigned int length: ${buffer.byteLength}`);
}

function readInt8(buffer: ArrayBuffer, start = 0) {
  return new DataView(buffer).getInt8(start);
}

function readInt16(buffer: ArrayBuffer, start = 0) {
  return new DataView(buffer).getInt16(start, false);
}

function readInt32(buffer: ArrayBuffer, start = 0) {
  return new DataView(buffer).getInt32(start, false);
}

function readInt64(buffer: ArrayBuffer, start = 0) {
  return new DataView(buffer).getBigInt64(start, false);
}

function readInt(buffer: ArrayBuffer) {
  switch (buffer.byteLength) {
    case 1:
      return readInt8(buffer);
    case 2:
      return readInt16(buffer);
    case 4:
      return readInt32(buffer);
    case 8:
      return readInt64(buffer);
    case 16:
      // No support for 128-bit numbers.
      // Also, we assume unsigned here.
      return readUInt64(buffer, 8);
  }

  throw new Error(`Invalid int length: ${buffer.byteLength}`);
}

function swapBytes(buffer: ArrayBuffer) {
  const array = new Uint8Array(buffer);
  for (let i = 0; i < array.length; i += 2) {
    const a = array[i];
    array[i] = array[i + 1];
    array[i + 1] = a;
  }
  return array.buffer;
}

export const parse = (buffer: ArrayBuffer): Value => {
  // check header
  const headerBytes = buffer.slice(0, HEADER_BINARY.length);
  if (DECODER_UTF8.decode(headerBytes) !== HEADER_BINARY) {
    throw new Error(
      `Invalid binary plist. Expected '${HEADER_BINARY}' at offset 0.`
    );
  }

  // Handle trailer, last 32 bytes of the file
  const trailer = buffer.slice(buffer.byteLength - 32, buffer.byteLength);
  // 6 null bytes (index 0 to 5)
  const offsetSize = readUInt8(trailer, 6);
  const objectRefSize = readUInt8(trailer, 7);
  const numObjects = Number(readUInt64(trailer, 8));
  const topObject = Number(readUInt64(trailer, 16));
  const offsetTableOffset = Number(readUInt64(trailer, 24));

  if (numObjects > maxObjectCount) {
    throw new Error('maxObjectCount exceeded');
  }

  // Handle offset table
  const offsetTable: number[] = [];
  for (let i = 0; i < numObjects; i++) {
    const offsetBytes = buffer.slice(
      offsetTableOffset + i * offsetSize,
      offsetTableOffset + (i + 1) * offsetSize
    );

    offsetTable[i] = Number(readUInt(offsetBytes));
  }

  // Parses an object inside the currently parsed binary property list.
  // For the format specification check
  // https://www.opensource.apple.com/source/CF/CF-635/CFBinaryPList.c
  // (Apple's binary property list parser implementation)
  function parseObject(tableOffset: number): Value {
    const offset = offsetTable[tableOffset];
    const type = readUInt8(buffer, offset);
    const objType = (type & 0xf0) >> 4; // First 4 bits
    const objInfo = type & 0x0f; // Second 4 bits
    switch (objType) {
      case 0x0:
        return parseSimple();
      case 0x1:
        return parseInteger();
      case 0x8:
        return parseUID();
      case 0x2:
        return parseReal();
      case 0x3:
        return parseDate();
      case 0x4:
        return parseData();
      case 0x5: // ASCII
        return parsePlistString();
      case 0x6: // UTF-16
        return parsePlistString(true);
      case 0xa:
        return parseArray();
      case 0xd:
        return parseDictionary();
      default:
        throw new Error('Unhandled type 0x' + objType.toString(16));
    }

    function parseSimple() {
      //Simple
      switch (objInfo) {
        case 0x0: // null
          return null;
        case 0x8: // false
          return false;
        case 0x9: // true
          return true;
        case 0xf: // filler byte
          return null;
        default:
          throw new Error('Unhandled simple type 0x' + objType.toString(16));
      }
    }

    function parseInteger() {
      const length = Math.pow(2, objInfo);
      if (length < maxObjectSize) {
        const data = buffer.slice(offset + 1, offset + 1 + length);
        return readInt(data);
      }
      throw new Error(
        'Too little heap space available! Wanted to read ' +
          length +
          ' bytes, but only ' +
          maxObjectSize +
          ' are available.'
      );
    }

    function parseUID() {
      const length = objInfo + 1;
      if (length < maxObjectSize) {
        return {
          CF$UID: readUInt(buffer.slice(offset + 1, offset + 1 + length)),
        };
      }
      throw new Error(
        'Too little heap space available! Wanted to read ' +
          length +
          ' bytes, but only ' +
          maxObjectSize +
          ' are available.'
      );
    }

    function parseReal() {
      const length = Math.pow(2, objInfo);
      if (length < maxObjectSize) {
        const realBuffer = buffer.slice(offset + 1, offset + 1 + length);
        if (length === 4) {
          return readFloat(realBuffer);
        } else if (length === 8) {
          return readDouble(realBuffer);
        }

        throw new Error(`Invalid real length: ${length}`);
      } else {
        throw new Error(
          'Too little heap space available! Wanted to read ' +
            length +
            ' bytes, but only ' +
            maxObjectSize +
            ' are available.'
        );
      }
    }

    function parseDate() {
      if (objInfo != 0x3) {
        console.error('Unknown date type :' + objInfo + '. Parsing anyway...');
      }
      const dateBuffer = buffer.slice(offset + 1, offset + 9);
      return new Date(EPOCH + 1000 * readDouble(dateBuffer));
    }

    function parseData() {
      let dataoffset = 1;
      let length: number = objInfo;
      if (objInfo == 0xf) {
        const int_type = readInt8(buffer, offset + 1);
        const intType = (int_type & 0xf0) / 0x10;
        if (intType != 0x1) {
          console.error('0x4: UNEXPECTED LENGTH-INT TYPE! ' + intType);
        }
        const intInfo = int_type & 0x0f;
        const intLength = Math.pow(2, intInfo);
        dataoffset = 2 + intLength;
        length = Number(
          readUInt(buffer.slice(offset + 2, offset + 2 + intLength))
        );
      }
      if (length < maxObjectSize) {
        return buffer.slice(
          offset + dataoffset,
          offset + dataoffset + Number(length)
        );
      }
      throw new Error(
        'Too little heap space available! Wanted to read ' +
          length +
          ' bytes, but only ' +
          maxObjectSize +
          ' are available.'
      );
    }

    function parsePlistString(isUtf16 = false) {
      let length: number = objInfo;
      let stroffset = 1;
      if (objInfo == 0xf) {
        const int_type = readUInt8(buffer, offset + 1);
        const intType = (int_type & 0xf0) / 0x10;
        if (intType != 0x1) {
          console.error('UNEXPECTED LENGTH-INT TYPE! ' + intType);
        }
        const intInfo = int_type & 0x0f;
        const intLength = Math.pow(2, intInfo);
        stroffset = 2 + intLength;
        length = Number(
          readUInt(buffer.slice(offset + 2, offset + 2 + intLength))
        );
      }
      // length is String length -> to get byte length multiply by 2, as 1 character takes 2 bytes in UTF-16
      length *= isUtf16 ? 2 : 1;
      if (length < maxObjectSize) {
        let plistString = buffer.slice(
          offset + stroffset,
          offset + stroffset + length
        );
        if (isUtf16) {
          plistString = swapBytes(plistString);
          return DECODER_UTF16.decode(plistString);
        } else {
          return DECODER_UTF8.decode(plistString);
        }
      }
      throw new Error(
        'Too little heap space available! Wanted to read ' +
          length +
          ' bytes, but only ' +
          maxObjectSize +
          ' are available.'
      );
    }

    function parseArray() {
      let length = objInfo;
      let arrayoffset = 1;
      if (objInfo == 0xf) {
        const int_type = readUInt8(buffer, offset + 1);
        const intType = (int_type & 0xf0) / 0x10;
        if (intType != 0x1) {
          console.error('0xa: UNEXPECTED LENGTH-INT TYPE! ' + intType);
        }
        const intInfo = int_type & 0x0f;
        const intLength = Math.pow(2, intInfo);
        arrayoffset = 2 + intLength;
        length = Number(
          readUInt(buffer.slice(offset + 2, offset + 2 + intLength))
        );
      }
      if (length * objectRefSize > maxObjectSize) {
        throw new Error('Too little heap space available!');
      }
      const array = [];
      for (let i = 0; i < length; i++) {
        const objRef = Number(
          readUInt(
            buffer.slice(
              offset + arrayoffset + i * objectRefSize,
              offset + arrayoffset + (i + 1) * objectRefSize
            )
          )
        );
        array[i] = parseObject(objRef);
      }
      return array;
    }

    function parseDictionary() {
      let length = objInfo;
      let dictoffset = 1;
      if (objInfo == 0xf) {
        const int_type = readUInt8(buffer, offset + 1);
        const intType = (int_type & 0xf0) / 0x10;
        if (intType != 0x1) {
          console.error('0xD: UNEXPECTED LENGTH-INT TYPE! ' + intType);
        }
        const intInfo = int_type & 0x0f;
        const intLength = Math.pow(2, intInfo);
        dictoffset = 2 + intLength;
        length = Number(
          readUInt(buffer.slice(offset + 2, offset + 2 + intLength))
        );
      }
      if (length * 2 * objectRefSize > maxObjectSize) {
        throw new Error('Too little heap space available!');
      }
      const dict: Dictionary = {};
      for (let i = 0; i < length; i++) {
        const keyRef = Number(
          readUInt(
            buffer.slice(
              offset + dictoffset + i * objectRefSize,
              offset + dictoffset + (i + 1) * objectRefSize
            )
          )
        );
        const valRef = Number(
          readUInt(
            buffer.slice(
              offset + dictoffset + length * objectRefSize + i * objectRefSize,
              offset +
                dictoffset +
                length * objectRefSize +
                (i + 1) * objectRefSize
            )
          )
        );
        const key = parseObject(keyRef);
        if (typeof key !== 'string') {
          throw new Error('Invalid key type.');
        }

        if (key === '__proto__') {
          throw new Error('Attempted prototype pollution');
        }
        const val = parseObject(valRef);
        dict[key] = val;
      }
      return dict;
    }
  }

  return parseObject(topObject);
};
