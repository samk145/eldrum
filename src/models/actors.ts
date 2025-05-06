import type { EditorNpc, EditorNpcTemplate } from '@actnone/eldrum-editor/dist/types'
import type { Entries } from 'type-fest'
import type SaveDataNpc from './database/schemas/save/save-data/save-data-npc'
import type Npc from './character/npc'
import type { AttributeValues, TAttribute } from './character/attributes'
import type Game from './game'
import { action, observable } from 'mobx'
import { clampBetween } from '../helpers/misc'

export class Actors<TNpcActor extends Npc = Npc> {
  constructor(
    private readonly game: Game,
    public readonly createNpc: (defaultProps: EditorNpc, storedProps?: SaveDataNpc) => TNpcActor
  ) {}

  @observable npcs: TNpcActor[] = []

  getNpc = (id: string) => {
    const npc = this.npcs.find(npc => npc._id === id)

    if (!npc) {
      throw new Error(`NPC with id "${id}" not found`)
    }

    return npc
  }

  @action spawn = (storedNpcs: SaveDataNpc[] = []) => {
    const { game } = this
    const { scene } = game.scene

    if (scene.npcs?.length) {
      this.npcs = scene.npcs.reduce((npcs: TNpcActor[], id) => {
        const editorNpc = game.getEntity('npcs', id)

        let editorNpcTemplate = editorNpc.template
          ? game.getEntity('npcTemplates', editorNpc.template)
          : undefined
        editorNpcTemplate =
          editorNpcTemplate && editorNpc.templateLevel !== undefined
            ? Actors.scaleNpcTemplate(editorNpcTemplate, editorNpc.templateLevel)
            : editorNpcTemplate

        const storedProps = storedNpcs.find(npc => npc._id === id)
        const defaultProps: EditorNpc = { ...editorNpcTemplate, ...editorNpc } as EditorNpc
        const npc = this.createNpc(defaultProps, storedProps)

        npcs.push(npc)

        return npcs
      }, [])
    } else {
      this.npcs = []
    }
  }

  static scaleNpcTemplate = (
    npcTemplate: EditorNpcTemplate,
    outputLevel: number
  ): EditorNpcTemplate => {
    if (npcTemplate.level === outputLevel) {
      return npcTemplate
    }

    const scaledAttributes = Actors.scaleAttributes(
      {
        strength: npcTemplate.strength,
        charisma: npcTemplate.charisma,
        resilience: npcTemplate.resilience,
        agility: npcTemplate.agility,
        perception: npcTemplate.perception
      },
      outputLevel
    )

    return {
      ...npcTemplate,
      ...scaledAttributes,
      level: outputLevel,
      armor: Actors.scaleValue(npcTemplate.armor, npcTemplate.level, outputLevel, Math.ceil),
      maxActionPoints: Actors.scaleActionPoints(
        npcTemplate.maxActionPoints,
        npcTemplate.level,
        outputLevel
      ),
      attackSets: npcTemplate.attackSets?.map(attackSet => {
        return attackSet.map(attack => {
          return {
            ...attack,
            damage: {
              min: Actors.scaleValue(attack.damage.min, npcTemplate.level, outputLevel, Math.ceil),
              max: Actors.scaleValue(attack.damage.max, npcTemplate.level, outputLevel, Math.ceil)
            }
          }
        })
      })
    }
  }

  static scaleValue = (
    value: number,
    inputLevel: number,
    outputLevel: number,
    modifier: (output: number) => number = Math.round
  ): number => {
    const result = (value * outputLevel) / inputLevel

    return modifier ? modifier(result) : result
  }

  static scaleActionPoints = (actionPoints: number, inputLevel: number, outputLevel: number) => {
    if (inputLevel === 1 && actionPoints === 1) {
      if (outputLevel < 5) {
        return 1
      } else if (outputLevel < 10) {
        return 2
      } else {
        return 3
      }
    }

    return clampBetween(
      Actors.scaleValue(actionPoints, inputLevel, outputLevel, value => {
        return value > 1.25 && value < 1.5 ? 2 : Math.round(value)
      }),
      1,
      5
    )
  }

  /*
   * Scales actor attributes based on output level
   *
   * Each stat point is increased/decreased to match the output level.
   * The remaining stat points are then distributed in the order of the size
   * of the inout attributes.
   */
  static scaleAttributes = (
    npcAttributes: AttributeValues,
    outputLevel: number
  ): AttributeValues => {
    const nrOfAttributes = Object.keys(npcAttributes).length
    const distributedStatPoints = Object.values(npcAttributes).reduce(
      (a, b) => a + b,
      -nrOfAttributes
    )
    const newStatPoints = outputLevel - 1

    let remainingStatPoints = 0

    const newAttributes: AttributeValues = (
      Object.entries(npcAttributes) as Entries<typeof npcAttributes>
    ).reduce(
      (newAttributes, [key, value]) => {
        const sanitizedValue = value - newAttributes[key] // Remove the initial baseline which is 1 for all attributes
        const attributeDistribution = sanitizedValue / distributedStatPoints
        const newValue = isNaN(attributeDistribution)
          ? newStatPoints / 5
          : newStatPoints * attributeDistribution
        const fraction = newValue % 1
        const adjustedNewValue = Math.floor(newValue)

        remainingStatPoints += fraction
        newAttributes[key] += adjustedNewValue

        return newAttributes
      },
      {
        strength: 1,
        charisma: 1,
        resilience: 1,
        agility: 1,
        perception: 1
      }
    )

    const attributesDistributionOrder = (
      Object.entries(npcAttributes) as Entries<typeof npcAttributes>
    )
      .sort((a, b) => b[1] - a[1])
      .map(a => a[0])

    while (remainingStatPoints >= 1) {
      for (const key in newAttributes) {
        if (remainingStatPoints >= 1 && key === attributesDistributionOrder[0]) {
          newAttributes[key as TAttribute]++
          remainingStatPoints--
          attributesDistributionOrder.shift()
          break
        }
      }
    }

    return newAttributes
  }
}
