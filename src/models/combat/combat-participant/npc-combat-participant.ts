import type Npc from '../../character/npc'
import { action, computed } from 'mobx'
import { randomFromList } from '../../../helpers/misc'
import { CombatParticipant, type ICombatParticipantGenerics } from './combat-participant'
import type { NpcCombatAttackSet } from '../combat-attack-set'

export interface INpcCombatParticipantGenerics extends ICombatParticipantGenerics {
  Actor: Npc
  CombatAttackSet: NpcCombatAttackSet
}

export abstract class NpcCombatParticipant<
  G extends INpcCombatParticipantGenerics = INpcCombatParticipantGenerics
> extends CombatParticipant<G> {
  constructor(row: number, healthLimit: number | null, actor: G['Actor'], combat: G['Combat']) {
    super({ row, healthLimit }, actor, combat)
  }

  readonly teamId = '2'
  readonly isPlayer = false

  @computed get name() {
    if (this.combat.game._ui.screenReaderEnabled) {
      const { actor, participants } = this
      const teamMembersWithSameName = participants.filter(
        participant => participant.actor.name === actor.name && participant.teamId === this.teamId
      )

      if (teamMembersWithSameName.length > 1) {
        for (let i = 0; i < teamMembersWithSameName.length; i++) {
          const participant = teamMembersWithSameName[i]

          if (participant === this) {
            return `${super.name} ${i + 1}`
          }
        }
      }
    }

    return super.name
  }

  @computed get canMoveAwayFromTarget() {
    if (!this.canBeMovedAwayFromOpponent || this.distanceToOpponentFurthestAway > 3) {
      return false
    }

    return true
  }

  @computed get isTargeted() {
    const { participants } = this

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i]

      if (participant.target === this && !participant.isOnCooldown) {
        return true
      }
    }

    return false
  }

  @computed get hasAvailableRangedAttack(): boolean {
    return Boolean(
      CombatParticipant.getRangedCombatAttack<G['CombatAttackSet']>(this.availableCombatAttackSets)
    )
  }

  @computed get hasUsableRangedAttack(): boolean {
    return Boolean(
      CombatParticipant.getRangedCombatAttack<G['CombatAttackSet']>(this.usableCombatAttackSets)
    )
  }

  @computed get hasCombatActions() {
    return Boolean(this.combatActions.length)
  }

  @computed get hasOffensiveCombatActions() {
    return !!this.combatActions.filter(combatAction => combatAction.type === 'offensive').length
  }

  @computed get hasDefensiveCombatActions() {
    return !!this.combatActions.filter(combatAction => combatAction.type === 'defensive').length
  }

  @action useRandomUsableCombatAttackSet = async () => {
    const randomCombatAttackSet = randomFromList(this.usableCombatAttackSets)

    await this.performAction(randomCombatAttackSet.useRandomUsableAttack)
  }
}
