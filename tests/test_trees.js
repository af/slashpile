const react = require('react')
const render = require('react-dom/server').renderToStaticMarkup
const pile = require('..').create(react.createElement)

const painless = require('painless')
const test = painless.createGroup('Tree inputs')
const assert = painless.assert


test('simple two-tag tree', () => {
    const basicTag = pile`
        div
            span
    `
    assert.strictEqual(render(basicTag), '<div><span></span></div>')
})

test('more involved nesting', () => {
    const siblings = pile`
        div
            span
            span
    `
    assert.strictEqual(render(siblings), '<div><span></span><span></span></div>')

    const threeLevels = pile`
        div
            span
                span
    `
    assert.strictEqual(render(threeLevels), '<div><span><span></span></span></div>')

    const multilevels = pile`
        form
            div
                input
                select
            div
                input
    `
    assert.strictEqual(render(multilevels), `<form>
        <div><input/><select></select></div>
        <div><input/></div>
    </form>
    `.replace(/\n\s+/g, ''))
})

test('multilevel example with parameters', () => {
    const multilevels = pile`
        form ${{ method: 'post', action: '/foo' }}
            h1 "this is a form"
            fieldset.baz
                input ${{ type: 'email' }}
                select ${{ name: 'asdf' }}
            div
                span "hey there"
    `
    assert.strictEqual(render(multilevels), `<form method="post" action="/foo">
        <h1>this is a form</h1>
        <fieldset class="baz">
            <input type="email"/>
            <select name="asdf"></select>
        </fieldset>
        <div><span>hey there</span></div>
    </form>
    `.replace(/\n\s+/g, ''))
})

test('array children', () => {
    const items = ['one', 'two', 'three']
    const multilevels = pile`
        ul
            ${items.map(x => pile`
                li ${{ key: x }} ${x}
            `)}
    `
    assert.strictEqual(render(multilevels), `<ul>
        <li>one</li>
        <li>two</li>
        <li>three</li>
    </ul>`.replace(/\n\s+/g, ''))

    const emptyItems = []
    const empty = pile`
        ul
            > ${emptyItems}
    `
    assert.strictEqual(render(empty), `<ul></ul>`)
})
