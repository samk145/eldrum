import { createInstance, type i18n as Ii18n } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { locales } from './locale'

export const USER_INTERFACE_NAMESPACE = 'user-interface'

const i18n: Ii18n = createInstance()

i18n.use(initReactI18next).init({
  resources: locales,
  ns: [
    USER_INTERFACE_NAMESPACE,
    'achievements',
    'endings',
    'factions',
    'items',
    'npcs',
    'push-notifications',
    'quests',
    'scenes',
    'scriptures',
    'world'
  ],
  lng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export const addTranslations = (translations: Record<string, Record<string, string>>) => {
  for (const key in translations) {
    i18n.addResourceBundle(key, USER_INTERFACE_NAMESPACE, translations[key])
  }
}

export const addTranslationsWithNamespaces = (
  translations: Record<string, Record<string, Record<string, string>>>
) => {
  for (const localeKey in translations) {
    const contentLocale = translations[localeKey]

    for (const namespace in contentLocale) {
      i18n.addResourceBundle(localeKey, namespace, contentLocale[namespace])
    }
  }
}

export const setSupportedLanguages = (languages: string[]) => {
  i18n.options.supportedLngs = languages
}

const t = i18n.t

export { i18n, t }
