import type { TCombatActionId } from '~demo/models/combat/combat-actions'
import type { TDemoCombatParticipant } from '../combat-participant'
import { CombatBehavior, type TCombatBehaviorAction } from '@actnone/eldrum-engine/models'
import { combatActionIds } from '~demo/models/combat/combat-actions'
import Glide from '~demo/models/combat/combat-actions/glide'

interface IDemoCombatBehaviorGenerics {
  Participant: TDemoCombatParticipant
  ActionName: TCombatActionId
}

export abstract class DemoCombatBehavior extends CombatBehavior<IDemoCombatBehaviorGenerics> {
  constructor(protected participant: TDemoCombatParticipant) {
    super(participant)

    this.combatActionPreference.push(
      ...combatActionIds
        .filter(id => !this.combatActionPreference.find(c => c.name === id))
        .map(id => ({
          name: id
        }))
    )
  }

  get combatActionPreference(): TCombatBehaviorAction<TCombatActionId, TDemoCombatParticipant>[] {
    return this._combatActionPreference
  }

  _combatActionPreference: TCombatBehaviorAction<TCombatActionId, TDemoCombatParticipant>[] = [
    {
      name: 'sever'
    },
    {
      name: 'puncture',
      sort: target => {
        const { participant } = this
        const { averageDamage } = participant.usableCombatAttackSets[0].usableAttacks[0]

        return target.protection / averageDamage > 0.75 ? -1 : 1
      }
    },
    {
      name: 'glide',
      condition: target => {
        const { participant } = this

        if (
          participant.advantagePoints < participant.maxAdvantagePoints * 0.5 &&
          target.advantagePoints > Glide.advantageToRemove * 0.5
        ) {
          return true
        }

        return false
      },
      sort: target =>
        target.advantagePoints > Glide.advantageToRemove * 0.75 &&
        this.numberOfActionsBeforeTarget > 1
          ? -1
          : 0
    },
    {
      sort: target => (target.healthPercentageIs('above', 0.6) ? -1 : 1),
      name: 'cut'
    },
    {
      condition: target => !target.actor.effects.hasEffect('hamstrung'),
      name: 'hamstring'
    },
    {
      sort: target =>
        this.participant.aliveTeamMembers.length || this.numberOfActionsBeforeTarget > 1 ? -1 : 0,
      name: 'hook'
    },
    {
      condition: target => !target.actor.effects.hasEffect('defensive'),
      sort: target => {
        const { participant } = this

        if (participant.aliveTeamMembers.length || this.numberOfActionsBeforeTarget > 1) {
          return -1
        }

        return 0
      },
      name: 'sweep'
    },
    {
      condition: target => target.isInStance,
      sort: target => {
        if (this.numberOfActionsBeforeTarget > 1) {
          return -1
        }

        return 0
      },
      name: 'trip'
    },
    {
      name: 'parry',
      condition: target => {
        const { participant } = this
        const existingParry = participant.actor.effects.list.filter(
          effect => effect.id === 'parry'
        ).length

        if (
          target.healthPercentageIs('above', 0.5) &&
          participant.healthPercentageIs('below', 0.5) &&
          existingParry < 3 &&
          (existingParry === 0 || Math.random() > 0.5)
        ) {
          return true
        }

        return false
      },
      sort: target => {
        const { participant } = this

        if (participant.healthPercentageIs('below', 0.5)) {
          return -1
        } else if (participant.actor.effects.hasEffect('parry')) {
          return 1
        }

        return 0
      }
    }
  ]
}
