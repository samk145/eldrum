export class SceneHistory {
  constructor(storedProps: SceneHistory) {
    this.narrativeTranslationKeys = storedProps.narrativeTranslationKeys
  }

  narrativeTranslationKeys: string[]
}
