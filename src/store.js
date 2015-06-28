var {uuid} = require('./utils')

var GENERAL_KEY = 'imd:general'
var SECTIONS_KEY = 'imd:sections'
var EXPORT_FORMAT_KEY = 'imd:export'

var DEFAULT_SECTION = {section: '', ideas: ''}

function loadGeneral() {
  return window.localStorage.getItem(GENERAL_KEY)
}

function saveGeneral(general) {
  window.localStorage.setItem(GENERAL_KEY, general)
}

function loadSections() {
  var json = window.localStorage.getItem(SECTIONS_KEY)
  var sections = json ? JSON.parse(json) : [{...DEFAULT_SECTION}]
  return sections
}

function saveSections(sections) {
  window.localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections))
}

function loadExportFormat() {
  return window.localStorage.getItem(EXPORT_FORMAT_KEY) || 'hash'
}

function saveExportFormat(exportFormat) {
  window.localStorage.setItem(EXPORT_FORMAT_KEY, exportFormat)
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
      section.id = uuid()
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
    this.newSectionId = uuid()
    this.sections.unshift({...DEFAULT_SECTION, id: this.newSectionId})
    saveSections(this.sections)
    this.notifyChange()
  },

  editSection(change, index) {
    var section = this.sections[index]
    this.sections.splice(index, 1)
    this.sections.unshift({...section, ...change})
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

module.exports = IdeasStore
