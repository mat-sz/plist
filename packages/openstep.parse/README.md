<h1 align="center">@plist/openstep.parse</h1>

<p align="center">
TypeScript library for parsing OpenStep/NEXTStep Property Lists, in browser and node.js.
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/actions/workflow/status/mat-sz/plist/node.js.yml?branch=main">
<a href="https://npmjs.com/package/@plist/openstep.parse">
<img alt="npm" src="https://img.shields.io/npm/v/@plist/openstep.parse">
<img alt="npm" src="https://img.shields.io/npm/dw/@plist/openstep.parse">
<img alt="NPM" src="https://img.shields.io/npm/l/@plist/openstep.parse">
</a>
</p>

## About

This library adapts test cases from [nextstep-plist](https://github.com/chee/nextstep-plist).

## Installation

@plist/openstep.parse is available on [npm](https://www.npmjs.com/package/@plist/openstep.parse), you can install it with either npm or yarn:

```sh
npm install @plist/openstep.parse
# or:
yarn install @plist/openstep.parse
```

## Usage

```ts
import { parse } from '@plist/openstep.parse';

const dict = parse(`{ hello = world; }`);
// => { hello: "world" }
```
