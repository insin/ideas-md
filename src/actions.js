var ActionType = require('./ActionType')
var {action, argAction, optionsAction} = require('./action-utils')
var {parseMarkdown} = require('./markdown')

function importMarkdown(markdown) {
  return {type: ActionType.IMPORT, importState: parseMarkdown(markdown)}
}

function getHeaders(token) {
  if (!token) return new window.Headers()
  return new window.Headers({
    'Authorization': `token ${token}`
  })
}

function importGist() {
  return (dispatch, getState) => {
    dispatch({type: ActionType.LOADING_GIST})
    var {gist, token} = getState()
    var headers =
    fetch(`https://api.github.com/gists/${gist}`, {
      method: 'GET',
      headers: getHeaders(token)
    })
    .then(responseJSON)
    .then(processGist.bind(null, dispatch))
    .catch(err => {
      console.error(err)
      window.alert(`Error loading Gist: ${err.message}`)
      dispatch({type: ActionType.LOADING_GIST_FAILURE})
    })
  }

  function responseJSON(res) {
    if (res.status >= 200 && res.status < 300) {
      return res.json()
    }
    return Promise.reject(new Error(res.statusText))
  }

  function processGist(dispatch, gist) {
    var file = gist.files['IDEAS.md']
    if (file) {
      dispatch({type: ActionType.LOADING_GIST_SUCCESS})
      dispatch(importMarkdown(file.content))
    }
    else {
      window.alert("The Gist didn't contain an IDEAS.md file.")
      dispatch({type: ActionType.LOADING_GIST_FAILURE})
    }
  }
}

function updateGist(markdown) {
  return (dispatch, getState) => {
    dispatch({type: ActionType.UPDATING_GIST})
    var {gist, token} = getState()
    fetch(`https://api.github.com/gists/${gist}`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({
        files: {
          'IDEAS.md': {
            content: markdown
          }
        }
      })
    })
    .then(res => {
      console.info(res)
      if (!(res.status >= 200 && res.status < 300)) {
        return Promise.reject(new Error(res.statusText))
      }
      dispatch({type: ActionType.UPDATING_GIST_SUCCESS})
    })
    .catch(err => {
      console.error(err)
      window.alert(`Error updating Gist: ${err.message}`)
      dispatch({type: ActionType.UPDATING_GIST_FAILURE})
    })
  }
}

module.exports = {
  importGist,
  importMarkdown,
  updateGist,
  addSection: action(ActionType.ADD_SECTION),
  editGeneral: argAction(ActionType.EDIT_GENERAL, 'general'),
  editGist: argAction(ActionType.EDIT_GIST, 'gist'),
  editSection: optionsAction(ActionType.EDIT_SECTION, 'id', 'change'),
  editToken: argAction(ActionType.EDIT_TOKEN, 'token'),
  removeSection: argAction(ActionType.REMOVE_SECTION, 'id')
}
