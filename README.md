# babel-plugin-shake-class-properties

A babel plugin which is to remove ES6 Class's nouse properties/members.

In some situation, we use a third party class, however, when we bundle our code, we find some properties/methods are not needed in our project.
This babel plugin help you to remove the nouse properties.

```js
export default class A {
  a = 1
  static b = 2
  c() {}
  static d() {}
  e() {
    return false
  }
}
```

```js
import A from './a'

const a = new A()
a.e()

// we only use 'e()',
// wo do not need 'a', static 'b', 'c()' and static 'd()',
// so we want to remove a, b, c, d in our final code.
```

## Install

```
npm i -D babel-plugin-shake-class-properties
```

## Usage

```js
// babel.config.js
const path = require('path')

module.exports = {
  ...
  plugins: [
    ['babel-plugin-shake-class-properties', {
      // the only properties we want to keep, other properties will be removed (except constructor)
      retain: [
        {
          file: path.resolve(__dirname, 'node_modules/tyshemo/src/store.js'), // the file's absolute path to match
          class: 'Store', // the class name from which properties will be removed
          properties: ['update', 'set'], // the properties which will be kept
        },
      ],
      // the properties we want to remove, properties even in `retain` will be removed
      remove: [
        {
          file: path.resolve(__dirname, 'node_modules/tyshemo/src/store.js'),
          class: 'Store',
          properties: ['update', 'set'], // the properties which will be removed
        },
      ],
    }],
    ...
  ],
}
```

In a item string of `properties`, you can use `static` `async` `get` `set` `*` keywords to match certain properties, for example:

```js
class A {
  static a = 1 // 'static a'
  get name() {} // 'get name'
  set name() {} // 'set name'
  * f() {} // '* f'
  async fetch() {} // 'async fetch'
  async * r() {} // 'async * r'
  static async * p() {} // 'static async * p'
  static get e() {} // 'static get e'
}
```

If you do not pass the right pattern to match, the properties may not be removed/retained.

## Notice

Only ES6+ source class properties will be matched. The following situation will not work with this plugin. Computed properties will not work as possible:

```js
class A {
  // will never be remove
  constructor() {
    // will not be realized
    this.a = '1'
  }

  // will not be realized
  [`some${a}`]() {}

  // will not be realized
  [Symbol('xxx')]() {}

  // will be treated as dd
  'dd'() {}

  // will be treated as ["dd"]
  ['dd']() {}

  // will be treated as [dd]
  [dd]() {}

  // will be treated as [dd]
  [dd] = 1

  // will be treated as ["dd"]
  ['dd'] = 1
}

// will not be realized
// you can use https://github.com/tangshuang/babel-plugin-transform-class-remove-static-properties to remove this
A.b = 'xxx'
```
