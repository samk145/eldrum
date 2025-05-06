import type { DemoStores } from '../stores'
import type { DemoGame } from '../models/game'
import { useStores, useGameStore } from '@actnone/eldrum-engine/contexts'

export const useDemoStores = () => {
  const stores = useStores()

  return stores as DemoStores
}

export const useDemoGameStore = () => {
  const stores = useGameStore()

  return stores as unknown as DemoGame
}
