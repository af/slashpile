'use strict'

// Main regex for parsing input lines. The numbered group matches are labeled in
// the line above the regex:
const lineRegex = (
//     (1)  (2)        (3)      ----(4)----     (5)           -(6)-    (7)
    /^(\s*)(\w+|%)(?::(\w+))?(?:\.([\w\.-]+))* ?(%)? ?(?:(?:"([^"]*)")|(%))?/
)
const commentRegex = /^\s+\//
const arrayChildRegex = /^\s+> %$/
const PARAM_PLACEHOLDER = '%'        // Placeholder string for interpolated values


/**
* Convert a single line of the template into a single quasi-VDOM node.
*
* @arg {string} line - A single line of the template
* @arg {function} takeParam - Returns the next interpolated template parameter
* @return {object} - A node, parsed from the single-line input string
*/
const lineToNode = (line, takeParam) => {
    if (commentRegex.test(line)) return null

    // Lines of the form '> %' accept a single Array parameter
    if (arrayChildRegex.test(line)) {
        const param = takeParam()
        if (!param || !param.length) return null
        return { indent: line.length - 1, array: param }
    }

    const match = lineRegex.exec(line)
    if (!match) return null

    const indent = match[1].length
    const parsedProps = {
        className: (match[4] || '').replace(/\./g, ' ') || null,
        type: match[3] || null,     // node.props.type, *not* node.type!
        children: []
    }

    let tagType = match[2]
    if (tagType === PARAM_PLACEHOLDER) tagType = takeParam()

    // If PARAM_PLACEHOLDER was matched, template var(s) were passed in for props and/or
    // a string child:
    let varProps = match[5] ? takeParam() : {}
    let stringVarChild = match[7]
    if (typeof varProps === 'string') {
        stringVarChild = varProps
        varProps = {}
    } else if (stringVarChild) {
        stringVarChild = takeParam()
    }

    const stringLiteralChild = match[6]
    if (stringLiteralChild) parsedProps.children = [stringLiteralChild]
    else if (stringVarChild) parsedProps.children = [stringVarChild]

    const mergedProps = (parsedProps.className && varProps.className)
                        ? { className: parsedProps.className + ' ' + varProps.className }
                        : {}
    return {
        indent,
        type: tagType,
        props: Object.assign({}, parsedProps, varProps, mergedProps)
    }
}

/**
* Convert a flat array of nodes into a nested tree.
*
* @arg {array} nodes - An array of parsed nodes, each with an "indent" property
* @return {object} - A tree of parsed nodes
*/
const nodesToTree = (nodes) => {
    if (!nodes || !nodes.length) throw new Error('Invalid input to nodesToTree')

    let tree = nodes[0]
    for (var i = 1, l = nodes.length; i < l; i++) {
        let n = nodes[i]

        // Go backwards through the tree and find the node's parent: it's the
        // closest node with a smaller indent than this one.
        for (var j = i - 1; j >= 0; j--) {
            if (n.indent > nodes[j].indent) {
                const parent = nodes[j]
                if (n.array) parent.props.children = parent.props.children.concat(n.array)
                else parent.props.children.push(n)
                break
            }
        }
    }
    return tree
}

/**
* Transform a node using transforms (if some were given)
*
* @arg {object} [transforms] - A set of options that can transform nodes
*   @arg {object} [tagMap] - mapping of tagName to {new tagName,custom components}
*   @arg {object} [classMap] - key/value mapping of input to output classNames
*   @arg {object} [propExtend] - functions that convert a specified prop into other props
* @return {object} - The node, possibly transformed by the provided transforms
*/
const transformNode = (transforms) => (node) => {
    if (!transforms) return node

    if (transforms.tagMap) {
        node.type = transforms.tagMap[node.type] || node.type
    }

    if (transforms.classMap && node.props.className) {
        node.props.className = node.props.className.split(' ')
                                       .map(c => transforms.classMap[c] || c)
                                       .join(' ')
    }

    if (transforms.propExtend) {
        for (const k in transforms.propExtend) {
            const f = transforms.propExtend[k]
            if (typeof f !== 'function') break
            node.props = Object.assign({}, node.props, f(node.props[k]))
        }
    }

    return node
}

const renderTree = (node, renderer) => {
    if (typeof node === 'string') return node
    const children = (node && node.props && node.props.children.length)
                     ? node.props.children.map(n => renderTree(n, renderer))
                     : null
    const props = Object.assign({}, node.props, { children })
    return renderer(node.type, props)
}

const create = (createEl, transforms) => {
    return function parseTemplate(templateChunks) {
        const params = [].slice.call(arguments, 1)

        return function renderTemplate() {
            const lines = templateChunks.join(PARAM_PLACEHOLDER).split('\n')
            const nodeArray = lines.map(l => lineToNode(l, () => params.shift()))
                                   .filter(l => !!l)
                                   .map(transformNode(transforms))
            const tree = nodesToTree(nodeArray)
            return renderTree(tree, createEl)
        }
    }
}

exports.create = create
