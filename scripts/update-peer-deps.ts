import fs from 'fs'
import path from 'path'
import { globby } from 'globby'
import ts from 'typescript'

const root = path.resolve(__dirname, '..')
const pkgPath = path.join(root, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

const WHITELIST = ['expo', 'react-native', 'i18next']

async function getImportedPackages(): Promise<string[]> {
  const files = await globby(['src/**/*.{ts,tsx,js,jsx}'], { cwd: root })
  const imported = new Set<string>()

  for (const file of files) {
    const content = fs.readFileSync(path.join(root, file), 'utf-8')
    const source = ts.createSourceFile(file, content, ts.ScriptTarget.ESNext, true)
    ts.forEachChild(source, node => {
      if (ts.isImportDeclaration(node)) {
        const module = node.moduleSpecifier.getText().replace(/['"]/g, '')
        if (!module.startsWith('.') && !module.startsWith('@actnone')) {
          const basePkg = module.startsWith('@')
            ? module.split('/').slice(0, 2).join('/')
            : module.split('/')[0]

          if (WHITELIST.some(prefix => basePkg.includes(prefix))) {
            imported.add(basePkg)
          }
        }
      }
    })
  }

  return [...imported].sort()
}

function cleanVersion(version: string): string {
  return version.replace(/^[\^~]/, '')
}

;(async () => {
  const importedPackages = await getImportedPackages()

  pkg.peerDependencies = pkg.peerDependencies || {}

  const updatedPeers: Record<string, string> = {}

  for (const dep of importedPackages) {
    let version: string | undefined

    try {
      const resolvedPath = require.resolve(`${dep}/package.json`, { paths: [root] })
      const installedVersion = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8')).version
      version = installedVersion
      console.log(`📦 Found ${dep}@${installedVersion}`)
    } catch (err) {
      console.warn(`⚠️ Could not resolve ${dep} via require.resolve`)

      // Fallback: Try from dependencies or devDependencies
      const fallbackVersion = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]

      if (fallbackVersion) {
        version = cleanVersion(fallbackVersion)
        console.log(`📦 Fallback version from deps: ${dep}@${version}`)
      } else {
        console.warn(`⚠️ No version found for ${dep}, using fallback '*'`)
        version = '*'
      }
    }

    updatedPeers[dep] = `^${version}`
  }

  pkg.peerDependencies = updatedPeers

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
  console.log('✅ package.json peerDependencies updated.')
})()
