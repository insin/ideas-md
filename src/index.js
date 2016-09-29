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
var {render} = require('react-dom')
var {applyMiddleware, createStore} = require('redux')
var {Provider} = require('react-redux')
var thunkMiddleware = require('redux-thunk').default

var Ideas = require('./components/Ideas')
var reducer = require('./reducer')
var {loadState} = require('./utils')

var store = createStore(reducer, loadState(), applyMiddleware(thunkMiddleware))

render(
  <Provider store={store}>
    <Ideas/>
  </Provider>,
  document.getElementById('app')
)
