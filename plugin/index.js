const withCustomAndroidStyles = require('./with-android-styles')
const withCustomGradleProperties = require('./with-gradle-properties')
const expoPlugins = require('@expo/config-plugins')

const withEldrumEngine = config => {
  return expoPlugins.withPlugins(config, [withCustomAndroidStyles, withCustomGradleProperties])
}

module.exports = withEldrumEngine
