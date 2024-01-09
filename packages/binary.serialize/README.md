<h1 align="center">@plist/binary.serialize</h1>

<p align="center">
TypeScript library for serializing binary Property Lists, in browser and node.js.
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/actions/workflow/status/mat-sz/plist/node.js.yml?branch=main">
<a href="https://npmjs.com/package/@plist/binary.serialize">
<img alt="npm" src="https://img.shields.io/npm/v/@plist/binary.serialize">
<img alt="npm" src="https://img.shields.io/npm/dw/@plist/binary.serialize">
<img alt="NPM" src="https://img.shields.io/npm/l/@plist/binary.serialize">
</a>
</p>

## About

This library adapts code, logic and test cases from [node-bplist-creator](https://github.com/joeferner/node-bplist-creator).

## Installation

@plist/binary.serialize is available on [npm](https://www.npmjs.com/package/@plist/binary.serialize), you can install it with either npm or yarn:

```sh
npm install @plist/binary.serialize
# or:
yarn install @plist/binary.serialize
```

## Usage

```ts
import { serialize } from '@plist/binary.serialize';

const binary = serialize({
  dictionary: {
    hello: 'world',
  },
});
// => ArrayBuffer
```
