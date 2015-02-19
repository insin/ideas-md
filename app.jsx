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

// ========================================================= ContentEditable ===

var isIE = 'ActiveXObject' in window

// Chrome 40 not wrapping first line when wrapping with block elements
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
var DEFAULT_CONTENTEDITABLE_HTML = isIE ? '<div>&nbsp;</div>' : '<div><br></div>'

/**
 * Normalises contentEditable innerHTML, stripping all tags except <br> and
 * trimming leading and trailing whitespace and causes of whitespace. The
 * resulting normalised HTML uses <br> for linebreaks.
 */
function normaliseContentEditableHTML(html) {
  var html = html.replace(initialBreaks, '$1\n\n')
                 .replace(initialBreak, '$1\n')
                 .replace(wrappedBreaks, '\n')
                 .replace(openBreaks, '')
                 .replace(breaks, '\n')
                 .replace(allTags, '')
                 .replace(newlines, '<br>')
                 .replace(trimWhitespace, '')
  return html || DEFAULT_CONTENTEDITABLE_HTML
}

var ContentEditable = React.createClass({
  propTypes: {
    html: React.PropTypes.string.isRequired,

    className: React.PropTypes.string,
    component: React.PropTypes.any,
    onBlur: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    placeholder: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      component: 'div',
      placeholder: '',
      spellCheck: 'false'
    }
  },

  _onBlur(e) {
    var html = normaliseContentEditableHTML(e.target.innerHTML)
    this.props.onBlur(e, html)
  },

  _onInput(e) {
    var html = normaliseContentEditableHTML(e.target.innerHTML)
    this.props.onChange(e, html)
  },

  _onFocus(e) {
    var {target} = e
    var selecting = false
    var html = target.innerHTML
    if (isIE && html == DEFAULT_CONTENTEDITABLE_HTML ||
        this.props.placeholder && html == this.props.placeholder) {
      setTimeout(function() {
        var range
        if (window.getSelection && document.createRange) {
          range = document.createRange()
          range.selectNodeContents(target)
          var selection = window.getSelection()
          selection.removeAllRanges()
          selection.addRange(range)
        }
        else if (document.body.createTextRange) {
          range = document.body.createTextRange()
          range.moveToElementText(target)
          range.select()
        }
      }, 1)
      selecting = true
    }
    if (this.props.onFocus) {
      this.props.onFocus(e, selecting)
    }
  },

  _onKeyDown(e) {
    // Prevent the default contents from being deleted, which can make the
    // contentEditable unselectable.
    if (!isIE && (e.key == 'Backspace' || e.key == 'Delete') &&
        e.target.innerHTML == DEFAULT_CONTENTEDITABLE_HTML) {
      e.preventDefault()
    }
    if (this.props.onKeyDown) {
      this.props.onKeyDown(e)
    }
  },

  render() {
    var {
      html,
      className, component, onBlur, onChange, onFocus, onKeyDown, placeholder, spellCheck,
      ...props
    } = this.props
    return <this.props.component
      {...props}
      className={joinClassNames('ContentEditable', className)}
      contentEditable
      dangerouslySetInnerHTML={{__html: html}}
      onBlur={onBlur && this._onBlur}
      onInput={onChange && this._onInput}
      onFocus={(onFocus || placeholder) && this._onFocus}
      onKeyDown={this._onKeyDown}
      spellCheck={spellCheck}
    />
  }
})

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

  _onBlur(e, html) {
    IdeasStore.editGeneral(html)
  },

  render() {
    return <div className="Ideas">
      <ContentEditable
        className="Ideas__general"
        html={this.state.general}
        onBlur={this._onBlur}
        placeholder="[general]"
      />
      <div className="Ideas__sections">
        <Button className="Ideas__add"
                onClick={this._addSection}
                title="Add section">
          +
        </Button>
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
  _onBlur(e, html) {
    var field = e.target.getAttribute('data-field')
    if (html != this.props[field]) {
      var {id, section, ideas} = this.props
      var section = {id, section, ideas}
      section[field] = html
      IdeasStore.editSection(section, this.props.index)
    }
  },

  _onKeyDown(e) {
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
        <ContentEditable
          className="Section__name"
          data-field="section"
          html={this.props.section}
          onBlur={this._onBlur}
          onKeyDown={this._onKeyDown}
          placeholder="[section]"
        />
        <Button className="Section__remove"
                      onClick={this._onRemove}
                      title="Remove section">
          &mdash;
        </Button>
      </h2>
      <ContentEditable
        className="Section__ideas"
        contentEditable="true"
        data-field="ideas"
        html={this.props.ideas}
        onBlur={this._onBlur}
        placeholder="[ideas]"
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
    if (e.key == 'Enter' || e.key == 'Space') {
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