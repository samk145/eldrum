import { t } from '../../../i18n'
import { camelCaseToConstCase, uuid } from '../../../helpers/misc'

type TCoordinates = {
  x: number
  y: number
}

export abstract class CombatEvent {
  constructor(public source?: string) {}

  abstract id: string
  uuid: string = uuid()

  fromPosition: TCoordinates = { x: 0, y: 50 }
  toPosition: TCoordinates = { x: 0, y: 0 }

  getLabel() {
    return t(`COMBAT-EVENT-${camelCaseToConstCase(this.id)}-LABEL`)
  }
}

class GenericEvent extends CombatEvent {
  constructor(
    private readonly translationKey: string,
    public source?: string
  ) {
    super(source)
  }

  static id = 'generic' as const
  id = GenericEvent.id

  getLabel() {
    return t(this.translationKey)
  }
}

class CombatActionEvent extends CombatEvent {
  constructor(public combatActionId: string) {
    super(combatActionId)
  }

  static id = 'combatAction' as const
  id = CombatActionEvent.id

  getLabel() {
    return t(`COMBAT_ACTION-${camelCaseToConstCase(this.combatActionId)}-NAME`)
  }
}

class ParryEvent extends CombatEvent {
  static id = 'parry' as const
  id = ParryEvent.id
  label = 'Parry'
}

class AttackEvent extends CombatEvent {
  static id = 'attack' as const
  id = AttackEvent.id
}

class PreventedEvent extends CombatEvent {
  static id = 'prevented' as const
  id = PreventedEvent.id
}

class CounterAttackEvent extends CombatEvent {
  static id = 'counterAttack' as const
  id = CounterAttackEvent.id
}

class ProtectedEvent extends CombatEvent {
  static id = 'protected' as const
  id = ProtectedEvent.id
}

class BlockEvent extends CombatEvent {
  static id = 'block' as const
  id = BlockEvent.id
}

class EvadeEvent extends CombatEvent {
  static id = 'evade' as const
  id = EvadeEvent.id
}

class DamageEvent extends CombatEvent {
  constructor(
    public damage: number = 0,
    public critical: boolean = false,
    source?: string
  ) {
    super(source)
  }

  static id = 'damage' as const
  id = DamageEvent.id

  getLabel() {
    let result = ''

    if (this.critical) {
      result += `${t('COMBAT-EVENT-CRITICAL_DAMAGE-LABEL')} `
    }

    result += ` -${this.damage}`

    return result
  }
}

class BleedEvent extends CombatEvent {
  constructor(
    public hpChange = 0,
    source?: string
  ) {
    super(source)
  }

  static id = 'bleed' as const
  id = BleedEvent.id

  getLabel() {
    return `${t('COMBAT-EVENT-BLEED-LABEL')} ${this.hpChange}`
  }
}

class HealEvent extends CombatEvent {
  constructor(
    public hp: number = 0,
    source?: string
  ) {
    super(source)
  }

  static id = 'heal' as const
  id = HealEvent.id

  getLabel() {
    return `${t(`COMBAT-EVENT-HEAL-LABEL`)} +${this.hp}`
  }
}

class MissEvent extends CombatEvent {
  static id = 'miss' as const
  id = MissEvent.id
}

class MoveEvent extends CombatEvent {
  static id = 'move' as const
  id = MoveEvent.id
}

class ImmuneEvent extends CombatEvent {
  static id = 'immune' as const
  id = ImmuneEvent.id
}

class HoldEvent extends CombatEvent {
  static id = 'hold' as const
  id = HoldEvent.id
}

class StanceEvent extends CombatEvent {
  constructor(
    public stanceName: string,
    source?: string
  ) {
    super(source)
  }

  static id = 'stance' as const
  id = StanceEvent.id

  getLabel() {
    return t(`EFFECT-${camelCaseToConstCase(this.stanceName)}-NAME`)
  }
}

type TCombatEvent =
  | AttackEvent
  | BleedEvent
  | BlockEvent
  | CombatActionEvent
  | CounterAttackEvent
  | DamageEvent
  | EvadeEvent
  | GenericEvent
  | HealEvent
  | HoldEvent
  | ImmuneEvent
  | MissEvent
  | MoveEvent
  | ParryEvent
  | PreventedEvent
  | ProtectedEvent
  | StanceEvent

export type { TCombatEvent }

export {
  AttackEvent,
  BleedEvent,
  BlockEvent,
  CombatActionEvent,
  CounterAttackEvent,
  DamageEvent,
  EvadeEvent,
  GenericEvent,
  HealEvent,
  HoldEvent,
  ImmuneEvent,
  MissEvent,
  MoveEvent,
  PreventedEvent,
  ParryEvent,
  ProtectedEvent,
  StanceEvent
}
