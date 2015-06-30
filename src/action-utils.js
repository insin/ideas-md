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

module.exports = {action, argAction, optionsAction}
