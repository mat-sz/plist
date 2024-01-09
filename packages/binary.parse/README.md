<h1 align="center">@plist/binary.parse</h1>

<p align="center">
TypeScript library for parsing binary Property Lists, in browser and node.js.
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/actions/workflow/status/mat-sz/plist/node.js.yml?branch=main">
<a href="https://npmjs.com/package/@plist/binary.parse">
<img alt="npm" src="https://img.shields.io/npm/v/@plist/binary.parse">
<img alt="npm" src="https://img.shields.io/npm/dw/@plist/binary.parse">
<img alt="NPM" src="https://img.shields.io/npm/l/@plist/binary.parse">
</a>
</p>

## About

This library adapts code, logic and test cases from [node-bplist-parser](https://github.com/joeferner/node-bplist-parser).

## Installation

@plist/binary.parse is available on [npm](https://www.npmjs.com/package/@plist/binary.parse), you can install it with either npm or yarn:

```sh
npm install @plist/binary.parse
# or:
yarn install @plist/binary.parse
```

## Usage

```ts
import { parse } from '@plist/binary.parse';

const { buffer } = new Uint8Array(
  readFileSync(path.join(TEST_FILE_PATH, 'data_types', 'dict.plist'))
);
const dict = parse(buffer);
// => { hello: "world", whats: "up" }
```
