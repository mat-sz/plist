<h1 align="center">@plist/openstep.serialize</h1>

<p align="center">
TypeScript library for serializing OpenStep/NEXTStep Property Lists, in browser and node.js.
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/workflow/status/mat-sz/plist/Node.js%20CI%20(yarn)">
<a href="https://npmjs.com/package/@plist/openstep.serialize">
<img alt="npm" src="https://img.shields.io/npm/v/@plist/openstep.serialize">
<img alt="npm" src="https://img.shields.io/npm/dw/@plist/openstep.serialize">
<img alt="NPM" src="https://img.shields.io/npm/l/@plist/openstep.serialize">
</a>
</p>

## About

This library adapts test cases from [nextstep-plist](https://github.com/chee/nextstep-plist).

## Installation

@plist/openstep.serialize is available on [npm](https://www.npmjs.com/package/@plist/openstep.serialize), you can install it with either npm or yarn:

```sh
npm install @plist/openstep.serialize
# or:
yarn install @plist/openstep.serialize
```

## Usage

```ts
import { serialize } from '@plist/openstep.serialize';

const openstep = serialize({
  dictionary: {
    hello: 'world',
  },
});
// => { hello = world; }
```
