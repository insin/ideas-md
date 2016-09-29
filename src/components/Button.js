require('./Button.css')

var React = require('react')

var Button = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    active: React.PropTypes.bool,
    className: React.PropTypes.string,
    tabIndex: React.PropTypes.string
  },
  getDefaultProps() {
    return {
      active: false,
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
    var {active, className, onClick, tabIndex, ...props} = this.props // eslint-disable-line no-unused-vars
    var classNames = ['Button']
    if (active) classNames.push('Button--active')
    if (className) classNames.push(className)
    return <span className={classNames.join(' ')}
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
