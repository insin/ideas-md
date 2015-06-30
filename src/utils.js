function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = Math.random() * 16 | 0
    var v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function loadState() {
  var json = window.localStorage['imd']
  var defaultState = {
    exportFormat: 'hash',
    general: '',
    gist: '',
    loading: false,
    newSectionId: '',
    sections: [],
    token: '',
    updating: false
  }
  return json ? {...defaultState, ...JSON.parse(json)} : defaultState
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

module.exports = {
  uuid, loadState, storeState, exportFile
}
