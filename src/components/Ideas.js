require('./Ideas.css')

var React = require('react')

var Button = require('./Button')
var MarkdownArea = require('./MarkdownArea')
var Section = require('./Section')
var {createFileContents, exportFile, parseFileContents, storeState} = require('../utils')

var hasFileReader = 'FileReader' in window

var Ideas = React.createClass({
  componentDidMount() {
    if (hasFileReader) {
      document.addEventListener('dragover', this.handleDragOver)
      document.addEventListener('drop', this.handleDrop)
    }
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  },
  componentWillUnmount() {
    if (hasFileReader) {
      document.removeEventListener('dragover', this.handleDragOver)
      document.removeEventListener('drop', this.handleDrop)
    }
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  },

  handleAddSection(e) {
    this.props.actions.addSection()
  },
  handleBeforeUnload(e) {
    var {general, sections, exportFormat} = this.props
    storeState({general, sections, exportFormat})
  },
  handleBlur(e) {
    this.props.actions.editGeneral(e.target.value)
  },
  handleDragOver(e) {
    e.preventDefault()
  },
  handleDrop(e) {
    e.preventDefault()
    if (!e.dataTransfer.files || !e.dataTransfer.files[0]) {
      return
    }
    var reader = new window.FileReader()
    reader.onload = (e) => {
      var text = e.target.result
      var state = parseFileContents(text)
      this.props.actions.importIdeas(state)
    }
    reader.readAsText(e.dataTransfer.files[0])
  },
  handleExport(e) {
    var {general, sections, exportFormat} = this.props
    var contents = createFileContents(general, sections, exportFormat)
    exportFile(contents, 'IDEAS.md')
  },

  render() {
    var {actions, general, newSectionId, sections} = this.props
    return <div className="Ideas">
      <div className="Ideas__buttons">
        <Button onClick={this.handleAddSection} title="Add section">+</Button>
        <Button onClick={this.handleExport} title="Export to file">↓</Button>
      </div>
      <div className="Ideas__general">
        <MarkdownArea name="general"
                      value={general}
                      onBlur={this.handleBlur}
                      placeholder="[general]"/>
      </div>
      <div className="Ideas__sections">
        {sections.map((section, i) =>
          <Section {...section}
                   actions={actions}
                   isNew={section.id === newSectionId}
                   key={section.id}/>
        )}
      </div>
      <footer>ideas-md {VERSION} | <a href="https://github.com/insin/ideas-md">insin/ideas-md</a></footer>
    </div>
  }
})

module.exports = Ideas
