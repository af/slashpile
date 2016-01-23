'use strict'

const lineRegex = /^(\s+)(\w+)(?:\.([\w\.-]+))* ?(\$\$\$)? ?(?:"([^"]*)")?/
const commentRegex = /^\s+\//


/**
* Convert a single line of the template into a single quasi-VDOM node.
*
* @arg {string} line - A single line of the template
* @arg {function} takeParam - Returns the next interpolated template parameter
* @return {object} - A node, parsed from the single-line input string
*/
const lineToNode = (line, takeParam) => {
    const match = lineRegex.exec(line)
    if (!match || line.match(commentRegex)) return null

    const indent = match[1].length
    const parsedProps = {
        className: (match[3] || '').replace(/\./g, ' ') || null,
        children: []
    }

    const stringChild = match[5]
    if (stringChild) parsedProps.children = [stringChild]

    // If '$$$' was matched (a template var was passed in with props)
    const variableProps = match[4] ? takeParam() : {}
    return {
        indent,
        type: match[2],
        props: Object.assign(variableProps, parsedProps)    // FIXME: merge className
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
    const children = (node && node.props && node.props.children)
                     ? node.props.children.map(n => renderTree(n, renderer))
                     : null
    const props = Object.assign(node.props, { children })
    return renderer(node.type, props)
}

const create = (createEl) => {
    return function parseTemplate(templateChunks) {
        const params = [].slice.call(arguments, 1)

        return function renderTemplate(/* config */) {
            const lines = templateChunks.join('$$$').split('\n')    // Hacky line joining
            const parsedLines = lines.map(l => lineToNode(l, () => params.shift()))
                                     .filter(l => !!l)
            const tree = nodesToTree(parsedLines)
            return renderTree(tree, createEl)
        }
    }
}

exports.create = create
