import type {
  EditorArea,
  EditorLocation,
  EditorLootTable,
  EditorMedia,
  TEditorNpc,
  EditorNpcTemplate,
  EditorPath,
  EditorQuest,
  EditorScene,
  EditorScripture,
  EditorSettings,
  EditorVariable,
  EditorItem,
  EditorTest,
  EditorTestTask,
  EditorAchievement
} from '@actnone/eldrum-editor/dist/types'
import type { Config } from '../config'
import type { AVPlaybackSource } from 'expo-av'
import type { ImageSource } from 'expo-image'
import { Dimensions, PixelRatio } from 'react-native'
import { logger } from '../helpers/logger'
import { i18n, setSupportedLanguages } from '../i18n'

const REMOTE_IMAGE_MAX_WIDTH = PixelRatio.getPixelSizeForLayoutSize(Dimensions.get('screen').width)

const resourceTypes = [
  'achievements',
  'areas',
  'items',
  'locations',
  'lootTables',
  'media',
  'npcs',
  'npcTemplates',
  'paths',
  'quests',
  'scenes',
  'scriptures',
  'settings',
  'variables',
  'tests',
  'testTasks'
] as const

export type TResources = {
  achievements: EditorAchievement[]
  areas: EditorArea[]
  items: EditorItem[]
  locations: EditorLocation[]
  lootTables: EditorLootTable[]
  media: EditorMedia[]
  npcs: TEditorNpc[]
  npcTemplates: EditorNpcTemplate[]
  paths: EditorPath[]
  quests: EditorQuest[]
  scenes: EditorScene[]
  scriptures: EditorScripture[]
  settings: EditorSettings
  variables: EditorVariable[]
  tests: EditorTest[]
  testTasks: EditorTestTask[]
}

export type TResource =
  | EditorArea
  | EditorItem
  | EditorLocation
  | EditorLootTable
  | EditorMedia
  | TEditorNpc
  | EditorNpcTemplate
  | EditorPath
  | EditorQuest
  | EditorScene
  | EditorScripture
  | EditorSettings
  | EditorVariable
  | EditorTest
  | EditorTestTask

export type TResourceType = (typeof resourceTypes)[number]
export type TGameResources = Omit<TResources, 'settings'>
export type TGameResource = Exclude<TResource, EditorSettings>
export type TGameDocument = Exclude<TResourceType, 'settings'>

export type GetEntityReturn<T> = T extends 'achievements'
  ? EditorAchievement
  : T extends 'areas'
    ? EditorArea
    : T extends 'items'
      ? EditorItem
      : T extends 'locations'
        ? EditorLocation
        : T extends 'npcs'
          ? TEditorNpc
          : T extends 'npcTemplates'
            ? EditorNpcTemplate
            : T extends 'paths'
              ? EditorPath
              : T extends 'quests'
                ? EditorQuest
                : T extends 'scenes'
                  ? EditorScene
                  : T extends 'scriptures'
                    ? EditorScripture
                    : T extends 'lootTables'
                      ? EditorLootTable
                      : T extends 'variables'
                        ? EditorVariable
                        : T extends 'tests'
                          ? EditorTest
                          : T extends 'testTasks'
                            ? EditorTestTask
                            : T extends 'media'
                              ? EditorMedia
                              : null

type GetMediaReturn<T> = T extends 'audio' ? AVPlaybackSource | undefined : ImageSource | undefined

export type TMediaFiles = {
  image: Record<string, string | number>
  audio: Record<string, string | number>
}

export type TContentProp = TResources

const TRANSLATION_NAMESPACES = [
  'achievements',
  'endings',
  'items',
  'npcs',
  'quests',
  'scenes',
  'scriptures',
  'world',
  'push-notifications',
  'user-interface'
] as const

const GLOBAL_PROJECT_SLUG = 'eldrum'
const DEFAULT_LOCALE = 'en'

export class ContentStore {
  constructor(
    content: TContentProp,
    private readonly media: TMediaFiles,
    private readonly config: Config
  ) {
    this.data = content
    setSupportedLanguages(this.supportedLocales)
  }

  data: TResources

  get supportedLocales() {
    return [DEFAULT_LOCALE, ...this.config.supportedLocales]
  }

  populateRemoteContent = async () => {
    await Promise.all(resourceTypes.map(resource => this.getRemoteContent(resource)))
  }

  getRemoteContent = async (type: TResourceType) => {
    const editorUrl = this.config.editor.baseUrl

    if (!editorUrl) {
      logger.warn('getRemoteContent: No editor URL provided')
      return
    }

    const response = await fetch(`${editorUrl}/${type}?$limit=10000`)
    const json = await response.json()

    this.data[type] = json.data
  }

  loadRemoteTranslations = async (locales?: string[]) => {
    const { supportedLocales, localesServer } = this.config
    const localesToLoad = locales || supportedLocales

    if (!localesServer.baseUrl || !localesServer.projectSlug) {
      return
    }

    for (const locale of localesToLoad.filter(locale => locale !== DEFAULT_LOCALE)) {
      try {
        await this.loadRemoteTranslation(GLOBAL_PROJECT_SLUG, 'user-interface', locale)
      } catch (error) {
        logger.error(error)
        continue
      }

      for (const namespace of TRANSLATION_NAMESPACES) {
        try {
          await this.loadRemoteTranslation(localesServer.projectSlug, namespace, locale)
        } catch (error) {
          logger.error(error)
        }
      }
    }
  }

  private readonly loadRemoteTranslation = async (
    projectSlug: string,
    namespace: string,
    locale: string
  ) => {
    const url = `${this.config.localesServer.baseUrl}/api/${projectSlug}/${namespace}/${locale}`
    const response = await fetch(url)

    if (response.ok) {
      const translations = await response.json()

      i18n.addResourceBundle(locale, namespace, translations)
    } else {
      throw new Error(`Failed to fetch translations for ${namespace} in ${locale}`)
    }
  }

  get defaultLocale(): string {
    return DEFAULT_LOCALE
  }

  getMediaSource = <T extends 'audio' | 'image'>(type: T, id: string): GetMediaReturn<T> => {
    const file = type === 'image' ? this.media.image[id] : this.media.audio[id]

    if (file) {
      return file as GetMediaReturn<T>
    }

    try {
      const media = this.getEntity('media', id)

      return {
        uri: media.remote_url.replace('image/upload', `image/upload/w_${REMOTE_IMAGE_MAX_WIDTH}`)
      }
    } catch (error) {
      logger.warn(error)
    }
  }

  getEntity = <T extends TGameDocument>(type: T, id: string) => {
    const dataCollection: TGameResource[] = this.data?.[type]

    const entity = dataCollection?.find(item => {
      return item._id === id
    })

    if (!entity) {
      throw new Error(`Could not find entity with id ${id} of type ${type}`)
    }

    return entity as GetEntityReturn<T>
  }

  getEntities = <T extends TGameDocument>(type: T) => {
    return this.data[type] ? (this.data[type] as GetEntityReturn<T>[]) : []
  }
}

export default ContentStore
