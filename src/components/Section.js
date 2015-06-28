require('./Section.css')

var React = require('react')

var Button = require('./Button')
var MarkdownArea = require('./MarkdownArea')
var IdeasStore = require('../store')

var Section = React.createClass({
  handleBlur(e) {
    var {name, value} = e.target
    if (value !== this.props[name]) {
      IdeasStore.editSection({[name]: value}, this.props.index)
    }
  },
  handleRemove(e) {
    if (window.confirm(`Delete ${this.props.section || '[section]'}?`)) {
      IdeasStore.removeSection(this.props.index)
    }
  },
  render() {
    return <div className="Section">
      <h2>
        <Button className="Section__remove" onClick={this.handleRemove} title="Remove section">
          &ndash;
        </Button>
        <input autoFocus={this.props.isNew}
               className="Section__name"
               value={this.props.section}
               name="section"
               onBlur={this.handleBlur}
               placeholder="[section]"
               spellCheck="false"
               type="text"/>
      </h2>
      <MarkdownArea name="ideas"
                    value={this.props.ideas}
                    onBlur={this.handleBlur}
                    placeholder="[ideas]"/>
    </div>
  }
})

module.exports = Section
