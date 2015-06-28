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
var Ideas = require('./components/Ideas')

React.render(<Ideas/>, document.getElementById('app'))
