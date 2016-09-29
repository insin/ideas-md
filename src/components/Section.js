require('./Section.css')

var React = require('react')
var Octicon = require('react-octicon')

var Button = require('./Button')
var MarkdownArea = require('./MarkdownArea')

var Section = React.createClass({
  handleBlur(e) {
    var {name, value} = e.target
    if (value !== this.props[name]) {
      this.props.actions.editSection({
        id: this.props.id,
        change: {[name]: value}
      })
    }
  },
  handleRemove(e) {
    if (window.confirm(`Delete ${this.props.section || '[section]'}?`)) {
      this.props.actions.removeSection(this.props.id)
    }
  },
  render() {
    return <div className="Section">
      <h2>
        <Button className="Section__remove" onClick={this.handleRemove} title="Remove section">
          <Octicon name="trashcan"/>
        </Button>
        <input
          autoFocus={this.props.isNew}
          className="Section__name"
          defaultValue={this.props.section}
          name="section"
          onBlur={this.handleBlur}
          placeholder="[section]"
          spellCheck="false"
          type="text"
        />
      </h2>
      <MarkdownArea
        name="ideas"
        value={this.props.ideas}
        onBlur={this.handleBlur}
        placeholder="[ideas]"
      />
    </div>
  }
})

module.exports = Section
