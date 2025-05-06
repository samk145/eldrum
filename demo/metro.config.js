const path = require('path')
const { getSentryExpoConfig } = require('@sentry/react-native/metro')

const projectRoot = __dirname
const workspaceRoot = path.resolve(__dirname, '..')

const config = getSentryExpoConfig(__dirname)

// Add the workspace root to Metro's watch list
config.watchFolders = [workspaceRoot]

// Allow importing modules from the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
]

// (Optional) if you're importing raw source from a local package
config.resolver.extraNodeModules = {
  '@actnone/eldrum-engine': path.resolve(workspaceRoot, 'src')
}

module.exports = config
