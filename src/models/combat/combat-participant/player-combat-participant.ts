import type Character from '../../character/character'
import type { Slot } from '../../character/inventory'
import type CharacterItem from '../../item/character-item'
import { action, computed } from 'mobx'
import { randomFromList } from '../../../helpers/misc'
import { CombatParticipant, type ICombatParticipantGenerics } from './combat-participant'
import type { PlayerCombatAttackSet } from '../combat-attack-set'

type TReleasedItemData = {
  item: CharacterItem
  slotSetIndex: number | null
  slotSet: Slot[] | null
}

export interface IPlayerCombatParticipantGenerics extends ICombatParticipantGenerics {
  Actor: Character
  CombatAttackSet: PlayerCombatAttackSet
}

export abstract class PlayerCombatParticipant<
  G extends IPlayerCombatParticipantGenerics = IPlayerCombatParticipantGenerics
> extends CombatParticipant<G> {
  constructor(healthLimit: number | null, actor: G['Actor'], combat: G['Combat']) {
    super({ row: 0, healthLimit }, actor, combat)
  }

  readonly teamId = '1'
  readonly isPlayer = true

  releasedItemData: TReleasedItemData[] = []

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

  @action useRandomUsableCombatAttackSet = async () => {
    const randomCombatAttackSet = randomFromList(this.usableCombatAttackSets)

    await this.performAction(randomCombatAttackSet.useRandomUsableAttack)
  }

  @action retrieveAndEquipReleasedItems = () => {
    const { releasedItemData, actor } = this

    let lastUsedInMainHand: TReleasedItemData | null = null
    let lastUsedInOffHand: TReleasedItemData | null = null

    for (let i = 0; i < releasedItemData.length; i++) {
      const data = releasedItemData[i]

      actor.inventory.addItem(data.item)

      if (data.slotSet?.includes('mainHand')) {
        lastUsedInMainHand = data
      }

      if (data.slotSet?.includes('offHand')) {
        lastUsedInOffHand = data
      }
    }

    if (!actor.inventory.itemSlots.mainHand && lastUsedInMainHand) {
      actor.inventory.equipItem(
        lastUsedInMainHand.item.uuid,
        lastUsedInMainHand.slotSetIndex ?? undefined
      )
    }

    if (!actor.inventory.itemSlots.mainHand && lastUsedInOffHand) {
      actor.inventory.equipItem(
        lastUsedInOffHand.item.uuid,
        lastUsedInOffHand.slotSetIndex ?? undefined
      )
    }
  }

  surrender = () => {
    this.combat.playerSurrendered = true
    this.takeDamage(this.actor.maxHealth)
  }
}
