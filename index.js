const lineRegex = /^(\s+)(\w+)(\.(\w+))*/
const commentRegex = /^\s+\//

const create = (createEl) => {
    return (templateChunks, values) => (config) => {        // TODO: rest params for values
        const lines = templateChunks.join('$$$').split('\n')     // FIXME: join hack
        const parsedLines = lines.map((line) => {
            const match = lineRegex.exec(line)
            if (!match || line.match(commentRegex)) return null

            const indent = match[1].length
            return { indent, match, children: [] }
        })
        .filter(l => !!l)

        //console.log(parsedLines)
        const match2dom = (match) => createEl(match[2], { className: match[4] })
        return match2dom(parsedLines[0].match)
    }
}

exports.create = create
