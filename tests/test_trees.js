const test = require('tape')
const react = require('react')
const reactDOM = require('react-dom/server')
const retree = require('..').create(react.createElement)

const render = (dom) => reactDOM.renderToStaticMarkup(dom)


test('simple two-tag tree', (t) => {
    const basicTag = retree`
        div
            span
    `()
    t.strictEqual(render(basicTag), '<div><span></span></div>')
    t.end()
})

test('more involved nesting', (t) => {
    const siblings = retree`
        div
            span
            span
    `()
    t.strictEqual(render(siblings), '<div><span></span><span></span></div>')

    const threeLevels = retree`
        div
            span
                span
    `()
    t.strictEqual(render(threeLevels), '<div><span><span></span></span></div>')

    const multilevels = retree`
        form
            div
                input
                select
            div
                input
    `()
    t.strictEqual(render(multilevels), `<form>
        <div><input/><select></select></div>
        <div><input/></div>
    </form>
    `.replace(/\n\s+/g, ''))

    t.end()
})

test('multilevel example with parameters', t => {
    const multilevels = retree`
        form ${{ method: 'post', action: '/foo' }}
            h1 "this is a form"
            fieldset.baz
                input ${{ type: 'email' }}
                select ${{ name: 'asdf' }}
            div
                span "hey there"
    `()
    t.strictEqual(render(multilevels), `<form method="post" action="/foo">
        <h1>this is a form</h1>
        <fieldset class="baz">
            <input type="email"/>
            <select name="asdf"></select>
        </fieldset>
        <div><span>hey there</span></div>
    </form>
    `.replace(/\n\s+/g, ''))

    t.end()
})
