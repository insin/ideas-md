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
      <PlainEditable
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
      <footer>ideas-md 0.2 | <a href="https://github.com/insin/ideas-md">insin/ideas-md</a></footer>
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
        <PlainEditable
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
      <PlainEditable
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