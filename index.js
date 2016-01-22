'use strict'

const lineRegex = /^(\s+)(\w+)(\.([\w\.-]+))* ?(\$\$\$)?/
const commentRegex = /^\s+\//


const lineToNode = (line, takeParam) => {
    const match = lineRegex.exec(line)
    if (!match || line.match(commentRegex)) return null

    const indent = match[1].length
    let parsedProps = {
        className: (match[4] || '').replace(/\./g, ' ') || null,
        children: []
    }

    // If '$$$' was matched (a template var was passed in with props)
    const variableProps = match[5] ? takeParam() : {}
    return {
        indent,
        type: match[2],
        props: Object.assign(variableProps, parsedProps)    // FIXME: merge className
    }
}

const create = (createEl) => {
    return function parseTemplate(templateChunks) {
        const params = [].slice.call(arguments, 1)

        return function renderTemplate(/* config */) {
            // console.log('PARAMS', params)
            const lines = templateChunks.join('$$$').split('\n')     // FIXME: join hack
            const parsedLines = lines.map(l => lineToNode(l, () => params.shift()))
                                     .filter(l => !!l)

            const node2dom = (node) => createEl(node.type, node.props)
            return node2dom(parsedLines[0])
        }
    }
}

exports.create = create
