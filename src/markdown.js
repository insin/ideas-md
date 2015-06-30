var {uuid} = require('./utils')

var UNDERLINE_HEADINGS_RE = /^([^\n]+)\n={2,}\n+/gm
var HASH_HEADINGS_RE = /^##([^#][^\n]*)/gm

function createMarkdown({general, sections, exportFormat}) {
  var parts = [general]
  sections.forEach(section => {
    var name = section.section
    if (exportFormat === 'hash') {
      parts.push(`## ${name}`)
    }
    else if (exportFormat === 'underline') {
      var underline = name.split(/./g).join('=')
      parts.push(`${name}\n${underline}`)
    }
    parts.push(section.ideas)
  })
  return parts.join('\n\n')
}

function parseMarkdown(markdown) {
  var parts
  var exportFormat = 'hash'
  if (HASH_HEADINGS_RE.test(markdown)) {
    parts = markdown.split(HASH_HEADINGS_RE)
  }
  else if (UNDERLINE_HEADINGS_RE.test(markdown)) {
    parts = markdown.split(UNDERLINE_HEADINGS_RE)
    exportFormat = 'underline'
  }
  else {
    parts = [markdown]
  }
  var general = parts[0].trim()
  var sections = []
  for (var i = 1; i < parts.length; i += 2) {
    var section = parts[i].trim()
    var ideas = parts[i + 1].trim()
    sections.push({id: uuid(), section, ideas})
  }
  return {general, sections, exportFormat}
}

module.exports = {
  createMarkdown, parseMarkdown
}
