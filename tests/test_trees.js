const test = require('tape')
const react = require('react')
const render = require('react-dom/server').renderToStaticMarkup
const pile = require('..').create(react.createElement)


test('simple two-tag tree', (t) => {
    const basicTag = pile`
        div
            span
    `()
    t.strictEqual(render(basicTag), '<div><span></span></div>')
    t.end()
})

test('more involved nesting', (t) => {
    const siblings = pile`
        div
            span
            span
    `()
    t.strictEqual(render(siblings), '<div><span></span><span></span></div>')

    const threeLevels = pile`
        div
            span
                span
    `()
    t.strictEqual(render(threeLevels), '<div><span><span></span></span></div>')

    const multilevels = pile`
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
    const multilevels = pile`
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

test('array mapped children', t => {
    const multilevels = retree`
        ul
            > ${ ['one', 'two', 'three'].map(x => retree`
                li ${{ key: x }} ${x}
            `()) }
    `()
    t.strictEqual(render(multilevels), `<ul>
        <li>one</li>
        <li>two</li>
        <li>three</li>
    `.replace(/\n\s+/g, ''))

    t.end()
})
