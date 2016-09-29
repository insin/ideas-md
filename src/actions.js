var types = require('./types')
var {parseMarkdown} = require('./markdown')

function importMarkdown(markdown) {
  return {type: types.IMPORT, importState: parseMarkdown(markdown)}
}

function getHeaders(token) {
  if (!token) return new window.Headers()
  return new window.Headers({
    'Authorization': `token ${token}`
  })
}

function importGist() {
  return (dispatch, getState) => {
    dispatch({type: types.LOADING_GIST})
    var {gist, token} = getState()
    window.fetch(`https://api.github.com/gists/${gist}`, {
      method: 'GET',
      headers: getHeaders(token)
    })
    .then(responseJSON)
    .then(processGist.bind(null, dispatch))
    .catch(err => {
      console.error(err)
      window.alert(`Error loading Gist: ${err.message}`)
      dispatch({type: types.LOADING_GIST_FAILURE})
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
      dispatch({type: types.LOADING_GIST_SUCCESS})
      dispatch(importMarkdown(file.content))
    }
    else {
      window.alert("The Gist didn't contain an IDEAS.md file.")
      dispatch({type: types.LOADING_GIST_FAILURE})
    }
  }
}

function updateGist(markdown) {
  return (dispatch, getState) => {
    dispatch({type: types.UPDATING_GIST})
    var {gist, token} = getState()
    window.fetch(`https://api.github.com/gists/${gist}`, {
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
      dispatch({type: types.UPDATING_GIST_SUCCESS})
    })
    .catch(err => {
      console.error(err)
      window.alert(`Error updating Gist: ${err.message}`)
      dispatch({type: types.UPDATING_GIST_FAILURE})
    })
  }
}

module.exports = {
  importGist,
  importMarkdown,
  updateGist,
  addSection: () => ({type: types.ADD_SECTION}),
  editGeneral: (general) => ({type: types.EDIT_GENERAL, general}),
  editGist: (gist) => ({type: types.EDIT_GIST, gist}),
  editSection: ({id, change}) => ({type: types.EDIT_SECTION, id, change}),
  editToken: (token) => ({type: types.EDIT_TOKEN, token}),
  removeSection: (id) => ({type: types.REMOVE_SECTION, id})
}
