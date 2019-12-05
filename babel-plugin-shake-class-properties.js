module.exports = function(babel, options) {
  const { remove = [], retain = [] } = options || {}

  return {
    visitor: {
      ClassDeclaration(path, state) {
        const file = state.file.opts.filename
        const { node } = path
        const className = node.id.name
        const properties = node.body.body

        if (retain.length) {
          const item = retain.find(item => item.file === file && item.class === className)

          if (item && (item.property || item.properties)) {
            for (let i = properties.length - 1; i >= 0; i --) {
              const node = properties[i]
              const propName = node.key.name

              if (propName === 'constructor') {
                continue
              }

              if (node.static !== !!item.static) {
                continue
              }

              if (item.property && propName === item.property) {
                continue
              }

              if (item.properties && item.properties.indexOf(propName) > -1) {
                continue
              }

              properties.splice(i, 1)
            }
          }
        }

        if (remove.length) {
          const item = remove.find(item => item.file === file && item.class === className)

          if (item && (item.property || item.properties)) {
            for (let i = properties.length - 1; i >= 0; i --) {
              const node = properties[i]
              const propName = node.key.name

              if (propName === 'constructor') {
                continue
              }

              if (node.static !== !!item.static) {
                continue
              }

              if (item.property && propName !== item.property) {
                continue
              }

              if (item.properties && item.properties.indexOf(propName) === -1) {
                continue
              }

              properties.splice(i, 1)
            }
          }
        }
      },
    },
  }
}
