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


test('propExtend', (t) => {
    const styles = { foo: { color: 'red' }, bar: { color: 'green' } }
    const pile = require('..').create(react.createElement, {
        propExtend: {
            className: c => ({
                // Note: [0] hack is for the html style attribute;
                // on react-native we wouldn't use it because the style prop
                // accepts arrays
                style: c && c.split(' ').map(cls => styles[cls])[0]
            })
        }
    })

    const basicTag = pile`
        span.foo
    `()
    t.strictEqual(render(basicTag), '<span class="foo" style="color:red;"></span>')

    const noStyles = pile`
        span
    `()
    t.strictEqual(render(noStyles), '<span></span>')

    t.end()
})


test('propExtend for react-native', (t) => {
    const styles = { foo: { color: 'red' }, bar: { color: 'green' } }
    const pile = require('..').create(react.createElement, {
        propExtend: {
            className: c => ({
                // Test for when the styles prop accepts arrays:
                style: c && c.split(' ').map(cls => styles[cls])
            })
        }
    })

    const basicTag = pile`
        span.foo
    `()
    t.deepEqual(basicTag.props.style, [{ color: 'red' }])

    const multiStyles = pile`
        span.foo.bar
    `()
    t.deepEqual(multiStyles.props.style, [{ color: 'red' }, { color: 'green' }])

    const noStyles = pile`
        span
    `()
    t.deepEqual(noStyles.props.style, null)

    t.end()
})
