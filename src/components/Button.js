require('./Button.css')

var React = require('react')

var Button = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    className: React.PropTypes.string,
    tabIndex: React.PropTypes.string
  },
  getDefaultProps() {
    return {
      tabIndex: '0'
    }
  },
  handleClick(e) {
    this.props.onClick(e)
  },
  handleKeyPress(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      this.props.onClick(e)
    }
  },
  render() {
    var {onClick, className, tabIndex, ...props} = this.props
    return <span className={`Button ${className}`}
                 onClick={this.handleClick}
                 onKeyPress={this.handleKeyPress}
                 role="button"
                 tabIndex={tabIndex}
                 {...props}>
      {this.props.children}
    </span>
  }
})

module.exports = Button
