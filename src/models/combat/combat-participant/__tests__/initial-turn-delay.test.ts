import { CombatParticipant } from '../combat-participant'
import { Initiative } from '../../../character/derivatives'

describe('Initial Turn Delay', () => {
  it('should return a value with a maximum random variance of 5%', () => {
    for (let i = 0; i < 20; i++) {
      const actorInitiative = Initiative.calculation(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10][Math.floor(Math.random() * 10)],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10][Math.floor(Math.random() * 10)]
      )

      const turnInterval = 950
      const initialTurnDelay = CombatParticipant.initialTurnDelay(turnInterval, actorInitiative)
      const initiativeInMs = Math.round(turnInterval / actorInitiative)

      expect(initialTurnDelay).toBeGreaterThanOrEqual(Math.round(initiativeInMs * 0.95))
      expect(initialTurnDelay).toBeLessThanOrEqual(Math.round(initiativeInMs * 1.05))
    }
  })
})
