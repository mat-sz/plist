<h1 align="center">@plist/xml.serialize</h1>

<p align="center">
TypeScript library for serializing XML Property Lists, in browser and node.js.
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/workflow/status/mat-sz/plist/Node.js%20CI%20(yarn)">
<a href="https://npmjs.com/package/@plist/xml.serialize">
<img alt="npm" src="https://img.shields.io/npm/v/@plist/xml.serialize">
<img alt="npm" src="https://img.shields.io/npm/dw/@plist/xml.serialize">
<img alt="NPM" src="https://img.shields.io/npm/l/@plist/xml.serialize">
</a>
</p>

## About

This library adapts logic and test cases from [plist.js](https://github.com/TooTallNate/plist.js).

## Installation

@plist/xml.serialize is available on [npm](https://www.npmjs.com/package/@plist/xml.serialize), you can install it with either npm or yarn:

```sh
npm install @plist/xml.serialize
# or:
yarn install @plist/xml.serialize
```

## Usage

```ts
import { serialize } from '@plist/xml.serialize';

const xml = serialize({
  dictionary: {
    hello: 'world',
  },
});
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
