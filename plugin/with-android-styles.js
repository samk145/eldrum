const { AndroidConfig, withAndroidStyles } = require('@expo/config-plugins')

/**
 * @param {import('@expo/config-types').ExpoConfig} expoConfig
 * @returns {import('@expo/config-plugins').ConfigPlugin}
 */
const withCustomAndroidStyles = expoConfig =>
  withAndroidStyles(expoConfig, async config => {
    config.modResults = AndroidConfig.Styles.assignStylesValue(config.modResults, {
      add: true,
      value: 'false',
      targetApi: 'q',
      name: 'android:forceDarkAllowed',
      parent: {
        name: 'AppTheme',
        parent: 'Theme.AppCompat.Light.NoActionBar'
      }
    })

    console.log(
      'eldrum:engine expo plugin withCustomAndroidStyles applied: forceDarkAllowed set to false in AppTheme'
    )

    return config
  })

module.exports = withCustomAndroidStyles
