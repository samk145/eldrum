export const saveMigration = (oldSave, newSave) => {
  if (oldSave.saveData?.scene?.narrative?.length) {
    newSave.saveData.scene.history =
      oldSave.saveData.scene?.narrative?.map(narrative => ({
        narrativeTranslationKeys: [narrative]
      })) || []
  } else {
    newSave.saveData.scene.history = []
  }

  return newSave
}

export const realmMigration = (oldRealm, newRealm) => {
  const oldSaves = oldRealm.objects('Save')
  const newSaves = newRealm.objects('Save')

  for (const index in oldSaves) {
    const oldSave = oldSaves[index]
    const newSave = newSaves[index]

    saveMigration(oldSave, newSave)
  }
}
