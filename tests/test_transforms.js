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


test('propMap', (t) => {
    const styles = { foo: { color: 'red' }, bar: { color: 'green' } }
    const pile = require('..').create(react.createElement, {
        propMap: {
            className: c => ({
                // Note: [0] hack is for the html style attribute;
                // on react-native we wouldn't use it because the style prop
                // accepts arrays
                style: c.split(' ').map(cls => styles[cls])[0]
            })
        }
    })

    const basicTag = pile`
        span.foo
    `()
    t.strictEqual(render(basicTag), '<span class="foo" style="color:red;"></span>')

    t.end()
})


