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

    const multiClass = retree`
        div.foo.bar.baz
    `()
    t.strictEqual(render(multiClass), '<div class="foo bar baz"></div>')

    const multiClass2 = retree`
        div.foo-1.bar_2
    `()
    t.strictEqual(render(multiClass2), '<div class="foo-1 bar_2"></div>')
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

test('passing in props as a template variable', t => {
    const withVar = retree`
        div ${{ id: 'baz' }}
    `()
    t.strictEqual(render(withVar), '<div id="baz"></div>')
    t.end()
})
