module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json'
          ],
          alias: {
            '~demo': './src'
          }
        }
      ],
      ['@realm/babel-plugin'],
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['react-native-reanimated/plugin'] // must be placed last
    ],
    env: {
      production: {
        plugins: ['transform-remove-console']
      }
    }
  }
}
