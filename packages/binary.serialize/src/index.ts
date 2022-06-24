import {
  Dictionary,
  Value,
  EPOCH,
  HEADER_BINARY,
  TextEncoder,
} from '@plist/common';

interface EntryBase {
  id?: number;
  type: 'primitive' | 'stringref';
  value: Value;
}

interface EntryArray {
  id?: number;
  type: 'array';
  entries: Entry[];
  value: undefined;
}

interface EntryDict {
  id?: number;
  type: 'dict';
  entryKeys: Entry[];
  entryValues: Entry[];
  value: undefined;
}

type Entry = EntryBase | EntryArray | EntryDict;

const encoder = new TextEncoder();
const nullBytes = new Uint8Array([0, 0, 0, 0, 0, 0]);

const fromHexString = (hexString: string) =>
  Uint8Array.from(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

const isUID = (value: Value): value is { CF$UID: number } =>
  !!value &&
  typeof value === 'object' &&
  Object.keys(value).length == 1 &&
  typeof (value as Dictionary).CF$UID === 'number';

const toUTF16 = (string: string) => {
  const buf = new ArrayBuffer(string.length * 2);
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = string.length; i < strLen; i++) {
    bufView[i] = string.charCodeAt(i);
  }
  return new Uint8Array(buf);
};

const concat = (first: Uint8Array, second: Uint8Array): Uint8Array => {
  const third = new Uint8Array(first.length + second.length);
  third.set(first);
  third.set(second, first.length);
  return third;
};

const writeUInt = (
  buffer: Uint8Array,
  int: number | bigint,
  size: number
): Uint8Array => {
  const output = new Uint8Array(buffer.length + size);
  const dataView = new DataView(output.buffer);
  output.set(buffer);

  switch (size) {
    case 1:
      dataView.setUint8(buffer.length, Number(int));
      break;
    case 2:
      dataView.setUint16(buffer.length, Number(int), false);
      break;
    case 4:
      dataView.setUint32(buffer.length, Number(int), false);
      break;
    case 8:
      dataView.setBigUint64(buffer.length, BigInt(int), false);
      break;
    default:
      throw new Error('Unsupported int size');
  }

  return output;
};

const writeInt = (
  buffer: Uint8Array,
  int: number | bigint,
  size: number
): Uint8Array => {
  const output = new Uint8Array(buffer.length + size);
  const dataView = new DataView(output.buffer);
  output.set(buffer);

  switch (size) {
    case 1:
      dataView.setInt8(buffer.length, Number(int));
      break;
    case 2:
      dataView.setInt16(buffer.length, Number(int), false);
      break;
    case 4:
      dataView.setInt32(buffer.length, Number(int), false);
      break;
    case 8:
      dataView.setBigInt64(buffer.length, BigInt(int), false);
      break;
    default:
      throw new Error('Unsupported int size');
  }

  return output;
};

const writeDouble = (buffer: Uint8Array, double: number): Uint8Array => {
  const output = new Uint8Array(buffer.length + 8);
  const dataView = new DataView(output.buffer);
  output.set(buffer);
  dataView.setFloat64(buffer.length, double);
  return output;
};

