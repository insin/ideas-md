var update = require('react-addons-update')

var types = require('./types')
var {uuid} = require('./utils')

function findSectionIndex(sections, sectionId) {
  for (var i = 0, l = sections.length; i < l; i++) {
    if (sections[i].id === sectionId) return i
  }
  throw new Error(`Unknown section id: ${sectionId}`)
}

function reduce(state, action) {
  switch (action.type) {
    case types.ADD_SECTION:
      var newSectionId = uuid()
      return update(state, {
        newSectionId: {$set: newSectionId},
        sections: {$unshift: [{id: newSectionId, section: '', ideas: ''}]}
      })
    case types.EDIT_GENERAL:
      return {...state, general: action.general}
    case types.EDIT_GIST:
      return {...state, gist: action.gist}
    case types.EDIT_SECTION:
      var sectionIndex = findSectionIndex(state.sections, action.id)
      var section = {...state.sections[sectionIndex], ...action.change}
      // Move the edited section to the head of the sections list
      return update(state, {
        sections: {$splice: [[sectionIndex, 1], [0, 0, section]]}
      })
    case types.EDIT_TOKEN:
      return {...state, token: action.token}
    case types.IMPORT:
      return {...state, ...action.importState}
    case types.LOADING_GIST:
      return {...state, loading: true}
    case types.LOADING_GIST_FAILURE:
      return {...state, loading: false}
    case types.LOADING_GIST_SUCCESS:
      return {...state, loading: false, lastSuccessfulGist: state.gist}
    case types.REMOVE_SECTION:
      return update(state, {
        sections: {$splice: [[findSectionIndex(state.sections, action.id), 1]]}
      })
    case types.UPDATING_GIST:
      return {...state, updating: true}
    case types.UPDATING_GIST_FAILURE:
    case types.UPDATING_GIST_SUCCESS:
      return {...state, updating: false}
  }
  return state
}

module.exports = reduce
