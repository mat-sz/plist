<h1 align="center">@plist/serialize</h1>

<p align="center">
An universal TypeScript library for serializing Apple's Property Lists. Supports binary, text and XML plists; works well in both browser and node.
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/workflow/status/mat-sz/plist/Node.js%20CI%20(yarn)">
<a href="https://npmjs.com/package/@plist/serialize">
<img alt="npm" src="https://img.shields.io/npm/v/@plist/serialize">
<img alt="npm" src="https://img.shields.io/npm/dw/@plist/serialize">
<img alt="NPM" src="https://img.shields.io/npm/l/@plist/serialize">
</a>
</p>

## About

This library adapts logic and test cases from [plist.js](https://github.com/TooTallNate/plist.js).

## Installation

@plist/serialize is available on [npm](https://www.npmjs.com/package/@plist/serialize), you can install it with either npm or yarn:

```sh
npm install @plist/serialize
# or:
yarn install @plist/serialize
```

## Usage

```ts
import { serialize } from '@plist/serialize';
import { PlistFormat } from '@plist/common';

const xml = serialize(
  {
    dictionary: {
      hello: 'world',
    },
  },
  PlistFormat.XML
);
/* =>
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>hello</key>
  <string>world</string>
</dict>
</plist>
*/
```
