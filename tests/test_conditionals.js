const test = require('tape')
const react = require('react')
const render = require('react-dom/server').renderToStaticMarkup
const pile = require('..').create(react.createElement)

// Custom component for testing
const C = () => react.DOM.div(null, 'hi')


test('$if', t => {
    const ifFalse = pile`
        div.wrap
            div.inner ${{ $if: false }}
    `()
    t.strictEqual(render(ifFalse), `<div class="wrap"></div>`)

    const ifTrue = pile`
        div.wrap
            div.inner ${{ $if: true }}
    `()
    t.strictEqual(render(ifTrue), `<div class="wrap"><div class="inner"></div></div>`)

    const falseTree = pile`
        div.wrap
            div.inner ${{ $if: false }}
                span.hi "hi"
                span.yo "yo"
    `()
    t.strictEqual(render(falseTree), `<div class="wrap"></div>`)
    t.end()
})

test('&& expressions', t => {
    const conditionalTagname = pile`
        div.wrap
            ${ false && 'div' }.inner
    `()
    t.strictEqual(render(conditionalTagname), `<div class="wrap"></div>`)

    const conditionalComponent = pile`
        div.wrap
            ${ false && C }.inner
    `()
    t.strictEqual(render(conditionalComponent), `<div class="wrap"></div>`)
    t.end()
})

test('ternary component type', t => {
    const pred = true
    const conditionalType = pile`
        div.wrap
            ${ pred ? 'div' : C }.inner
    `()
    t.strictEqual(render(conditionalType),
                  `<div class="wrap"><div class="inner"></div></div>`)

    t.end()
})
