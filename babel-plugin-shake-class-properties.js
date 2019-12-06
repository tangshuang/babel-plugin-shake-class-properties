module.exports = function(babel, options) {
  const { types } = babel
  const { remove = [], retain = [] } = options || {}
  const make = (property) => {
    const { static, kind, type, generator, async, computed } = property
    const key = types.isIdentifier(property.key) ? property.key.name
      : types.isStringLiteral(property.key) ? computed ? property.key.extra.raw : property.key.value
      : ''
    return { static, kind, type, generator, async, computed, key }
  }
  const isMatch = (node, target) => {
    const descs = target.split(' ')
    const name = descs.pop()

    // only certain keys can be mathced
    if (!node.key) {
      return false
    }

    // properties: ['[some]', `['dd']`]
    // notice, you can not remove [`s${o}me`] or even [Symbol('xxx')], only [some] and ['dd'] can be removed
    if (node.computed && `[${node.key.replace(/'/g, '"')}]` !== name.replace(/'/g, '"')) {
      return false
    }

    // notice, 'aa'() will match aa, you should pass ['aa']
    if (!node.computed && node.key !== name) {
      return false
    }

    if (node.generator && !descs.includes('*')) {
      return false
    }

    if (node.async && !descs.includes('async')) {
      return false
    }

    if (node.static && !descs.includes('static')) {
      return false
    }

    if (node.kind === 'get' && !descs.includes('get')) {
      return false
    }

    if (node.kind === 'set' && !descs.includes('set')) {
      return false
    }

    return true
  }

  return {
    visitor: {
      ClassDeclaration(path, state) {
        const file = state.file.opts.filename
        const { node } = path
        const className = node.id.name
        const properties = node.body.body

        // retain
        if (retain.length) {
          const item = retain.find(item => item.file === file && item.class === className)

          if (item && item.properties) {
            for (let i = properties.length - 1; i >= 0; i --) {
              const property = properties[i]
              const node = make(property)
              const { key } = node

              if (!key) {
                continue
              }

              if (key === 'constructor') {
                continue
              }

              let isMatched = false

              for (let one of item.properties) {
                if (isMatch(node, one)) {
                  isMatched = true
                  break
                }
              }

              if (isMatched) {
                continue
              }

              properties.splice(i, 1)
            }
          }
        }

        // remove
        if (remove.length) {
          const item = remove.find(item => item.file === file && item.class === className)

          if (item &&item.properties) {
            for (let i = properties.length - 1; i >= 0; i --) {
              const property = properties[i]
              const node = make(property)
              const { key } = node

              if (!key) {
                continue
              }

              if (key === 'constructor') {
                continue
              }

              for (let one of item.properties) {
                if (isMatch(node, one)) {
                  properties.splice(i, 1)
                  break
                }
              }
            }
          }
        }
      },
    },
  }
}
