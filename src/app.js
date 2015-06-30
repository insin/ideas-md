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
var {bindActionCreators, createDispatcher, createRedux} = require('redux')
var {Connector, Provider} = require('redux/react')
var thunkMiddleware = require('redux/lib/middleware/thunk')

var Ideas = require('./components/Ideas')
var ideasActions = require('./actions')
var ideasStore = require('./store')
var {loadState} = require('./utils')

var dispatcher = createDispatcher(
  ideasStore,
  getState => [thunkMiddleware(getState)]
)
var redux = createRedux(dispatcher, loadState())

var select = state => state

var renderApp = ({dispatch, ...state}) =>
  <Ideas {...state} actions={bindActionCreators(ideasActions, dispatch)}/>

var renderConnector = () =>
  <Connector select={select}>{renderApp}</Connector>

React.render(
  <Provider redux={redux}>{renderConnector}</Provider>,
  document.getElementById('app')
)
