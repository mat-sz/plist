<h1 align="center">@plist/plist</h1>

<p align="center">
An universal TypeScript library for handing Apple's Property Lists. Supports binary, text and XML plists; works well in both browser and node.
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/actions/workflow/status/mat-sz/plist/node.js.yml?branch=main">
<a href="https://npmjs.com/package/@plist/plist">
<img alt="npm" src="https://img.shields.io/npm/v/@plist/plist">
<img alt="npm" src="https://img.shields.io/npm/dw/@plist/plist">
<img alt="NPM" src="https://img.shields.io/npm/l/@plist/plist">
</a>
</p>

## About

@plist/\* adapts code, logic and test cases from:

- [node-bplist-parser](https://github.com/joeferner/node-bplist-parser)
- [node-bplist-creator](https://github.com/joeferner/node-bplist-creator)
- [plist.js](https://github.com/TooTallNate/plist.js)
- [nextstep-plist](https://github.com/chee/nextstep-plist)
- [simple-plist](https://github.com/wollardj/simple-plist)

I've decided to proceed with creating new libraries, instead of using those packages as dependencies, since it was necessary to modify the upstream code to remove reliance on node-only packages (mainly `fs`) and this would be too much of a change for anyone relying on the aforementioned libraries.

This library differs from other plist-related JavaScript libraries:

- works on binary, text (OpenStep/NEXTStep), and XML plists
- works in both node.js and browser environments (ArrayBuffer instead of Buffer, no usage of `fs` or other node-only libraries)

## Installation

@plist/plist is available on [npm](https://www.npmjs.com/package/@plist/plist), you can install it with either npm or yarn:

```sh
npm install @plist/plist
# or:
yarn install @plist/plist
```

## Usage

```ts
import { parse, serialize } from '@plist/plist';

parse(serialize({ hello: 'world' })); // => { hello: 'world' }
```

## Compatibility

This library relies on (relatively) new JavaScript features such as BigInt.

Therefore, without polyfills, those are the minimum browser and node/deno versions @plist/plist will work in:

| Environment       | Version                        |
| ----------------- | ------------------------------ |
| Chrome/Chromium   | 67+                            |
| Edge              | 79+                            |
| Firefox           | 100+                           |
| Internet Explorer | Not supported                  |
| Opera             | 54+                            |
| Safari            | 14.1+ (iOS 14.1+, macOS 11.1+) |
| Deno              | 1.0+                           |
| node.js           | 16.5.0+                        |
