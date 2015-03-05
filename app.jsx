void function() { 'use strict';

var hasOwn = Object.prototype.hasOwnProperty

function assign(dest) {
  for (var i = 1, l = arguments.length; i < l; i++) {
    if (!arguments[i]) {
      continue
    }
    var src = arguments[i]
    for (var prop in src) {
      if (hasOwn.call(src, prop)) {
        dest[prop] = src[prop]
      }
    }
  }
  return dest
}

function joinClassNames() {
  var classNames = []
  for (var i = 0, l = arguments.length; i < l; i++) {
    if (arguments[i]) {
      classNames.push(arguments[i])
    }
  }
  return classNames.join(' ')
}

var trim = (() => {
  var trimRE = /^\s+|\s+$/g
  return (text) => text ? text.replace(trimRE, '') : ''
})()

function utf8ToBase64(text) {
  return window.btoa(unescape(encodeURIComponent(text)))
}

function exportFile(text, filename) {
  var a = document.createElement('a')
  var base64 = utf8ToBase64(text)

  if ('download' in a) {
    a.href = 'data:text/markdown;base64,' + base64
    a.download = filename
    var event = document.createEvent('MouseEvents')
    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0,
                         false, false, false, false, 0, null)
    a.dispatchEvent(event)
  }
  else if (typeof navigator.msSaveBlob == 'function') {
    navigator.msSaveBlob(new Blob([text], {
      type: 'text/markdown;charset=utf-8;'
    }), filename)
  }
  else {
    window.location.href =
      'data:application/octet-stream;base64,' + base64
  }
}

// Inlining https://github.com/andreypopp/react-textarea-autosize v1.1.0 as
// there isn't a global build available.
var Textarea = React.createClass({
  render: function() {
    var props = assign({}, this.props, {
      onChange: this.onChange,
      style: assign({}, this.props.style, {overflow: 'hidden'})
    });

    return React.DOM.textarea(props, this.props.children);
  },

  componentDidMount: function() {
    this.recalculateSize();
    window.addEventListener('resize', this.recalculateSize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.recalculateSize);
  },

  componentDidUpdate: function(prevProps) {
    if (
      prevProps.style ||
      prevProps.value !== this.props.value ||
      // We need to call `recalculateSize()` if component is used in
      // uncontrolled mode because the `<textarea />` will re-render itself in
      // that case.
      //
      // We check for `== null` to cover both `null` and `undefined`, this is
      // what React does to check if component is used in uncontrolled mode.
      this.props.value == null
    ) {
      this.recalculateSize();
    }
  },

  onChange: function(e) {
    if (this.props.onChange) {
      this.props.onChange(e);
    }
    if (this.props.value === undefined) {
      // controlled mode
      this.recalculateSize();
    }
  },

  recalculateSize: function() {
    var diff;
    var node = this.getDOMNode();

    if (window.getComputedStyle) {
      var styles = window.getComputedStyle(node);

      // If the textarea is set to border-box, it's not necessary to
      // subtract the padding.
      if (styles.getPropertyValue('box-sizing') === "border-box" ||
          styles.getPropertyValue('-moz-box-sizing') === "border-box" ||
          styles.getPropertyValue('-webkit-box-sizing') === "border-box") {
        diff = 0;
      } else {
        diff = (
          parseInt(styles.getPropertyValue('padding-bottom') || 0, 10) +
          parseInt(styles.getPropertyValue('padding-top') || 0, 10)
        );
      }
    } else {
      diff = 0;
    }

    var node = this.getDOMNode();
    node.style.height = 'auto';
    node.style.height = (node.scrollHeight - diff) + 'px';
  }
});

// =================================================================== Store ===

// Section ids are re-assigned by index on load - we just need to ensure they're
// unique per session.
var ID_SEED = 0

var GENERAL_KEY = 'imd:general'
var SECTIONS_KEY = 'imd:sections'
var EXPORT_FORMAT_KEY = 'imd:export'

var DEFAULT_SECTION = {section: '', ideas: ''}

function loadGeneral() {
  return localStorage.getItem(GENERAL_KEY)
}

function saveGeneral(general) {
  localStorage.setItem(GENERAL_KEY, general)
}

function loadSections() {
  var json = localStorage.getItem(SECTIONS_KEY)
  var sections = json ? JSON.parse(json) : [assign({}, DEFAULT_SECTION)]
  sections.forEach((section, i) => { section.id = i + 1 })
  ID_SEED = sections.length + 1
  return sections
}

function saveSections(sections) {
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections))
}

function loadExportFormat() {
  return localStorage.getItem(EXPORT_FORMAT_KEY) || 'hash'
}

function saveExportFormat(exportFormat) {
  localStorage.setItem(EXPORT_FORMAT_KEY, exportFormat)
}

var IdeasStore = {
  general: loadGeneral(),
  sections: loadSections(),
  exportFormat: loadExportFormat(),
  newSectionId: null,

  get() {
    var {general, sections, exportFormat, newSectionId} = this
    return {general, sections, exportFormat, newSectionId}
  },

  import(state) {
    this.general = state.general
    this.sections = state.sections.map(section => {
      section.id = ID_SEED++
      return section
    })
    this.exportFormat = state.exportFormat
    saveGeneral(this.general)
    saveSections(this.sections)
    saveExportFormat(this.exportFormat)
    this.notifyChange()
  },

  editGeneral(general) {
    this.general = general
    saveGeneral(this.general)
    this.notifyChange()
  },

  addSection() {
    this.newSectionId = ID_SEED++
    this.sections.unshift(assign({}, DEFAULT_SECTION, {id: this.newSectionId}))
    saveSections(this.sections)
    this.notifyChange()
  },

  editSection(section, index) {
    this.sections.splice(index, 1)
    this.sections.unshift(section)
    saveSections(this.sections)
    this.notifyChange()
  },

  removeSection(index) {
    this.sections.splice(index, 1)
    saveSections(this.sections)
    this.notifyChange()
  },

  editExportFormat(exportFormat) {
    this.exportFormat = exportFormat
    saveExportFormat(this.exportFormat)
    this.notifyChange()
  },

  notifyChange() {
    console.warn('IdeasStore: no change listener registered!')
  }
}

