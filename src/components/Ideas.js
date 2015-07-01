require('./Ideas.css')

var React = require('react')
var Octicon = require('react-octicon')

var Button = require('./Button')
var Gist = require('./Gist')
var MarkdownArea = require('./MarkdownArea')

var Section = require('./Section')
var {exportFile, storeState} = require('../utils')
var {createMarkdown} = require('../markdown')

var hasFileReader = 'FileReader' in window

var Ideas = React.createClass({
  getInitialState() {
    return {
      showGist: !!this.props.gist
    }
  },
  componentDidMount() {
    if (hasFileReader) {
      document.addEventListener('dragover', this.handleDragOver)
      document.addEventListener('drop', this.handleDrop)
    }
    window.addEventListener('beforeunload', this.handleBeforeUnload)

    if (!this.props.gist && window.location.hash.length === 21) {
      this.props.actions.editGist(window.location.hash.substring(1))
      if (!this.state.showGist) {
        this.setState({showGist: true})
      }
    }
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
    var {general, sections, exportFormat, gist, token} = this.props
    storeState({general, sections, exportFormat, gist, token})
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
    reader.onload = (e) => this.props.actions.importMarkdown(e.target.result)
    reader.readAsText(e.dataTransfer.files[0])
  },
  handleEditGeneral(e) {
    this.props.actions.editGeneral(e.target.value)
  },
  handleExport(e) {
    exportFile(createMarkdown(this.props), 'IDEAS.md')
  },
  handleToggleGist() {
    this.setState({showGist: !this.state.showGist})
  },

  render() {
    var {actions, general, gist, loading, newSectionId, sections, token, updating} = this.props
    var {showGist} = this.state
    return <div className="Ideas">
      <div className="Ideas__tools">
        <Button onClick={this.handleToggleGist} title="Gist integration" active={showGist}>
          <Octicon name="gist"/>
        </Button>
        <Button onClick={this.handleExport} title="Export to file">
          <Octicon name="cloud-download"/>
        </Button>
      </div>

      {this.state.showGist && <Gist {...this.props}/>}

      <div className="Ideas__buttons">
        <Button onClick={this.handleAddSection} title="Add section">
          <Octicon name="plus"/>
        </Button>
      </div>
      <div className="Ideas__general" key="general">
        <MarkdownArea name="general"
                      value={general}
                      onBlur={this.handleEditGeneral}
                      placeholder="[general]"/>
      </div>
      <div className="Ideas__sections" key="sections">
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
