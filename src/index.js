const placeholder = `__jsxPlaceholder${Date.now()}`

const types = {
  element: 'element',
  value: 'value',
  props: 'props',
}

const parseElement = (str, values) => {
  let match
  let length

  const node = {
    type: types.element,
    props: parseProps('', []),
    children: [],
    length: 0,
    name: '',
  }

  match = str.match(/<(\w+)/)

  if (!match) {
    str = str.split('<')[0]

    return parseValue(str, values)
  }

  node.name = match[1]
  node.tag = node.name === placeholder ? values.shift() : node.name
  length = match.index + match[0].length
  str = str.slice(length)
  node.length += length

  match = str.match(/>/)

  if (!match) return node

  node.props = parseProps(str.slice(0, match.index), values)
  length = node.props.length
  str = str.slice(length)
  node.length += length

  match = str.match(/^ *\/ *>/)

  if (match) {
    node.length += match.index + match[0].length

    return node
  }

  match = str.match(/>/)

  if (!match) return node

  length = match.index + 1
  str = str.slice(length)
  node.length += length

  let child = parseElement(str, values)

  while (child.type === types.element || child.value) {
    length = child.length
    str = str.slice(length)
    node.length += length
    node.children.push(child)
    child = parseElement(str, values)
  }

  match = str.match(new RegExp(`</${node.name}>`))

  if (!match) return node

  node.length += match.index + match[0].length

  if (node.name === placeholder) {
    const value = values.shift()

    if (value !== node.tag) return node
  }

  return node
}

const parseProps = (str, values) => {
  let match
  let length

  const node = {
    type: types.props,
    length: 0,
    props: {},
  }

  const matchNextProp = () => {
    match =
      str.match(/ *\w+="(?:.*[^\\]")?/) ||
      str.match(new RegExp(` *\\w+=${placeholder}`)) ||
      str.match(/ *\w+/)
  }

  matchNextProp()

  while (match) {
    const propStr = match[0]
    let [key, ...value] = propStr.split('=')
    node.length += propStr.length
    key = key.trim()
    value = value.join('=')
    value =
      value === placeholder ? values.shift() :
      value ? value.slice(1, -1) : true
    node.props[key] = value
    str = str.slice(0, match.index) + str.slice(match.index + propStr.length)

    matchNextProp()
  }

  return node
}

const parseValue = (str, values) => {
  return {
    type: types.value,
    length: str.length,
    value: str.trim(),
  }
}
