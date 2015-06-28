var React = require('react')
var CodeMirror = require('codemirror')

var MarkdownArea = React.createClass({
  componentDidMount() {
    this.cm = CodeMirror.fromTextArea(React.findDOMNode(this.refs.textarea), {
      lineWrapping: true,
      mode: 'gfm',
      placeholder: this.props.placeholder,
      tabSize: 2,
      theme: 'monokai',
      viewportMargin: Infinity
    })
    this.cm.on('blur', this.handleBlur)
  },
  componentWillUnmount() {
    this.cm.toTextArea()
  },
  handleBlur(doc) {
    this.props.onBlur({target: {name: this.props.name, value: doc.getValue()}})
  },
  render() {
    return <div className="MarkdownArea">
      <textarea ref="textarea" name={this.props.name} defaultValue={this.props.value} autoComplete="off"/>
    </div>
  }
})

module.exports = MarkdownArea
