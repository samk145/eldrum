import { addTranslations, addTranslationsWithNamespaces } from '@actnone/eldrum-engine/i18n'
import { locales as demoUserInterfaceTranslations } from './locale'
import contentLocales from '../data/locale'

addTranslations(demoUserInterfaceTranslations)
addTranslationsWithNamespaces(contentLocales)
