<h1 align="center">@plist/parse</h1>

<p align="center">
An universal TypeScript library for parsing Apple's Property Lists. Supports binary, text and XML plists; works well in both browser and node.
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/actions/workflow/status/mat-sz/plist/node.js.yml?branch=main">
<a href="https://npmjs.com/package/@plist/parse">
<img alt="npm" src="https://img.shields.io/npm/v/@plist/parse">
<img alt="npm" src="https://img.shields.io/npm/dw/@plist/parse">
<img alt="NPM" src="https://img.shields.io/npm/l/@plist/parse">
</a>
</p>

## About

This library adapts logic and test cases from [plist.js](https://github.com/TooTallNate/plist.js).

## Installation

@plist/parse is available on [npm](https://www.npmjs.com/package/@plist/parse), you can install it with either npm or yarn:

```sh
npm install @plist/parse
# or:
yarn install @plist/parse
```

## Usage

```ts
import { parse } from '@plist/parse';

const dict = parse(`<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>hello</key>
  <true/>
</dict>
</plist>`);
// => { hello: true }
```

```ts
import { detectFormat } from '@plist/parse';

const format = detectFormat(`{ hello = world; }`);
// => PlistFormat.OPENSTEP
```
