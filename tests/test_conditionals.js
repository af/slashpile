const painless = require('painless')
const react = require('react')
const render = require('react-dom/server').renderToStaticMarkup
const pile = require('..').create(react.createElement)
const test = painless.createGroup('Conditional elements')
const assert = painless.assert


// Custom component for testing
const C = () => react.DOM.div(null, 'hi')


test('&& expressions', () => {
    const conditionalTagname = pile`
        div.wrap
            ${false && 'div'}.inner
    `
    assert.strictEqual(render(conditionalTagname), `<div class="wrap"></div>`)

    const conditionalComponent = pile`
        div.wrap
            ${false && C}.inner
    `
    assert.strictEqual(render(conditionalComponent), `<div class="wrap"></div>`)
})

test('ternary component type', () => {
    const pred = true
    const conditionalType = pile`
        div.wrap
            ${pred ? 'div' : C}.inner
    `
    assert.strictEqual(render(conditionalType),
                  `<div class="wrap"><div class="inner"></div></div>`)
})
