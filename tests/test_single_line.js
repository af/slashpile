const react = require('react')
const render = require('react-dom/server').renderToStaticMarkup
const pile = require('..').create(react.createElement)

const painless = require('painless')
const test = painless.createGroup('Single line inputs')
const assert = painless.assert


test('simple matching without interpolation', () => {
    const basicTag = pile`
        span
    `()
    assert.strictEqual(render(basicTag), '<span></span>')

    const output = pile`
        div.foo
    `()
    assert.strictEqual(render(output), '<div class="foo"></div>')

    const multiClass = pile`
        div.foo.bar.baz
    `()
    assert.strictEqual(render(multiClass), '<div class="foo bar baz"></div>')

    const multiClass2 = pile`
        div.foo-1.bar_2
    `()
    assert.strictEqual(render(multiClass2), '<div class="foo-1 bar_2"></div>')
})

test('discard empty or commented lines', () => {
    const extraSpace = pile`

        div.bar

    `()
    assert.strictEqual(render(extraSpace), '<div class="bar"></div>')

    const withComments = pile`
        // please disregard this comment
        div.bar
        /div
    `()
    assert.strictEqual(render(withComments), '<div class="bar"></div>')
})

test('type attribute shorthand', () => {
    const emailInput = pile`
        input:email
    `()
    assert.strictEqual(render(emailInput), '<input type="email"/>')

    const submitButton = pile`
        button:submit
    `()
    assert.strictEqual(render(submitButton), '<button type="submit"></button>')
})


test('passing in props as a template variable', () => {
    const withVar = pile`
        div ${{ id: 'baz' }}
    `()
    assert.strictEqual(render(withVar), '<div id="baz"></div>')
})

test('string literal contents', () => {
    const plainDiv = pile`
        div "hi there"
    `()
    assert.strictEqual(render(plainDiv), '<div>hi there</div>')

    const withVar = pile`
        div ${{ id: 'baz' }} "hi there"
    `()
    assert.strictEqual(render(withVar), '<div id="baz">hi there</div>')
})

test('custom components', () => {
    const C = react.createClass({
        render: function() {
            const p = { className: this.props.cls }
            return react.DOM.div(p, this.props.children || 'hi')
        }
    })

    const noArgs = pile`
        ${C}
    `()
    assert.strictEqual(render(noArgs), '<div>hi</div>')

    const withStringChild = pile`
        ${C} "yoyo"
    `()
    assert.strictEqual(render(withStringChild), '<div>yoyo</div>')

    const withProps = pile`
        ${C} ${{ cls: 'foo' }}
    `()
    assert.strictEqual(render(withProps), '<div class="foo">hi</div>')

    const withPropsAndChild = pile`
        ${C} ${{ cls: 'foo' }} "yo"
    `()
    assert.strictEqual(render(withPropsAndChild), '<div class="foo">yo</div>')

    const withDoubleInterpolation = pile`
        ${C} ${{ cls: 'bar' }} ${ 'heyo' }
    `()
    assert.strictEqual(render(withDoubleInterpolation), '<div class="bar">heyo</div>')
})


test('merging of className', () => {
    const plainDiv = pile`
        div.foo ${{ className: 'bar' }}
    `()
    assert.strictEqual(render(plainDiv), '<div class="foo bar"></div>')

    const multiclass = pile`
        div.foo.goo ${{ className: 'bar baz' }}
    `()
    assert.strictEqual(render(multiclass), '<div class="foo goo bar baz"></div>')
})

test('inputs without linebreaks', () => {
    const plainDiv = pile`div`()
    assert.strictEqual(render(plainDiv), '<div></div>')

    const classed = pile`div.foo.bar`()
    assert.strictEqual(render(classed), '<div class="foo bar"></div>')
})

test('children of type Number', () => {
    const numChild = pile`div ${7}`()
    assert.strictEqual(render(numChild), '<div>7</div>')
})

test('interpolated string contents', () => {
    const plainDiv = pile`
        div ${{}} ${'yo'}
    `()
    assert.strictEqual(render(plainDiv), '<div>yo</div>')

    const stringVarOnly = pile`
        div ${'yo'}
    `()
    assert.strictEqual(render(stringVarOnly), '<div>yo</div>')

    const stringVarEscaping = pile`
        div ${'yo & hi'}
    `()
    assert.strictEqual(render(stringVarEscaping), '<div>yo &amp; hi</div>')

    const nestedTemplates = pile`
        div ${`this
is
multiline`}
    `()
    assert.strictEqual(render(nestedTemplates), '<div>this\nis\nmultiline</div>')

    const x = 123
    const nestedInterpolation = pile`
        div ${`this is ${x}`}
    `()
    assert.strictEqual(render(nestedInterpolation), '<div>this is 123</div>')
})
