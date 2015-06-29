var trim = (() => {
  var trimRE = /^\s+|\s+$/g
  return (text) => text ? text.replace(trimRE, '') : ''
})()

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = Math.random() * 16 | 0
    var v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function loadState() {
  var json = window.localStorage['imd']
  return json ? JSON.parse(json) : {
    exportFormat: 'hash',
    general: '',
    newSectionId: '',
    sections: []
  }
}

function storeState(state) {
  window.localStorage['imd'] = JSON.stringify(state)
}

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
    navigator.msSaveBlob(new window.Blob([text], {
      type: 'text/markdown;charset=utf-8;'
    }), filename)
  }
  else {
    window.location.href =
      'data:application/octet-stream;base64,' + base64
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
    window.alert('Could not find any headings with ## prefixes or == underlines.')
    return
  }
  var general = trim(parts[0])
  var sections = []
  for (var i = 1; i < parts.length; i += 2) {
    var section = trim(parts[i])
    var ideas = trim(parts[i + 1])
    sections.push({id: uuid(), section, ideas})
  }
  return {general, sections, exportFormat}
}

function createFileContents(general, sections, style) {
  var parts = [general]
  sections.forEach(section => {
    var name = section.section
    if (style === 'hash') {
      parts.push(`## ${name}`)
    }
    else if (style === 'underline') {
      var underline = name.split(/./g).join('=')
      parts.push(`${name}\n${underline}`)
    }
    parts.push(section.ideas)
  })
  return parts.join('\n\n')
}

module.exports = {
  trim, uuid, loadState, storeState, exportFile, parseFileContents, createFileContents
}
