const test = require('tape')
const react = require('react')
const reactDOM = require('react-dom/server')
const retree = require('..').create(react.createElement)

const render = (dom) => reactDOM.renderToStaticMarkup(dom)


test('simple matching without interpolation', (t) => {
    const basicTag = retree`
        span
    `()
    t.strictEqual(render(basicTag), '<span></span>')

    const output = retree`
        div.foo
    `()
    t.strictEqual(render(output), '<div class="foo"></div>')
    t.end()
})

test('discard empty or commented lines', (t) => {
    const extraSpace = retree`

        div.bar

    `()
    t.strictEqual(render(extraSpace), '<div class="bar"></div>')

    const withComments = retree`
        // please disregard this comment
        div.bar
        /div
    `()
    t.strictEqual(render(withComments), '<div class="bar"></div>')
    t.end()
})