var underlineHeadingsRE = /^([^\n]+)\n={2,}\n+/gm
var hashHeadingsRE = /^##([^#][^\n]*)/gm

function parseFileContents(text) {
  var parts
  var exportFormat
  if (hashHeadingsRE.test(text)) {
    parts = text.split(hashHeadingsRE)
    exportFormat = 'hash'
  }
  else if (underlineHeadingsRE.test(text)) {
    parts = text.split(underlineHeadingsRE)
    exportFormat = 'underline'
  }
  else {
    alert('Could not find any headings with ## prefixes or == underlines.')
    return
  }
  var general = trim(parts[0])
  var sections = []
  for (var i = 1; i < parts.length; i += 2) {
    var section = trim(parts[i])
    var ideas = trim(parts[i + 1])
    sections.push({section, ideas})
  }
  return {general, sections, exportFormat}
}

function createFileContents(general, sections, style) {
  var parts = [general]
  sections.forEach(section => {
    var name = section.section
    if (style == 'hash') {
      parts.push(`## ${name}`)
    }
    else if (style == 'underline') {
      var underline = name.split(/./g).join('=')
      parts.push(`${name}\n${underline}`)
    }
    parts.push(section.ideas)
  })
  return parts.join('\n\n')
}

// ============================================================== Components ===

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
      document.addEventListener('dragover', this._onDragOver)
      document.addEventListener('drop', this._onDrop)
    }
  },

  componentWillUnmount() {
    if (hasFileReader) {
      document.removeEventListener('dragover', this._onDragOver)
      document.removeEventListener('drop', this._onDrop)
    }
  },

  _addSection(e) {
    IdeasStore.addSection()
  },

  _export(e) {
    var {general, sections, exportFormat} = this.state
    var contents = createFileContents(general, sections, exportFormat)
    exportFile(contents, 'IDEAS.md')
  },

  _onBlur(e) {
    IdeasStore.editGeneral(e.target.value)
  },

  _onDragOver(e) {
    e.preventDefault()
  },

  _onDrop(e) {
    e.preventDefault()

    if (!e.dataTransfer.files || !e.dataTransfer.files[0]) {
      return
    }

    var reader = new FileReader()
    reader.onload = (e) => {
      var text = e.target.result
      var state = parseFileContents(text)
      IdeasStore.import(state)
    }
    reader.readAsText(e.dataTransfer.files[0])
  },

  render() {
    return <div className="Ideas">
      <div className="Ideas__buttons">
        <Button onClick={this._addSection} title="Add section">+</Button>
        <Button onClick={this._export} title="Export to file">↓</Button>
      </div>
      <div className="Ideas__general">
        <Textarea
          defaultValue={this.state.general}
          onBlur={this._onBlur}
          placeholder="[general]"
          rows="1"
          spellCheck="false"
        />
      </div>
      <div className="Ideas__sections">
        {this.state.sections.map((section, i) => <Section
          {...section}
          index={i}
          isNew={section.id == this.state.newSectionId}
          key={section.id}
          onChange={this._onSectionChange}
        />)}
      </div>
      <footer>ideas-md 0.6 | <a href="https://github.com/insin/ideas-md">insin/ideas-md</a></footer>
    </div>
  }
})

var Section = React.createClass({
  _onBlur(e) {
    var {name, value} = e.target
    if (value != this.props[name]) {
      var {id, section, ideas} = this.props
      var section = {id, section, ideas}
      section[name] = value
      IdeasStore.editSection(section, this.props.index)
    }
  },

  _onRemove(e) {
    if (confirm(`Delete ${this.props.section}?`)) {
      IdeasStore.removeSection(this.props.index)
    }
  },

  render() {
    return <div className="Section">
      <h2>
        <Button className="Section__remove"
                      onClick={this._onRemove}
                      title="Remove section">
          &ndash;
        </Button>
        <input
          autoFocus={this.props.isNew}
          className="Section__name"
          defaultValue={this.props.section}
          name="section"
          onBlur={this._onBlur}
          placeholder="[section]"
          spellCheck="false"
          type="text"
        />
      </h2>
      <Textarea
        className="Section__ideas"
        defaultValue={this.props.ideas}
        name="ideas"
        onBlur={this._onBlur}
        placeholder="[ideas]"
        rows="1"
        spellCheck="false"
      />
    </div>
  }
})

var Button = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired,

    className: React.PropTypes.string,
    tabIndex: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      tabIndex: '0'
    }
  },

  _onClick(e) {
    this.props.onClick(e)
  },

  _onKeyPress(e) {
    if (e.key == 'Enter' || e.key == ' ') {
      this.props.onClick(e)
    }
  },

  render() {
    var {
      onClick,
      className, tabIndex,
      ...props
    } = this.props
    return <span className={joinClassNames('Button', className)}
                 onClick={this._onClick}
                 onKeyPress={this._onKeyPress}
                 role="button"
                 tabIndex={tabIndex}
                 {...props}>
      {this.props.children}
    </span>
  }
})

React.render(<Ideas/>, document.getElementById('app'))

}()