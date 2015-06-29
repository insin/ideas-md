var ActionType = require('./ActionType')

/**
 * Creates an action creator which just passes the given action type.
 */
var action = (type) => () => ({type})

/**
 * Creates an action creator which takes a single argument and adds it to the
 * action using the given property name.
 */
var argAction = (type, prop) => (arg) => ({[prop]: arg, type})

/**
 * Creates an action creator which takes an options object and adds the given
 * named properties from it to the action.
 */
var optionsAction = (type, ...props) =>
  (options) =>
    props.reduce((action, prop) => (action[prop] = options[prop], action), {type})

module.exports = {
  addSection: action(ActionType.ADD_SECTION),
  editGeneral: argAction(ActionType.EDIT_GENERAL, 'general'),
  editSection: optionsAction(ActionType.EDIT_SECTION, 'id', 'change'),
  importIdeas: argAction(ActionType.IMPORT_IDEAS, 'importState'),
  removeSection: argAction(ActionType.REMOVE_SECTION, 'id')
}
