# Eldrum Engine

This is the main page for the Eldrum games' engine.

## Installation

```bash
yarn add @actnone/eldrum-engine
```

Configure metro to support `"exports"`:

```javascript
config.resolver.unstable_enablePackageExports = true
```

Make sure to install peer dependencies, as there's a lot of them.

### App config

Copy `app.config.ts` from this package to the game's root directory.

### Environment variables

For convenience, you can copy the `.env.example` from this package to `.env` and edit it to your needs.
