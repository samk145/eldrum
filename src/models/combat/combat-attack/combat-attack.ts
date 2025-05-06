import { action, computed } from 'mobx'
import { t } from '../../../i18n'
import type { TUuid } from '../../../helpers/misc'
import { uuid, averageValue } from '../../../helpers/misc'
import { type CharacterAttack, type NpcAttack } from '../../character/attacks'
import {
  type PlayerCombatParticipant,
  type NpcCombatParticipant,
  type TCombatParticipant
} from '../combat-participant'
import { CombatParticle } from '../combat-particle'
import { AttackEvent } from '../combat-events'

export type TCombatAttack = PlayerCombatAttack | NpcCombatAttack

interface ICombatAttackGenerics {
  Possessor: TCombatParticipant
  Attack: CharacterAttack | NpcAttack
}

export abstract class CombatAttack<G extends ICombatAttackGenerics = ICombatAttackGenerics> {
  constructor(
    public readonly possessor: G['Possessor'],
    public readonly attack: G['Attack']
  ) {
    this.getDamageRng = this.attack.getDamageRng
  }

  id: TUuid = uuid()
  getDamageRng: () => number

  get averageDamage() {
    return averageValue([this.attack.damage.min, this.attack.damage.max])
  }

  /**
   * Combat attack is available (i.e. melee or has ammunition if ranged).
   */
  @computed get available() {
    return this.attack.available
  }

  /**
   * Combat attack is both available AND is within range - thus usable.
   */
  @computed get usable() {
    return this.available && this.isWithinRange
  }

  @computed get isWithinRange() {
    const { possessor, ranged } = this

    return !!(
      (possessor.distanceToTarget > 1 && ranged) ||
      (possessor.distanceToTarget <= 1 && !ranged)
    )
  }

  get ranged() {
    return this.attack.ranged
  }

  abstract usageTerm: string

  preFire: (particle: CombatParticle) => Promise<void> = async () => {}

  @action use = async (target: TCombatParticipant = this.possessor.target) => {
    const { possessor, attack } = this

    await possessor.addEvent(new AttackEvent(this.usageTerm), 50)

    const attackParticle = new CombatParticle(CombatAttack.source, possessor, target, attack.damage)

    if (attack.particleEffects?.length) {
      attackParticle.effects.push(...attack.particleEffects)
    }

    await this.preFire(attackParticle)
    const result = await attackParticle.fire()

    if (result.inflictedDamage) {
      const advantagePoints = this.calculateAdvantagePointsGain(
        result.inflictedDamage,
        target.actor.maxHealth
      )

      possessor.addAdvantagePoints(advantagePoints)
    }
  }

  /**
   * Calculates the advantage points gain based on the damage dealt and the target's max health.
   * This formula can be overridden by subclasses to provide different calculations for player and NPC attacks.
   */
  calculateAdvantagePointsGain(damage: number, targetMaxHealth: number) {
    const percentOfTargetMaxHealth = Math.min(damage / targetMaxHealth, 1)

    return Math.min(500 + 5000 * percentOfTargetMaxHealth, 2000)
  }

  static source = 'attack' as const
}

export interface IPlayerCombatAttackGenerics extends ICombatAttackGenerics {
  Possessor: PlayerCombatParticipant
  Attack: CharacterAttack
}

export abstract class PlayerCombatAttack<
  G extends IPlayerCombatAttackGenerics = IPlayerCombatAttackGenerics
> extends CombatAttack<G> {
  get retrievable() {
    return this.attack.usesAmmunition === false
  }

  get title() {
    if (this.ranged) {
      return t('COMBAT-ACTION-ATTACK_RANGED-TITLE')
    } else {
      return t('COMBAT-ACTION-ATTACK_MELEE-TITLE')
    }
  }

  get description() {
    if (this.thrown) {
      return t('COMBAT-ACTION-ATTACK_RANGED_B-DESC')
    } else if (this.ranged) {
      return t('COMBAT-ACTION-ATTACK_RANGED_A-DESC')
    } else {
      return t('COMBAT-ACTION-ATTACK_MELEE-DESC')
    }
  }

  get usageTerm() {
    if (this.thrown) {
      return t('COMBAT-ACTION-ATTACK_RANGED_B-LABEL')
    } else if (this.ranged) {
      return t('COMBAT-ACTION-ATTACK_RANGED_A-LABEL')
    } else {
      return t('COMBAT-ACTION-ATTACK_MELEE-LABEL')
    }
  }

  get thrown() {
    const { attack } = this

    return !!(attack.ranged && !attack.usesAmmunition)
  }

  @computed get ammunitionQuantity() {
    return this.attack.ammunitionQuantity
  }

  @action releaseItem = (removeFromInventory: boolean = false) => {
    const { attack, possessor } = this

    if (attack.item) {
      possessor.releasedItemData.push({
        item: attack.item,
        slotSetIndex: attack.item.equippedInSlotSetIndex,
        slotSet: attack.item.equippedInSlotSet
      })

      if (removeFromInventory) {
        possessor.actor.inventory.removeItemByUuid(attack.item.uuid, { notify: false })
      }
    }
  }

  @action preFire = async (particle: CombatParticle) => {
    const { attack } = this

    attack.disposeAmmunition(false)

    if (attack.item && particle.isProjectile && this.retrievable) {
      this.releaseItem()
    }
  }
}

export interface INpcCombatAttackGenerics extends ICombatAttackGenerics {
  Possessor: NpcCombatParticipant
  Attack: NpcAttack
}

export abstract class NpcCombatAttack<
  G extends INpcCombatAttackGenerics = INpcCombatAttackGenerics
> extends CombatAttack<G> {
  get usageTerm() {
    return this.attack.usageTerm
  }

  preFire = async () => {
    this.attack.use()
  }

  calculateAdvantagePointsGain(damage: number, targetMaxHealth: number) {
    const gain = super.calculateAdvantagePointsGain(damage, targetMaxHealth)

    return gain * 0.75
  }
}
