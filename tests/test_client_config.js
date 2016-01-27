const test = require('tape')
const react = require('react')
const render = require('react-dom/server').renderToStaticMarkup


test('classMap', (t) => {
    const pile = require('..').create(react.createElement, {
        classMap: { foo: 'bar', random: 'stuff' }
    })

    const basicTag = pile`
        span.foo
    `()
    t.strictEqual(render(basicTag), '<span class="bar"></span>')

    const nonMatchesUntouched = pile`
        span.asdf
    `()
    t.strictEqual(render(nonMatchesUntouched), '<span class="asdf"></span>')

    const mixedClasses = pile`
        span.foo.asdf
    `()
    t.strictEqual(render(mixedClasses), '<span class="bar asdf"></span>')

    t.end()
})


