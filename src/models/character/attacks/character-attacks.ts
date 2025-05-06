import type { EditorItemAttack } from '@actnone/eldrum-editor/dist/types'
import type Npc from '../npc'
import { action, computed } from 'mobx'
import { CharacterAttack, type TCharacterAttackSet } from './character-attack'
import type CharacterItem from '../../item/character-item'
import type { Character } from '../character'
import { Attacks } from './attacks'

export class CharacterAttacks<
  TInputAttack extends EditorItemAttack = EditorItemAttack,
  TOutputAttack extends CharacterAttack = CharacterAttack
> extends Attacks<Character, TOutputAttack> {
  constructor(
    actor: Character,
    readonly attackFactory: (
      actor: Character,
      inputAttack: TInputAttack,
      item?: CharacterItem
    ) => TOutputAttack
  ) {
    super(actor)
  }

  calculateMeleeBooster(actor: Character): number {
    const additionalStrength = actor.strength - 1 || 0

    return 0.5 + Math.pow(additionalStrength, 1.1)
  }

  @computed get attackSets(): TOutputAttack[][] {
    return this.getAttackSets(this.actor.inventory.equippedWeapons, this.actor) as TOutputAttack[][]
  }

  @action use = (npc: Npc, attack: CharacterAttack, healthLimit: number = 0) => {
    const damage = attack.getDamageRng()
    const inflictedDamage = npc.calculateDamageInfliction(damage)

    attack.disposeAmmunition()
    npc.changeHealth(inflictedDamage, true, healthLimit)
  }

  filterAttacksFromAttackSets = (
    attackSets: TCharacterAttackSet[],
    filter: (attack: CharacterAttack) => boolean
  ) => {
    return attackSets.reduce((list: TCharacterAttackSet[], attackSet) => {
      const filteredAttackSet = attackSet.filter(filter)

      return filteredAttackSet.length ? list.concat([filteredAttackSet]) : list
    }, [])
  }

  getAttackSetsFromItems = (items: CharacterItem[], actor: Character) => {
    return items.reduce((allAttackSets: TCharacterAttackSet[], item: CharacterItem) => {
      if (item.attackSet) {
        const attackSets = item.attackSet.map(itemAttack => {
          return this.attackFactory(actor, itemAttack, item)
        })

        allAttackSets.push(attackSets)
      }

      return allAttackSets
    }, [])
  }

  getAttackSets = (equippedWeapons: CharacterItem[], actor: Character) => {
    const attackSets = this.getAttackSetsFromItems(equippedWeapons, actor)
    const meleeAttackSets = this.filterAttacksFromAttackSets(attackSets, attack => !attack.ranged)
    const hasRangedAttack = attackSets.length > meleeAttackSets.length

    // If no melee or ranged attacks are available, add a fallback (i.e. fists)
    if (!meleeAttackSets.length && !hasRangedAttack) {
      attackSets.push(this.getFallbackAttackSet(actor))
    }

    return attackSets
  }

  getFallbackAttackSet(actor: Character): TCharacterAttackSet {
    return [
      new CharacterAttack(actor.inventory, actor.attacks, {
        damage: { min: 1, max: 1 },
        ranged: false,
        combatActions: []
      })
    ]
  }
}
