var pkg = require('./package.json')

module.exports = {
  webpack: {
    define: {
      'VERSION': JSON.stringify(pkg.version)
    }
  }
}
