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

// =========================================== contentEditable normalisation ===

// First line not wrapped with an opening block element (Chrome 40)
var initialBreaks = /^([^<]+)(?:<div[^>]*><br[^>]*><\/div><div[^>]*>|<p[^>]*><br[^>]*><\/p><p[^>]*>)/
var initialBreak = /^([^<]+)(?:<div[^>]*>|<p[^>]*>)/

var wrappedBreaks = /<p[^>]*><br[^>]*><\/p>|<div[^>]*><br[^>]*><\/div>/g
var openBreaks = /<(?:p|div)[^>]*>/g
var breaks = /<br[^>]*><\/(?:p|div)>|<br[^>]*>|<\/(?:p|div)>/g
var allTags = /<\/?[^>]+>\s*/g
var newlines = /\n/g

// Leading and trailing whitespace, <br>s & &nbsp;s
var trimWhitespace = /^(?:\s|&nbsp;|<br[^>]*>)*|(?:\s|&nbsp;|<br[^>]*>)*$/g

// IE11 displays 2 lines on initial display with the inner <br> present
var DEFAULT_CONTENTEDITABLE_HTML = 'ActiveXObject' in window ? '<div></div>' : '<div><br></div>'

/**
 * Normalises contentEditable innerHTML, stripping all tags except <br> and
 * trimming leading and trailing whitespace and causes of whitespace. The
 * resulting normalised HTML uses <br> for linebreaks.
 */
function normaliseContentEditableHTML(html, defaultHTML) {
  var html = html.replace(initialBreaks, '$1\n\n')
                 .replace(initialBreak, '$1\n')
                 .replace(wrappedBreaks, '\n')
                 .replace(openBreaks, '')
                 .replace(breaks, '\n')
                 .replace(allTags, '')
                 .replace(newlines, '<br>')
                 .replace(trimWhitespace, '')
  return html || defaultHTML || DEFAULT_CONTENTEDITABLE_HTML
}

// =================================================================== Store ===

// Section ids are re-assigned by index on load - we just need to ensure they're
// unique per session.
var ID_SEED = 0

var GENERAL_KEY = 'imd:general'
var SECTIONS_KEY = 'imd:sections'

var DEFAULT_SECTION = {section: '[section]', ideas: '[ideas]'}

function loadGeneral() {
  return localStorage.getItem(GENERAL_KEY) || '[general]'
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

var IdeasStore = {
  general: loadGeneral(),
  sections: loadSections(),

  get() {
    var {general, sections} = this
    return {general, sections}
  },

  editGeneral(general) {
    this.general = general
    saveGeneral(this.general)
    this.notifyChange()
  },

  addSection() {
    this.sections.unshift(assign({}, DEFAULT_SECTION, {id: ID_SEED++}))
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

  notifyChange() {
    console.warn('IdeasStore: no change listener registered!')
  }
}

// ============================================================== Components ===

var Ideas = React.createClass({
  getInitialState() {
    return IdeasStore.get()
  },

  componentDidMount() {
    IdeasStore.notifyChange = () => {
      this.setState(IdeasStore.get())
    }
  },

  _addSection(e) {
    IdeasStore.addSection()
  },

  _onGeneralBlur(e) {
    var general = normaliseContentEditableHTML(e.target.innerHTML)
    IdeasStore.editGeneral(general)
  },

  render() {
    return <div className="Ideas">
      <div
        className="Ideas__general contentEditable"
        contentEditable="true"
        dangerouslySetInnerHTML={{__html: this.state.general}}
        key="general"
        onBlur={this._onGeneralBlur}
        spellCheck="false"
      />
      <div className="Ideas__sections">
        <a className="Ideas__add circleButton"
           onClick={this._addSection}
           tabIndex="0"
           title="Add section">
          +
        </a>
        {this.state.sections.map((section, i) => <Section
          {...section}
          index={i}
          key={section.id}
          onChange={this._onSectionChange}
        />)}
      </div>
      <footer>ideas-md 0.1 | <a href="https://github.com/insin/ideas-md">insin/ideas-md</a></footer>
    </div>
  }
})

var Section = React.createClass({
  _onBlur(e) {
    var {target} = e
    var field = target.getAttribute('data-field')
    var value = normaliseContentEditableHTML(e.target.innerHTML)
    if (value != this.props[field]) {
      var {id, section, ideas} = this.props
      var section = {id, section, ideas}
      section[field] = value
      IdeasStore.editSection(section, this.props.index)
    }
  },

  _onTitleKeyDowm(e) {
    if (e.key == 'Enter') {
      e.preventDefault()
      e.target.blur()
    }
  },

  _onRemove(e) {
    IdeasStore.removeSection(this.props.index)
  },

  render() {
    return <div className="Section">
      <h2>
        <div
          className="Section__name contentEditable"
          contentEditable="true"
          dangerouslySetInnerHTML={{__html: this.props.section}}
          data-field="section"
          onBlur={this._onBlur}
          onKeyDown={this._onTitleKeyDowm}
          spellCheck="false"
        />
        <a className="Section__remove circleButton"
           onClick={this._onRemove}
           tabIndex="0"
           title="Remove section">
          &mdash;
        </a>
      </h2>
      <div
        className="Section__ideas contentEditable"
        contentEditable="true"
        dangerouslySetInnerHTML={{__html: this.props.ideas}}
        data-field="ideas"
        onBlur={this._onBlur}
        spellCheck="false"
      />
    </div>
  }
})

React.render(<Ideas/>, document.getElementById('app'))

}()