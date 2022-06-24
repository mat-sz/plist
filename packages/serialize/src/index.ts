import { Value, PlistFormat } from '@plist/common';
import { serialize as serializeBinary } from '@plist/binary.serialize';
import { serialize as serializeXML } from '@plist/xml.serialize';
import { serialize as serializeOpenstep } from '@plist/openstep.serialize';

type ISerialize = {
  (input: Value, format: PlistFormat.XML): string;
  (input: Value, format: PlistFormat.OPENSTEP): string;
  (input: Value, format: PlistFormat.BINARY): ArrayBuffer;
};

export const serialize: ISerialize = (
  input: Value,
  format: PlistFormat = PlistFormat.XML
): any => {
  switch (format) {
    case PlistFormat.XML:
      return serializeXML(input);
    case PlistFormat.BINARY:
      return serializeBinary(input);
    case PlistFormat.OPENSTEP:
      return serializeOpenstep(input);
  }

  throw new Error('Unsupported format.');
};
