const lineRegex = /^(\s+)(\w+)(\.(\w+))*/
const commentRegex = /^\s+\//

// TODO: pass in "takeParam" function that pulls template params in
const lineToNode = (line) => {
    const match = lineRegex.exec(line)
    if (!match || line.match(commentRegex)) return null

    const indent = match[1].length
    return {
        indent,
        type: match[2],
        className: match[4],
        children: []
    }
}

const create = (createEl) => {
    return (templateChunks) => (config) => {
        const params = [].slice.call(arguments, 1)
        const lines = templateChunks.join('$$$').split('\n')     // FIXME: join hack
        const parsedLines = lines.map(lineToNode)
                                 .filter(l => !!l)

        //console.log(parsedLines)
        const node2dom = (node) => createEl(node.type, { className: node.className })
        return node2dom(parsedLines[0])
    }
}

exports.create = create
