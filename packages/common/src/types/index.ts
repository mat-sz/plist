export type Value =
  | null
  | string
  | number
  | bigint
  | boolean
  | ArrayBuffer
  | Date
  | Dictionary
  | Value[];

export type Dictionary = { [key: string]: Value };
