require('es6-promise').polyfill()
require('whatwg-fetch')

require('codemirror/lib/codemirror.css')
require('codemirror/theme/monokai.css')
require('./app.css')

require('codemirror')
require('codemirror/addon/display/placeholder')
require('codemirror/addon/mode/overlay')
require('codemirror/mode/xml/xml')
require('codemirror/mode/javascript/javascript')
require('codemirror/mode/markdown/markdown')
require('codemirror/mode/gfm/gfm')

var React = require('react')
var {applyMiddleware, bindActionCreators, createStore} = require('redux')
var {Connector, Provider} = require('react-redux')
var thunkMiddleware = require('redux-thunk')

var Ideas = require('./components/Ideas')
var actions = require('./actions')
var reducer = require('./reducer')
var {loadState} = require('./utils')

var store = applyMiddleware(thunkMiddleware)(createStore)(reducer, loadState())

var select = state => state

var renderApp = ({dispatch, ...state}) =>
  <Ideas {...state} actions={bindActionCreators(actions, dispatch)}/>

var renderConnector = () =>
  <Connector select={select}>{renderApp}</Connector>

React.render(
  <Provider store={store}>{renderConnector}</Provider>,
  document.getElementById('app')
)
