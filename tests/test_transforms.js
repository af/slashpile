const react = require('react')
const render = require('react-dom/server').renderToStaticMarkup

const painless = require('painless')
const test = painless.createGroup('Transforms')
const assert = painless.assert



test('classMap', () => {
    const pile = require('..').create(react.createElement, {
        classMap: { foo: 'bar', random: 'stuff' }
    })

    const basicTag = pile`
        span.foo
    `
    assert.strictEqual(render(basicTag), '<span class="bar"></span>')

    const nonMatchesUntouched = pile`
        span.asdf
    `
    assert.strictEqual(render(nonMatchesUntouched), '<span class="asdf"></span>')

    const mixedClasses = pile`
        span.foo.asdf
    `
    assert.strictEqual(render(mixedClasses), '<span class="bar asdf"></span>')
})


test('propExtend', () => {
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
    `
    assert.strictEqual(render(basicTag), '<span class="foo" style="color:red;"></span>')

    const noStyles = pile`
        span
    `
    assert.strictEqual(render(noStyles), '<span></span>')
})


test('propExtend for react-native', () => {
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
    `
    assert.deepEqual(basicTag.props.style, [{ color: 'red' }])

    const multiStyles = pile`
        span.foo.bar
    `
    assert.deepEqual(multiStyles.props.style, [{ color: 'red' }, { color: 'green' }])

    const noStyles = pile`
        span
    `
    assert.deepEqual(noStyles.props.style, undefined)
})


test('tagMap with string values', () => {
    const pile = require('..').create(react.createElement, {
        tagMap: { foo: 'div', bar: 'span' }
    })

    const simple = pile`
        foo
    `
    assert.deepEqual(render(simple), '<div></div>')

    const classed = pile`
        foo.bar.baz
    `
    assert.deepEqual(render(classed), '<div class="bar baz"></div>')
})

test('tagMap with custom components', () => {
    const C = (props) => react.DOM.div({ 'data-x': props.data }, props.label || 'hey')
    const pile = require('..').create(react.createElement, {
        tagMap: { View: C }
    })

    const simple = pile`
        View
    `
    assert.deepEqual(render(simple), '<div>hey</div>')

    const withProps = pile`
        View ${{ label: 'yo', data: 123 }}
    `
    assert.deepEqual(render(withProps), '<div data-x="123">yo</div>')
})
