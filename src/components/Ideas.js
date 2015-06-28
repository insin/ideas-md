require('./Ideas.css')

var React = require('react')

var Button = require('./Button')
var MarkdownArea = require('./MarkdownArea')
var Section = require('./Section')
var IdeasStore = require('../store')
var {createFileContents, exportFile, parseFileContents} = require('../utils')

var hasFileReader = 'FileReader' in window

var Ideas = React.createClass({
  getInitialState() {
    return IdeasStore.get()
  },
  componentDidMount() {
    IdeasStore.notifyChange = () => {
      this.setState(IdeasStore.get())
    }
    if (hasFileReader) {
      document.addEventListener('dragover', this.handleDragOver)
      document.addEventListener('drop', this.handleDrop)
    }
  },
  componentWillUnmount() {
    if (hasFileReader) {
      document.removeEventListener('dragover', this.handleDragOver)
      document.removeEventListener('drop', this.handleDrop)
    }
  },

  handleAddSection(e) {
    IdeasStore.addSection()
  },
  handleBlur(e) {
    IdeasStore.editGeneral(e.target.value)
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
      IdeasStore.import(state)
    }
    reader.readAsText(e.dataTransfer.files[0])
  },
  handleExport(e) {
    var {general, sections, exportFormat} = this.state
    var contents = createFileContents(general, sections, exportFormat)
    exportFile(contents, 'IDEAS.md')
  },

  render() {
    return <div className="Ideas">
      <div className="Ideas__buttons">
        <Button onClick={this.handleAddSection} title="Add section">+</Button>
        <Button onClick={this.handleExport} title="Export to file">↓</Button>
      </div>
      <div className="Ideas__general">
        <MarkdownArea name="general"
                      value={this.state.general}
                      onBlur={this.handleBlur}
                      placeholder="[general]"/>
      </div>
      <div className="Ideas__sections">
        {this.state.sections.map((section, i) =>
          <Section {...section}
                   index={i}
                   isNew={section.id === this.state.newSectionId}
                   key={section.id}
                   onChange={this.handleSectionChange}/>
        )}
      </div>
      <footer>ideas-md {VERSION} | <a href="https://github.com/insin/ideas-md">insin/ideas-md</a></footer>
    </div>
  }
})

module.exports = Ideas
