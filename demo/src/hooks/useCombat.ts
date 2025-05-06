import { useDemoGameStore } from './useStores'

export const useDemoCombat = () => {
  const game = useDemoGameStore()

  if (!game.combat) {
    throw new Error('No combat found')
  }

  return game.combat
}
