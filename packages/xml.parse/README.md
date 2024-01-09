<h1 align="center">@plist/xml.parse</h1>

<p align="center">
TypeScript library for parsing XML Property Lists, in browser and node.js.
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/actions/workflow/status/mat-sz/plist/node.js.yml?branch=main">
<a href="https://npmjs.com/package/@plist/xml.parse">
<img alt="npm" src="https://img.shields.io/npm/v/@plist/xml.parse">
<img alt="npm" src="https://img.shields.io/npm/dw/@plist/xml.parse">
<img alt="NPM" src="https://img.shields.io/npm/l/@plist/xml.parse">
</a>
</p>

## About

This library adapts logic and test cases from [plist.js](https://github.com/TooTallNate/plist.js).

## Installation

@plist/xml.parse is available on [npm](https://www.npmjs.com/package/@plist/xml.parse), you can install it with either npm or yarn:

```sh
npm install @plist/xml.parse
# or:
yarn install @plist/xml.parse
```

## Usage

```ts
import { parse } from '@plist/xml.parse';

const dict = parse(`<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>hello</key>
  <true/>
</dict>
</plist>`);
// => { hello: true }
```
