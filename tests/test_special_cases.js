const React = require('react')
const render = require('react-dom/server').renderToStaticMarkup
const pile = require('..').create(React.createElement)

const { createGroup, assert } = require('painless')
const test = createGroup('Tree inputs')


// Create a component that expects a single ReactElement as its children
// (not an array, which is generally ok).
//
// During tests, this actually just triggers a warning. But for components
// like react-redux's Provider, it causes runtime errors in development
class SingleChildComponent extends React.Component {
    render() {
        return React.createElement('div', null, this.props.children)
    }
}
SingleChildComponent.propTypes = {
    children: React.PropTypes.element.isRequired
}


test('simple two-tag tree', () => {
    const basicTag = pile`
        ${SingleChildComponent}
            span
    `()
    assert.strictEqual(render(basicTag), '<div><span></span></div>')
})
