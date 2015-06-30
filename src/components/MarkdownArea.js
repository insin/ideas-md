var React = require('react')
var CodeMirror = require('codemirror')

/**
 * A Markdown editing component which only provides updates onBlur.
 */
var MarkdownArea = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    onBlur: React.PropTypes.func.isRequired,
    placeholder: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired
  },
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.cm.getValue()) {
      this.cm.setValue(nextProps.value)
    }
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
