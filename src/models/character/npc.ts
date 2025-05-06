import type { EditorNpc } from '@actnone/eldrum-editor/dist/types'
import type { Stats } from './stats'
import type SaveDataNpc from '../database/schemas/save/save-data/save-data-npc'
import type { NpcEffects } from './npc-effects'
import type { NpcAttacks } from './attacks'
import type { StatModifier } from './stat-modifier'

import { t } from '../../i18n'
import { computed, observable, reaction } from 'mobx'
import Actor, { type IActorGenerics } from './actor'
import DecimalAttribute from './decimal-attribute'
import {
  NpcCriticalHitChance,
  NpcEvadeMeleeChance,
  NpcEvadeRangedChance,
  NpcHitMeleeChance,
  NpcHitRangedChance,
  NpcInitiative,
  NpcMaxHealth,
  NpcSpeed,
  NpcProtection
} from './derivatives'
import { IntegerAttribute } from './integer-attribute'

export interface NpcStats extends Stats {
  speed: NpcSpeed
  protection: NpcProtection
  blockChance: DecimalAttribute
  evadeMeleeChance: NpcEvadeMeleeChance
  evadeRangedChance: NpcEvadeRangedChance
  hitMeleeChance: NpcHitMeleeChance
  hitRangedChance: NpcHitRangedChance
  criticalHitChance: NpcCriticalHitChance
  maxHealth: NpcMaxHealth
  maxActionPoints: IntegerAttribute
  initiative: NpcInitiative
}

export interface INpcGenerics extends IActorGenerics {
  Behavior: string
}

interface Npc
  extends Pick<
    EditorNpc,
    | '_alias'
    | 'healthOverride'
    | 'experience'
    | 'portrait'
    | 'bargain'
    | 'purchaseItemTypes'
    | 'template'
  > {
  loot?: string
  innateStatModifiers: StatModifier[]
  actionPoints: number
}

abstract class Npc<G extends INpcGenerics = INpcGenerics> extends Actor {
  constructor(game: G['Game'], defaultProps: EditorNpc) {
    super(game)

    Object.assign(this, defaultProps)
  }

  postConstructor(storedProps?: SaveDataNpc) {
    this.effects.restoreEffects(storedProps?.effects)

    if (storedProps) {
      // Make sure the stored health isn't higher than the default health.
      // If it is, we'll reset it to max health.
      this.health =
        storedProps.health && storedProps.health > this.maxHealth
          ? this.maxHealth
          : storedProps.health
    } else {
      this.health = this.maxHealth
    }
  }

  get name() {
    const nameKey = `NPC-${this._id}-NAME`
    const name = t(nameKey, { ns: 'npcs' })

    if (name === nameKey && this.template) {
      return t(`NPC_TEMPLATE-${this.template}-NAME`, { ns: 'npcs' })
    }

    return name
  }

  private set name(_: string) {}

  @computed get alive() {
    return this.health > 0
  }

  @observable armor = 0
  abstract attacks: NpcAttacks
  abstract effects: NpcEffects
  behavior: G['Behavior'] = ''

  calculateStatModifiers(): StatModifier[] {
    return super.calculateStatModifiers().concat(this.innateStatModifiers ?? [])
  }

  stats: NpcStats = {
    blockChance: new DecimalAttribute('blockChance', this),
    criticalHitChance: new NpcCriticalHitChance(this),
    evadeMeleeChance: new NpcEvadeMeleeChance(this),
    evadeRangedChance: new NpcEvadeRangedChance(this),
    hitMeleeChance: new NpcHitMeleeChance(this),
    hitRangedChance: new NpcHitRangedChance(this),
    maxActionPoints: new IntegerAttribute('maxActionPoints', this),
    maxHealth: new NpcMaxHealth(this),
    protection: new NpcProtection(this),
    speed: new NpcSpeed(this),
    initiative: new NpcInitiative(this)
  }

  @computed get speed(): number {
    return this.stats.speed ? this.stats.speed.value : 0
  }

  @computed get maxHealth(): number {
    return this.stats.maxHealth.value
  }

  @computed get maxActionPoints() {
    return this.stats.maxActionPoints ? this.stats.maxActionPoints.value : 1
  }

  set maxActionPoints(value: number) {
    if (this.stats.maxActionPoints && value !== undefined) {
      ;(this.stats.maxActionPoints as DecimalAttribute).setBaseValue(value)
    }
  }

  @computed get blockChance() {
    return this.stats.blockChance ? this.stats.blockChance.value : 0
  }

  set blockChance(value: number) {
    if (this.stats.blockChance && value !== undefined) {
      this.stats.blockChance.setBaseValue(value)
    }
  }

  @computed get immunities() {
    const immunities = super.immunities

    this.effects.baseImmunities.forEach(immunity => {
      immunities.add(immunity)
    })

    return immunities
  }

  dies = reaction(
    () => this.alive,
    (alive, reaction) => {
      if (!alive) {
        if (this.experience) {
          this.game.character.gainExperience(this.experience, true)
        }

        if (this.game.combat) {
          this.game.statistics.record('killedNpcsInCombat', this._id)
        }

        reaction.dispose()
      }
    },
    { name: 'dies' }
  )
}

export { Npc }
export default Npc
