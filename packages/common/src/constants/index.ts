// EPOCH = new SimpleDateFormat("yyyy MM dd zzz").parse("2001 01 01 GMT").getTime();
// ...but that's annoying in a static initializer because it can throw exceptions, ick.
// So we just hardcode the correct value.
export const EPOCH = 978307200000;
export const HEADER_BINARY = 'bplist00';
export const HEADER_OPENSTEP_UTF8 = '// !$*UTF8*$!';

export enum PlistFormat {
  BINARY,
  XML,
  OPENSTEP,
}
