const test = require('tape')
const react = require('react')
const render = require('react-dom/server').renderToStaticMarkup
const pile = require('..').create(react.createElement)


test('simple matching without interpolation', (t) => {
    const basicTag = pile`
        span
    `()
    t.strictEqual(render(basicTag), '<span></span>')

    const output = pile`
        div.foo
    `()
    t.strictEqual(render(output), '<div class="foo"></div>')

    const multiClass = pile`
        div.foo.bar.baz
    `()
    t.strictEqual(render(multiClass), '<div class="foo bar baz"></div>')

    const multiClass2 = pile`
        div.foo-1.bar_2
    `()
    t.strictEqual(render(multiClass2), '<div class="foo-1 bar_2"></div>')
    t.end()
})

test('discard empty or commented lines', (t) => {
    const extraSpace = pile`

        div.bar

    `()
    t.strictEqual(render(extraSpace), '<div class="bar"></div>')

    const withComments = pile`
        // please disregard this comment
        div.bar
        /div
    `()
    t.strictEqual(render(withComments), '<div class="bar"></div>')
    t.end()
})

test('type attribute shorthand', t => {
    const emailInput = pile`
        input:email
    `()
    t.strictEqual(render(emailInput), '<input type="email"/>')

    const submitButton = pile`
        button:submit
    `()
    t.strictEqual(render(submitButton), '<button type="submit"></button>')

    t.end()
})


test('passing in props as a template variable', t => {
    const withVar = pile`
        div ${{ id: 'baz' }}
    `()
    t.strictEqual(render(withVar), '<div id="baz"></div>')
    t.end()
})

test('string literal contents', t => {
    const plainDiv = pile`
        div "hi there"
    `()
    t.strictEqual(render(plainDiv), '<div>hi there</div>')

    const withVar = pile`
        div ${{ id: 'baz' }} "hi there"
    `()
    t.strictEqual(render(withVar), '<div id="baz">hi there</div>')
    t.end()
})

test('custom components', t => {
    const C = react.createClass({
        render: function() {
            const p = { className: this.props.cls }
            return react.DOM.div(p, this.props.children || 'hi')
        }
    })

    const noArgs = pile`
        ${C}
    `()
    t.strictEqual(render(noArgs), '<div>hi</div>')

    const withStringChild = pile`
        ${C} "yoyo"
    `()
    t.strictEqual(render(withStringChild), '<div>yoyo</div>')

    const withProps = pile`
        ${C} ${{ cls: 'foo' }}
    `()
    t.strictEqual(render(withProps), '<div class="foo">hi</div>')

    const withPropsAndChild = pile`
        ${C} ${{ cls: 'foo' }} "yo"
    `()
    t.strictEqual(render(withPropsAndChild), '<div class="foo">yo</div>')

    const withDoubleInterpolation = pile`
        ${C} ${{ cls: 'bar' }} ${ 'heyo' }
    `()
    t.strictEqual(render(withDoubleInterpolation), '<div class="bar">heyo</div>')

    t.end()
})


test('merging of className', t => {
    const plainDiv = pile`
        div.foo ${{ className: 'bar' }}
    `()
    t.strictEqual(render(plainDiv), '<div class="foo bar"></div>')

    const multiclass = pile`
        div.foo.goo ${{ className: 'bar baz' }}
    `()
    t.strictEqual(render(multiclass), '<div class="foo goo bar baz"></div>')
    t.end()
})


test('interpolated string contents', t => {
    const plainDiv = pile`
        div ${{}} ${'yo'}
    `()
    t.strictEqual(render(plainDiv), '<div>yo</div>')

    const stringVarOnly = pile`
        div ${'yo'}
    `()
    t.strictEqual(render(stringVarOnly), '<div>yo</div>')

    const stringVarEscaping = pile`
        div ${'yo & hi'}
    `()
    t.strictEqual(render(stringVarEscaping), '<div>yo &amp; hi</div>')

    const nestedTemplates = pile`
        div ${`this
is
multiline`}
    `()
    t.strictEqual(render(nestedTemplates), '<div>this\nis\nmultiline</div>')

    const x = 123
    const nestedInterpolation = pile`
        div ${`this is ${x}`}
    `()
    t.strictEqual(render(nestedInterpolation), '<div>this is 123</div>')
    t.end()
})
