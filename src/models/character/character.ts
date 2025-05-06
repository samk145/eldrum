import type { TAttribute } from './attributes'
import type { StatModifier } from './stat-modifier'
import type CharacterItem from '../item/character-item'
import type { CharacterAttacks } from './attacks'
import type { Stats } from './stats'

import { observable, action, computed, reaction, type IReactionDisposer } from 'mobx'
import { t } from '../../i18n'
import { averageValue } from '../../helpers/misc'
import { analytics } from '../../helpers/analytics'
import Actor, { type IActorGenerics } from './actor'
import type { CharacterEffects } from './character-effects'
import {
  CharacterBlockChance,
  CharacterCriticalHitChance,
  CharacterEvadeMeleeChance,
  CharacterEvadeRangedChance,
  CharacterHitMeleeChance,
  CharacterHitRangedChance,
  CharacterInitiative,
  CharacterMaxHealth,
  CharacterProtection,
  CharacterSpeed,
  MaxEncumbrance
} from './derivatives'
import { IntegerAttribute, PreviewIntegerAttribute } from './integer-attribute'
import type TItem from '../item/t-item'
import BargainItem from '../item/bargain-item'
import { Inventory, type Slot } from './inventory'
import { EquipChange, type TEquipChanges } from './equip-change'

export interface ICharacterGenerics extends IActorGenerics {
  Inventory: Inventory
}

export interface CharacterStats extends Stats {
  speed: CharacterSpeed
  protection: CharacterProtection
  blockChance: CharacterBlockChance
  evadeMeleeChance: CharacterEvadeMeleeChance
  evadeRangedChance: CharacterEvadeRangedChance
  hitMeleeChance: CharacterHitMeleeChance
  hitRangedChance: CharacterHitRangedChance
  criticalHitChance: CharacterCriticalHitChance
  maxEncumbrance: MaxEncumbrance
  maxHealth: CharacterMaxHealth
  maxActionPoints: IntegerAttribute
  initiative: CharacterInitiative
}

export abstract class Character<
  G extends ICharacterGenerics = ICharacterGenerics
