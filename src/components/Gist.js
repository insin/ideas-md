require('./Gist.css')

var React = require('react')
var Octicon = require('react-octicon')

var Button = require('./Button')
var {createMarkdown} = require('../markdown')

var GIST_URL_RE = /^(?:https?:\/\/)?gist\.github\.com\/(?:[^/]+\/)?([^/]+)(?:\/|$)/

var Gist = React.createClass({
  handleEditGist(e) {
    var gist = e.target.value
    var match = GIST_URL_RE.exec(gist)
    if (match) {
      gist = match[1]
    }
    this.props.actions.editGist(gist)
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
    var {actions, gist, lastSuccessfulGist, loading, updating, token} = this.props
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
        <h2>Gist integration</h2>
        {!gist && !token && <span className="Gist__help">
          Load ideas from an IDEAS.md formatted Markdown file stored in
          GitHub's <a href="https://gist.github.com/" target="_blank">Gist</a> snippet
          sharing service
        </span>}
        <p key="gist">
          <label>
            Gist ID: <input value={gist}
                            disabled={loading}
                            onChange={this.handleEditGist}
                            size="20"/>
          </label>
          {gist && <span>
            &nbsp;
            <a href={`https://gist.github.com/${gist}`} target="_blank">
              view
            </a>
          </span>}
          {!gist && <span className="Gist__help">
            Paste a Gist URL or ID &mdash; e.g. https://gist.github.com/insin/98eed17905bcb6a65bf0
          </span>}
        </p>
        {(!!token || gist === lastSuccessfulGist) && <p key="token">
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
          {!token && <span className="Gist__help">
            A personal access token with Gist permissions allows you to save
            your ideas back to your own Gists
          </span>}
        </p>}
        {loading && <p>Syncing with Gist&hellip;</p>}
        {updating && <p>Updating Gist&hellip;</p>}
      </div>
    </div>
  }
})

module.exports = Gist
