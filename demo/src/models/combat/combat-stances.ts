import Aggressive from '~demo/models/character/effects/aggressive'
import Defensive from '~demo/models/character/effects/defensive'

const combatStanceNames = [Aggressive.id, Defensive.id] as const

type TCombatStanceName = (typeof combatStanceNames)[number]

export type { TCombatStanceName }
export { combatStanceNames }