> extends Actor<G> {
  constructor(game: G['Game']) {
    super(game)
    this.strength = this.game._default.character.baseStrength
    this.charisma = this.game._default.character.baseCharisma
    this.resilience = this.game._default.character.baseResilience
    this.agility = this.game._default.character.baseAgility
    this.perception = this.game._default.character.basePerception
    this.level = this.game._default.character.level
  }

  postConstructor() {
    this.effects.restoreEffects(this.game._default.character.effects)

    this.health =
      this.game._default.character.health >= this.maxHealth ||
      this.game._default.character.health === 0
        ? this.maxHealth
        : this.game._default.character.health
  }

  _id = 'player'
  @observable experience: number = this.game._default.character.experience
  @observable unspentStatPoints: number = this.game._default.character.unspentStatPoints
  @observable gold: number = this.game._default.character.gold
  @observable displayItemNotification: boolean =
    this.game._default.character.displayItemNotification

  stats: CharacterStats = {
    blockChance: new CharacterBlockChance(this),
    criticalHitChance: new CharacterCriticalHitChance(this),
    evadeMeleeChance: new CharacterEvadeMeleeChance(this),
    evadeRangedChance: new CharacterEvadeRangedChance(this),
    hitMeleeChance: new CharacterHitMeleeChance(this),
    hitRangedChance: new CharacterHitRangedChance(this),
    maxActionPoints: new IntegerAttribute('maxActionPoints', this, 3),
    maxEncumbrance: new MaxEncumbrance(this),
    maxHealth: new CharacterMaxHealth(this),
    protection: new CharacterProtection(this),
    speed: new CharacterSpeed(this),
    initiative: new CharacterInitiative(this)
  }

  abstract inventory: G['Inventory']
  abstract attacks: CharacterAttacks
  abstract effects: CharacterEffects

  @computed get armor() {
    return Inventory.armor(this.inventory.equippedItems)
  }

  @computed get alive() {
    return this.health > 0
  }

  @computed get encumbrance() {
    return Inventory.encumbranceFromItems(this.inventory.equippedItems)
  }

  @computed get overEncumbered() {
    return this.encumbrance > this.maxEncumbrance
  }

  @computed get previousLevel(): number {
    return this.game._content.settings.levels[this.level - 2] || 0
  }

  @computed get nextLevel(): number {
    return this.game._content.settings.levels[this.level - 1] || 9999999999
  }

  @computed get blockChance() {
    return this.stats.blockChance ? this.stats.blockChance.value : 0
  }

  @computed get speed() {
    return this.stats.speed ? this.stats.speed.value : 0
  }

  @computed get criticalHitChance() {
    return this.stats.criticalHitChance ? this.stats.criticalHitChance.value : 0
  }

  @computed get maxEncumbrance() {
    return this.stats.maxEncumbrance ? this.stats.maxEncumbrance.value : 0
  }

  @computed get maxHealth() {
    return this.stats.maxHealth.value
  }

  @computed get maxActionPoints() {
    return this.stats.maxActionPoints.value
  }

  @computed get immunities() {
    const immunities = super.immunities

    this.inventory.equippedItems.forEach(item => {
      if (item.sideEffects?.immunities) {
        item.sideEffects.immunities.forEach(immunity => {
          immunities.add(immunity)
        })
      }
    })

    return immunities
  }

  @action changeStat = (stat: TAttribute | 'gold', amount: number, notify = true) => {
    if (stat === 'gold') {
      this.changeGold(amount, notify)
    } else {
      this.changeAttribute(stat, amount, notify)
    }
  }

  @action changeGold = (
    amount: number,
    notify = true,
    notificationTime: number | undefined = undefined
  ) => {
    if (typeof amount === 'string') {
      amount = parseInt(amount)
    }
    amount = this.gold + amount < 0 ? -this.gold : amount
    this.gold += amount

    if (notify) {
      this.sendChangeNotification(t('CHARACTER-STAT-GOLD'), amount, notificationTime)
    }
  }

  @action markNewItemNotificationAsSeen = () => (this.displayItemNotification = false)

  calculateStatModifiers(): StatModifier[] {
    return super
      .calculateStatModifiers()
      .concat(this.calculateEquipmentStatModifiers(this.inventory.equippedItems))
  }

  calculateEquipmentStatModifiers(items: CharacterItem[]): StatModifier[] {
    return items.reduce((results: StatModifier[], item) => {
      if (item.sideEffects?.statModifiers) {
        results.push(...item.sideEffects.statModifiers)
      }
      return results
    }, [])
  }

  calculateMeleeBooster(strength: number): number {
    return strength / 2
  }

  /**
   * Spend stat point
   */
  @action spendStatPoint = (key: TAttribute) => {
    if (!this.unspentStatPoints) return

    this.unspentStatPoints--
    this.attributes[key].increaseBaseValue()

    if (key === 'resilience') {
      this.changeHealth(CharacterMaxHealth.resilienceHealthModifier, false)
    }
  }

  @action gainExperience = (xp: number, notify: boolean = true) => {
    this.experience = Math.round(this.experience + xp)
    if (notify) {
      this.game.notifications.create(t('CHARACTER-EXPERIENCE-GAIN-NOTIFICATION', { value: xp }))
    }

    const { levels } = this.game._content.settings

    while (this.experience >= levels[this.level - 1]) {
      this.levelUp(notify)
    }
  }

  @action loseExperience = (xp: number, notify: boolean = false) => {
    const expLost = this.experience < xp ? this.experience : xp
    this.experience = this.experience - expLost
    if (notify) {
      this.game.notifications.create(t('CHARACTER-EXPERIENCE-LOSE-NOTIFICATION', { value: xp }))
    }

    const { levels } = this.game._content.settings

    while (this.experience < levels[this.level - 2]) {
      this.downLevel(notify)
    }
  }

  @action setLevel = (desiredLevel: number, notify: boolean = false) => {
    const { levels } = this.game._content.settings

    const desiredExperience = desiredLevel === 1 ? 0 : levels[desiredLevel - 2]
    if (this.experience > desiredExperience) {
      this.loseExperience(this.experience - desiredExperience, notify)
    } else if (this.experience < desiredExperience) {
      this.gainExperience(desiredExperience - this.experience, notify)
    }
  }

  @action gainExperienceToReachNextLevel = () => {
    const { levels } = this.game._content.settings
    const nextLevelRequiredExperience = levels[this.level - 1]
    const neededExperienceToReachLevel = nextLevelRequiredExperience - this.experience

    this.gainExperience(neededExperienceToReachLevel)
  }

  @action addUnusedStatPoint = () => {
    this.unspentStatPoints++
  }

  @action removeUnusedStatPoint = () => {
    if (this.unspentStatPoints > 0) {
      this.unspentStatPoints--
    }
  }

  @action levelUp(notify: boolean = true) {
    this.level++
    this.addUnusedStatPoint()
    this.changeHealth(this.maxHealth)

    if (notify) {
      this.game.notifications.create(t('CHARACTER-PLAYER-LEVEL-UP-NOTIFICATION'))
    }
  }

  @action downLevel = (notify: boolean = false) => {
    if (this.level === 1) {
      return
    }

    this.level -= 1
    this.experience = this.game._content.settings.levels[this.level - 2]

    if (notify) {
      this.game.notifications.create(t('CHARACTER-PLAYER-LEVEL-DOWN-NOTIFICATION'))
    }
  }

  /**
   * Calculate possible effect of equipping or un-equipping an item
   */
  equipEffect(newItem: TItem, slotSet: Slot[]): TEquipChanges {
    const willUnEquip = this.inventory.getEquippedItems(slotSet)
    const newEquippedItems = this.inventory.equippedItems.filter(
      item => !willUnEquip.includes(item)
    )

    // Add the item to the list of equipped items unless it's already equipped.
    // This is needed in order to emulate an un-equip and at the same time support
    // checking the equip effect of an item when bargaining.
    if (newItem instanceof BargainItem) {
      const hasSeen = this.game.statistics.getRecord('gainedItems', newItem._id) > 0

      newEquippedItems.push(
        this.inventory.itemFactory({
          character: this,
          defaultProps: newItem,
          storedProps: { hasSeen }
        })
      )
    } else if (!newItem.equipped) {
      newEquippedItems.push(newItem)
    }

    const newStatModifiers = this.calculatePassiveStatModifiers(this.effects.list).concat(
      this.calculateEquipmentStatModifiers(newEquippedItems)
    )

    // Attributes

    const previewStrength = new PreviewIntegerAttribute(
      'strength',
      this,
      newStatModifiers,
      this.attributes.strength.baseValue
    )
    const newStrength = previewStrength.value

    const previewCharisma = new PreviewIntegerAttribute(
      'charisma',
      this,
      newStatModifiers,
      this.attributes.charisma.baseValue
    )
    const newCharisma = previewCharisma.value

    const previewResilience = new PreviewIntegerAttribute(
      'resilience',
      this,
      newStatModifiers,
      this.attributes.resilience.baseValue
    )
    const newResilience = previewResilience.value

    const previewAgility = new PreviewIntegerAttribute(
      'agility',
      this,
      newStatModifiers,
      this.attributes.agility.baseValue
    )
    const newAgility = previewAgility.value

    const previewPerception = new PreviewIntegerAttribute(
      'perception',
      this,
      newStatModifiers,
      this.attributes.perception.baseValue
    )
    const newPerception = previewPerception.value

    // Stats

    const previewMaxActionPoints = new PreviewIntegerAttribute(
      'maxActionPoints',
      this,
      newStatModifiers,
      this.maxActionPoints
    )

    const newMaxActionPoints = previewMaxActionPoints.value

    const newArmor = Inventory.armor(newEquippedItems)

    const previewProtection = this.stats.protection.preview(
      this,
      newArmor,
      newResilience,
      newStatModifiers
    )
    const newProtection = previewProtection.value

    const previewSpeed = this.stats.speed.preview(this, newAgility, newStatModifiers)
    const newSpeed = previewSpeed.value

    const previewBlockChance = this.stats.blockChance.preview(
      this,
      newResilience,
      newEquippedItems,
      newStatModifiers
    )
    const newBlockChance = previewBlockChance.value

    const previewMaxEncumbrance = this.stats.maxEncumbrance.preview(
      this,
      newStrength,
      newStatModifiers
    )
    const newMaxEncumbrance = previewMaxEncumbrance.value

    const newEncumbrance = Inventory.encumbranceFromItems(newEquippedItems)

    const previewEvadeRangedChance = this.stats.evadeRangedChance.preview(
      this,
      newAgility,
      newStatModifiers
    )
    const newEvadeRangedChance = previewEvadeRangedChance.value

    const previewEvadeMeleeChance = this.stats.evadeMeleeChance.preview(
      this,
      newAgility,
      newStatModifiers
    )
    const newEvadeMeleeChance = previewEvadeMeleeChance.value

    const previewCriticalHitChance = this.stats.criticalHitChance.preview(
      this,
      newPerception,
      newStatModifiers
    )
    const newCriticalHitChance = previewCriticalHitChance.value

    const previewHitRangedChance = this.stats.hitRangedChance.preview(
      this,
      newPerception,
      newStatModifiers
    )
    const newHitRangedChance = previewHitRangedChance.value

    const previewHitMeleeChance = this.stats.hitMeleeChance.preview(
      this,
      newPerception,
      newStatModifiers
    )
    const newHitMeleeChance = previewHitMeleeChance.value

    const previewMaxHealth = this.stats.maxHealth.preview(this, newResilience, newStatModifiers)
    const newMaxHealth = previewMaxHealth.value

    const newAttackSets = this.attacks.getAttackSets(newEquippedItems, this)
    const willUnEquipAttackSets = this.attacks.getAttackSets(this.inventory.equippedWeapons, this)
    const newStrongestMeleeAttack = this.attacks.getPrimaryMeleeAttack(newAttackSets)
    const newStrongestRangedAttack = this.attacks.getPrimaryRangedAttack(newAttackSets)
    const willUnEquipStrongestMeleeAttack =
      this.attacks.getPrimaryMeleeAttack(willUnEquipAttackSets)
    const willUnEquipStrongestRangedAttack =
      this.attacks.getPrimaryRangedAttack(willUnEquipAttackSets)

    const newAverageMeleeDamage = newStrongestMeleeAttack
      ? averageValue([newStrongestMeleeAttack.damage.min, newStrongestMeleeAttack.damage.max])
      : 0

    const newAverageRangedDamage = newStrongestRangedAttack
      ? averageValue([newStrongestRangedAttack.damage.min, newStrongestRangedAttack.damage.max])
      : 0

    const currentAverageMeleeDamage = willUnEquipStrongestMeleeAttack
      ? averageValue([
          willUnEquipStrongestMeleeAttack.damage.min,
          willUnEquipStrongestMeleeAttack.damage.max
        ])
      : 0

    const currentAverageRangedDamage = willUnEquipStrongestRangedAttack
      ? averageValue([
          willUnEquipStrongestRangedAttack.damage.min,
          willUnEquipStrongestRangedAttack.damage.max
        ])
      : 0

    const result = {
      armor: new EquipChange(this.armor, newArmor),
      evadeRangedChance: new EquipChange(this.evadeRangedChance, newEvadeRangedChance),
      evadeMeleeChance: new EquipChange(this.evadeMeleeChance, newEvadeMeleeChance),
      criticalHitChance: new EquipChange(this.criticalHitChance, newCriticalHitChance),
      hitRangedChance: new EquipChange(this.hitRangedChance, newHitRangedChance),
      hitMeleeChance: new EquipChange(this.hitMeleeChance, newHitMeleeChance),
      blockChance: new EquipChange(this.blockChance || 0, newBlockChance),
      encumbrance: new EquipChange(this.encumbrance, newEncumbrance),
      maxEncumbrance: new EquipChange(this.maxEncumbrance || 0, newMaxEncumbrance),
      maxHealth: new EquipChange(this.maxHealth, newMaxHealth),
      protection: new EquipChange(this.protection || 0, newProtection),
      speed: new EquipChange(this.speed, newSpeed),
      maxActionPoints: new EquipChange(this.maxActionPoints, newMaxActionPoints),
      strength: new EquipChange(this.strength, newStrength),
      charisma: new EquipChange(this.charisma, newCharisma),
      resilience: new EquipChange(this.resilience, newResilience),
      agility: new EquipChange(this.agility, newAgility),
      perception: new EquipChange(this.perception, newPerception),
      meleeDamage: new EquipChange(currentAverageMeleeDamage, newAverageMeleeDamage),
      rangedDamage: new EquipChange(currentAverageRangedDamage, newAverageRangedDamage),
      willUnEquip,
      canEquip:
        newMaxEncumbrance >= newEncumbrance &&
        !this.inventory.equippedItems.find(equippedItem => equippedItem.uuid === newItem.uuid)
    }

    return result
  }

  mount() {
    this.onLevelChange = reaction(
      () => this.level,
      level => {
        analytics.addUserProperty({
          level
        })
      },
      { name: 'onLevelChange', fireImmediately: true }
    )

    this.onMaxHealthChange = reaction(
      () => this.maxHealth,
      maxHealth => {
        if (this.health > maxHealth) {
          this.health = maxHealth
        }
      },
      { name: 'onMaxHealthChange', fireImmediately: true }
    )

    this.onOverEncumbrance = reaction(
      () => this.overEncumbered,
      isOverencumbered => {
        const effectId = 'overEncumbered'
        const hasEffect = this.effects.hasEffect(effectId)

        if (isOverencumbered && !hasEffect) {
          this.effects.addEffect(effectId)
        } else if (hasEffect && !isOverencumbered) {
          this.effects.removeEffectsById(effectId)
        }
      },
      { name: 'onOverEncumbrance', fireImmediately: true }
    )
  }

  unmount() {
    this.onMaxHealthChange?.()
    this.onOverEncumbrance?.()
    this.onLevelChange?.()
    this.effects.unmount()

    analytics.removeUserProperty('level')
  }

  onLevelChange?: IReactionDisposer
  onMaxHealthChange?: IReactionDisposer
  onOverEncumbrance?: IReactionDisposer
}

export default Character
