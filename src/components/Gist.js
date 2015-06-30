require('./Gist.css')

var React = require('react')

var Button = require('./Button')
var Octicon = require('./Octicon')
var {createMarkdown} = require('../markdown')

var Gist = React.createClass({
  handleEditGist(e) {
    this.props.actions.editGist(e.target.value)
  },
  handleEditToken(e) {
    this.props.actions.editToken(e.target.value)
  },
  handleImportGist() {
    this.props.actions.importGist()
  },
  handleUpdateGist(e) {
    this.props.actions.updateGist(createMarkdown(this.props))
  },

  render() {
    var {actions, gist, loading, updating, token} = this.props
    return <div className="Gist">
      <div className="Gist__buttons">
        {gist && <Button onClick={this.handleImportGist} title="Sync with Gist" active={loading}>
          <Octicon name="sync" spin={loading}/>
        </Button>}
        {gist && token && <Button onClick={this.handleUpdateGist} title="Save to Gist" active={updating}>
          <Octicon name="cloud-upload" spin={updating}/>
        </Button>}
      </div>
      <div className="Gist__inputs">
        <p>
          <label>
            Gist ID: <input value={gist}
                            disabled={loading}
                            onChange={this.handleEditGist}
                            size="20"/>
          </label>
        </p>
        <p>
          <label>
            GitHub Access Token: <input value={token}
                                        disabled={loading}
                                        onChange={this.handleEditToken}
                                        size="40"/>
          </label>
          {!token && <span>
            &nbsp;
            <a href="https://github.com/settings/tokens/new" target="_blank">
              generate token
            </a>
          </span>}
        </p>
        {loading && <p>Syncing with Gist&hellip;</p>}
        {updating && <p>Updating Gist&hellip;</p>}
      </div>
    </div>
  }
})

module.exports = Gist
