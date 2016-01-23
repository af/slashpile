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

test('string literal contents', t => {
    const plainDiv = retree`
        div "hi there"
    `()
    t.strictEqual(render(plainDiv), '<div>hi there</div>')

    const withVar = retree`
        div ${{ id: 'baz' }} "hi there"
    `()
    t.strictEqual(render(withVar), '<div id="baz">hi there</div>')
    t.end()
})

test('interpolated string contents', t => {
    const plainDiv = retree`
        div ${{}} ${'yo'}
    `()
    t.strictEqual(render(plainDiv), '<div>yo</div>')

    const stringVarOnly = retree`
        div ${'yo'}
    `()
    t.strictEqual(render(stringVarOnly), '<div>yo</div>')

    const stringVarEscaping = retree`
        div ${'yo & hi'}
    `()
    t.strictEqual(render(stringVarEscaping), '<div>yo &amp; hi</div>')

    const nestedTemplates = retree`
        div ${`this
is
multiline`}
    `()
    t.strictEqual(render(nestedTemplates), '<div>this\nis\nmultiline</div>')

    const x = 123
    const nestedInterpolation = retree`
        div ${`this is ${x}`}
    `()
    t.strictEqual(render(nestedInterpolation), '<div>this is 123</div>')
    t.end()
})
