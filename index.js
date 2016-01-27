'use strict'

// Main regex for parsing input lines. The numbered group matches are labeled in
// the line above the regex:
const lineRegex = (
//     (1)  (2)        (3)      ----(4)----     (5)           -(6)-    (7)
    /^(\s+)(\w+|%)(?::(\w+))?(?:\.([\w\.-]+))* ?(%)? ?(?:(?:"([^"]*)")|(%))?/
)
const commentRegex = /^\s+\//
const PARAM_PLACEHOLDER = '%'        // Placeholder string for interpolated values


/**
* Convert a single line of the template into a single quasi-VDOM node.
*
* @arg {string} line - A single line of the template
* @arg {function} takeParam - Returns the next interpolated template parameter
* @return {object} - A node, parsed from the single-line input string
*/
const lineToNode = (line, takeParam) => {
    const match = lineRegex.exec(line)
    if (!match || commentRegex.test(line)) return null

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
                nodes[j].props.children.push(n)
                break
            }
        }
    }
    return tree
}

const renderTree = (node, renderer) => {
    if (typeof node === 'string') return node
    const children = (node && node.props && node.props.children.length)
                     ? node.props.children.map(n => renderTree(n, renderer))
                     : null
    const props = Object.assign(node.props, { children })
    return renderer(node.type, props)
}

const create = (createEl) => {
    return function parseTemplate(templateChunks) {
        const params = [].slice.call(arguments, 1)

        return function renderTemplate(/* config */) {
            const lines = templateChunks.join(PARAM_PLACEHOLDER).split('\n')
            const parsedLines = lines.map(l => lineToNode(l, () => params.shift()))
                                     .filter(l => !!l)
            const tree = nodesToTree(parsedLines)
            return renderTree(tree, createEl)
        }
    }
}

exports.create = create