export const serialize = (value: Value) => {
  let buffer = encoder.encode(HEADER_BINARY);

  if (value instanceof Array && value.length === 1) {
    value = value[0];
  }

  let entries = toEntries(value);
  const idSizeInBytes = computeIdSizeInBytes(entries.length);
  const offsets: number[] = [];
  let offsetSizeInBytes: number;
  let offsetTableOffset: number;

  updateEntryIds();

  entries.forEach((entry, entryIdx) => {
    offsets[entryIdx] = buffer.byteLength;
    if (typeof entry === 'undefined' || entry === null) {
      buffer = writeUInt(buffer, 0x00, 1);
    } else {
      write(entry);
    }
  });

  writeOffsetTable();
  writeTrailer();
  return buffer.buffer;

  function updateEntryIds() {
    const strings: Record<string, number> = {};
    let entryId = 0;
    entries.forEach(entry => {
      if (entry.id) {
        return;
      }
      if (typeof entry.value === 'string') {
        if (strings.hasOwnProperty(entry.value)) {
          entry.type = 'stringref';
          entry.id = strings[entry.value];
        } else {
          strings[entry.value] = entry.id = entryId++;
        }
      } else {
        entry.id = entryId++;
      }
    });

    entries = entries.filter(entry => {
      return entry.type !== 'stringref';
    });
  }

  function writeTrailer() {
    buffer = concat(buffer, nullBytes);
    buffer = concat(buffer, new Uint8Array([offsetSizeInBytes, idSizeInBytes]));
    buffer = writeUInt(buffer, BigInt(entries.length), 8);
    buffer = writeUInt(buffer, BigInt('0'), 8);
    buffer = writeUInt(buffer, BigInt(offsetTableOffset), 8);
  }

  function writeOffsetTable() {
    offsetTableOffset = buffer.byteLength;
    offsetSizeInBytes = computeOffsetSizeInBytes(offsetTableOffset);
    offsets.forEach(offset => {
      buffer = writeUInt(buffer, offset, offsetSizeInBytes);
    });
  }

  function write(entry: Entry) {
    if (entry.type === 'primitive') {
      const value = entry.value;

      switch (typeof value) {
        case 'number':
        case 'bigint':
          writeNumber(value);
          break;
        case 'string':
          writeString(value);
          break;
        case 'boolean':
          writeBoolean(value);
          break;
      }

      if (value instanceof Date) {
        writeDate(value);
      } else if (value instanceof ArrayBuffer) {
        writeData(value);
      } else if (isUID(value)) {
        writeUID(value.CF$UID);
      }

      return;
    }

    switch (entry.type) {
      case 'dict':
        writeDict(entry);
        break;
      case 'array':
        writeArray(entry);
        break;
      default:
        throw new Error('unhandled entry type: ' + entry.type);
    }
  }

  function writeDate(value: Date) {
    buffer = writeUInt(buffer, 0x33, 1);
    const date = (value.getTime() - EPOCH) / 1000;
    buffer = writeDouble(buffer, date);
  }

  function writeDict(entry: EntryDict) {
    writeIntHeader(0xd, entry.entryKeys.length);
    entry.entryKeys.forEach((entry: Entry) => {
      writeID(entry.id!);
    });
    entry.entryValues.forEach((entry: Entry) => {
      writeID(entry.id!);
    });
  }

  function writeNumber(value: number | bigint) {
    if (typeof value === 'bigint') {
      const width = 16;
      const hex = value.toString(16);
      const buf = fromHexString(
        hex.padStart(width * 2, '0').slice(0, width * 2)
      );
      buffer = writeUInt(buffer, 0x14, 1);
      buffer = concat(buffer, buf);
    } else {
      if (Number.isInteger(value)) {
        if (value < 0) {
          buffer = writeUInt(buffer, 0x13, 1);
          buffer = writeInt(buffer, value, 8);
        } else if (value <= 0xff) {
          buffer = writeUInt(buffer, 0x10, 1);
          buffer = writeUInt(buffer, value, 1);
        } else if (value <= 0xffff) {
          buffer = writeUInt(buffer, 0x11, 1);
          buffer = writeUInt(buffer, value, 2);
        } else if (value <= 0xffffffff) {
          buffer = writeUInt(buffer, 0x12, 1);
          buffer = writeUInt(buffer, value, 4);
        } else {
          buffer = writeUInt(buffer, 0x13, 1);
          buffer = writeUInt(buffer, value, 8);
        }
      } else {
        buffer = writeUInt(buffer, 0x23, 1);
        buffer = writeDouble(buffer, value);
      }
    }
  }

  function writeUID(uid: number) {
    writeIntHeader(0x8, 0x0);
    writeID(uid);
  }

  function writeArray(entry: EntryArray) {
    writeIntHeader(0xa, entry.entries.length);
    entry.entries.forEach(e => {
      writeID(e.id!);
    });
  }

  function writeBoolean(value: boolean) {
    buffer = writeUInt(buffer, value ? 0x09 : 0x08, 1);
  }

  function writeString(value: string) {
    if (mustBeUtf16(value)) {
      const utf16 = toUTF16(value);
      writeIntHeader(0x6, utf16.length / 2);
      // needs to be big endian so swap the bytes
      for (let i = 0; i < utf16.length; i += 2) {
        const t = utf16[i + 0];
        utf16[i + 0] = utf16[i + 1];
        utf16[i + 1] = t;
      }
      buffer = concat(buffer, utf16);
    } else {
      const utf8 = encoder.encode(value);
      writeIntHeader(0x5, utf8.length);
      buffer = concat(buffer, utf8);
    }
  }

  function writeData(data: ArrayBuffer) {
    writeIntHeader(0x4, data.byteLength);
    buffer = concat(buffer, new Uint8Array(data));
  }

  function writeIntHeader(kind: number, value: number) {
    if (value < 15) {
      buffer = writeUInt(buffer, (kind << 4) + value, 1);
    } else {
      buffer = writeUInt(buffer, (kind << 4) + 15, 1);
      writeNumber(value);
    }
  }

  function writeID(id: number) {
    buffer = writeUInt(buffer, id, idSizeInBytes);
  }

  function mustBeUtf16(string: string) {
    return encoder.encode(string).byteLength != string.length;
  }
};

const typeofPrimitive = ['string', 'number', 'boolean', 'bigint'];
function toEntries(value: Value): Entry[] {
  if (
    typeofPrimitive.includes(typeof value) ||
    value instanceof ArrayBuffer ||
    value instanceof Date ||
    isUID(value)
  ) {
    return [
      {
        type: 'primitive',
        value,
      },
    ];
  }

  if (value != null && typeof value === 'object') {
    return Array.isArray(value)
      ? toEntriesArray(value)
      : toEntriesObject(value);
  }

  throw new Error('unhandled entry: ' + value);
}

function toEntriesArray(array: Value[]): Entry[] {
  const entries = array.map(toEntries);

  return [
    {
      type: 'array',
      value: undefined,
      entries: entries.map(entries => entries[0]),
    },
    ...entries.flat(),
  ];
}

function toEntriesObject(dict: Dictionary): Entry[] {
  const entryKeys = Object.keys(dict).map(toEntries).flat(1);
  const entryValues = Object.values(dict).map(toEntries);

  return [
    {
      type: 'dict',
      value: undefined,
      entryKeys,
      entryValues: entryValues.map(entries => entries[0]),
    },
    ...entryKeys,
    ...entryValues.flat(),
  ];
}

function computeOffsetSizeInBytes(maxOffset: number) {
  if (maxOffset < 256) {
    return 1;
  }
  if (maxOffset < 65536) {
    return 2;
  }
  if (maxOffset < 4294967296) {
    return 4;
  }
  return 8;
}

function computeIdSizeInBytes(numberOfIds: number) {
  if (numberOfIds < 256) {
    return 1;
  }
  if (numberOfIds < 65536) {
    return 2;
  }
  return 4;
}
