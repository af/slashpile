const painless = require('painless')
const react = require('react')
const render = require('react-dom/server').renderToStaticMarkup
const pile = require('..').create(react.createElement)
const test = painless.createGroup('Conditional elements')
const assert = painless.assert


// Custom component for testing
const C = () => react.DOM.div(null, 'hi')


test('$if', () => {
    const ifFalse = pile`
        div.wrap
            div.inner ${{ $if: false }}
    `
    assert.strictEqual(render(ifFalse), `<div class="wrap"></div>`)

    const ifTrue = pile`
        div.wrap
            div.inner ${{ $if: true }}
    `
    assert.strictEqual(render(ifTrue),
                       `<div class="wrap"><div class="inner"></div></div>`)

    const falseTree = pile`
        div.wrap
            div.inner ${{ $if: false }}
                span.hi "hi"
                span.yo "yo"
    `
    assert.strictEqual(render(falseTree), `<div class="wrap"></div>`)
})

test('&& expressions', () => {
    const conditionalTagname = pile`
        div.wrap
            ${ false && 'div' }.inner
    `
    assert.strictEqual(render(conditionalTagname), `<div class="wrap"></div>`)

    const conditionalComponent = pile`
        div.wrap
            ${ false && C }.inner
    `
    assert.strictEqual(render(conditionalComponent), `<div class="wrap"></div>`)
})

test('ternary component type', () => {
    const pred = true
    const conditionalType = pile`
        div.wrap
            ${ pred ? 'div' : C }.inner
    `
    assert.strictEqual(render(conditionalType),
                  `<div class="wrap"><div class="inner"></div></div>`)
})
