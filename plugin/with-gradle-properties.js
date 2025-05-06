// See https://github.com/expo/expo/issues/30725

const { withGradleProperties } = require('@expo/config-plugins')

function withCustomGradleProperties(config) {
  return withGradleProperties(config, function (config) {
    /* Added gradle properties like this
      { type: 'property', key: 'key', value: 'value' } */
    const additionalGraddleProperties = [
      // SDK 52: https://github.com/expo/expo/issues/30725
      { type: 'property', key: 'android.enableJetifier', value: 'true' },
      {
        type: 'property',
        key: 'android.enablePngCrunchInReleaseBuilds',
        value: 'true'
      }
    ]

    additionalGraddleProperties.map(function (gradleProperty) {
      config.modResults.push(gradleProperty)
    })

    console.log(
      'eldrum:engine expo plugin withCustomGradleProperties applied:' +
        additionalGraddleProperties.map(property => `${property.key}=${property.value}`)
    )

    return config
  })
}

module.exports = withCustomGradleProperties
