var update = require('react/lib/update')

var ActionType = require('./ActionType')
var {uuid} = require('./utils')

function findSectionIndex(sections, sectionId) {
  for (var i = 0, l = sections.length; i < l ; i++) {
    if (sections[i].id === sectionId) return i
  }
  throw new Error(`Unknown section id: ${sectionId}`)
}

function reduce(state, action) {
  switch (action.type) {
    case ActionType.ADD_SECTION:
      var newSectionId = uuid()
      return update(state, {
        newSectionId: {$set: newSectionId},
        sections: {$unshift: [{id: newSectionId, section: '', ideas: ''}]}
      })
    case ActionType.EDIT_GENERAL:
      return {...state, general: action.general}
    case ActionType.EDIT_SECTION:
      var sectionIndex = findSectionIndex(state.sections, action.id)
      var section = {...state.sections[sectionIndex], ...action.change}
      return update(state, {
        sections: {$splice: [[sectionIndex, 1], [0, 0, section]]}
      })
    case ActionType.IMPORT_IDEAS:
      return {...state, ...action.importState}
    case ActionType.REMOVE_SECTION:
      return update(state, {
        sections: {$splice: [[findSectionIndex(state.sections, action.id), 1]]}
      })
  }
  return state
}

module.exports = reduce
