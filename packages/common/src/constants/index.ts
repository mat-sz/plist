// EPOCH = new SimpleDateFormat("yyyy MM dd zzz").parse("2001 01 01 GMT").getTime();
// ...but that's annoying in a static initializer because it can throw exceptions, ick.
// So we just hardcode the correct value.
export const EPOCH = 978307200000;
export const HEADER_BINARY = 'bplist00';

export enum PlistFormat {
  BINARY,
  XML,
  OPENSTEP,
}

export const TextDecoder =
  globalThis.TextDecoder || (require('util').TextDecoder as TextDecoder);
export const TextEncoder =
  globalThis.TextEncoder || (require('util').TextEncoder as TextDecoder);
