import type { ExpressionOptions } from '@actnone/eldrum-engine/models'
import type { DemoNpc } from '../npc'
import { Derivative, Protection } from '@actnone/eldrum-engine/models'

export class DemoNpcProtection extends Derivative<DemoNpc> {
  constructor(actor: DemoNpc) {
    super('protection', actor, DemoNpcProtection.defaultOptions)
  }

  public static defaultOptions: ExpressionOptions<Derivative> = {
    expressions: [Protection.armorSelector],
    postExpressions: [Protection.clampMinValue, Protection.round]
  }
}
