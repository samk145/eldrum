import type { Npc } from '../character/npc'
import type SaveDataArena from '../database/schemas/save/save-data/save-data-arena'
import type SaveDataArenaChallenge from '../database/schemas/save/save-data/save-data-arena-challenge'
import type { Game } from '../game'
import { analytics } from '../../helpers/analytics'
import { ArenaChallenge } from './arena-challenge'
import { action, observable } from 'mobx'
import { randomFromList } from '../../helpers/misc'
import { SaveType } from '../database/schemas/save'

export interface IArenaGenerics {
  Game: Game
  Npc: Npc
}

export class Arena<G extends IArenaGenerics = IArenaGenerics> {
  constructor(
    private readonly game: G['Game'],
    private readonly storedProps?: SaveDataArena
  ) {
    if (storedProps && storedProps.currentTier > 0) {
      this.currentTier = storedProps.currentTier
    }
  }

  @observable currentTier: number = 1
  @observable currentTierChallenges?: ArenaChallenge[]

  createChallenges = (tier: number, quantity = Arena.challengesPerTier) => {
    const editorChallenges = this.game._content.settings.arena?.challenges || []

    const editorChallengesForTier = editorChallenges.filter(challenge =>
      challenge.conditions ? this.game.passesConditions(challenge.conditions) : true
    )

    const challenges = new Array(quantity)
      .fill(undefined)
      .reduce((challenges: ArenaChallenge[]) => {
        let attempts = 5

        while (attempts > 0) {
          const randomChallenge = randomFromList(editorChallengesForTier)

          if (challenges.some(challenge => challenge?._id === randomChallenge._id)) {
            attempts--

            if (attempts === 0) {
              challenges.push(new ArenaChallenge(this.game, tier, randomChallenge))
            }
          } else {
            challenges.push(new ArenaChallenge(this.game, tier, randomChallenge))
            attempts = 0
          }
        }

        return challenges
      }, [])

    return challenges
  }

  restoreChallenges = () => {
    const storedChallenges = this.storedProps?.challenges || []
    const challengeQuantity = Math.max(storedChallenges.length, Arena.challengesPerTier)
    const challenges: ArenaChallenge[] = []

    storedChallenges.forEach(storedChallenge => {
      const editorChallenge = this.game._content.settings.arena?.challenges.find(
        challenge => challenge._id === storedChallenge._id
      )

      if (editorChallenge) {
        challenges.push(
          new ArenaChallenge(this.game, this.currentTier, editorChallenge, storedChallenge)
        )
      }
    })

    if (challenges.length < challengeQuantity) {
      const newChallenges = this.createChallenges(
        this.currentTier,
        challengeQuantity - challenges.length
      )

      challenges.push(...newChallenges)
    }

    this.currentTierChallenges = challenges
  }

  getMaxNumberOfChallenges = (challenges: SaveDataArenaChallenge[] | ArenaChallenge[]) => {
    return (
      challenges.filter(challenge => challenge.defeated === false).length + Arena.challengesPerTier
    )
  }

  resetChallenges = () => {
    this.currentTierChallenges = this.createChallenges(this.currentTier)
  }

  resetPristineChallenges = () => {
    if (!this.currentTierChallenges) {
      return
    }

    this.currentTierChallenges = this.currentTierChallenges.map(challenge => {
      if (challenge.defeated === undefined) {
        return this.createChallenges(this.currentTier, 1)[0]
      }

      return challenge
    })
  }

  @action startCombat = async (challenge: ArenaChallenge) => {
    const { game } = this

    const playerWon = await game.engageInCombat({
      npcParticipants: challenge.opponents.map(participant => {
        const npc = game.actors.createNpc(participant.npc)

        npc.experience = 0 // Experience is gained from the challenge

        return {
          npc,
          healthLimit: participant.healthLimit,
          startingRow: participant.startingRow
        }
      })
    })

    challenge.defeated = playerWon

    if (playerWon) {
      game.character.changeGold(challenge.gold)
      game.character.gainExperience(challenge.experience)
    } else {
      this.currentTierChallenges?.push(this.createChallenges(this.currentTier, 1)[0])
    }

    if (this.shouldMoveToNextTier()) {
      this.bumpTier()

      if (game.character.alive) {
        await game._play.saveGame(SaveType.auto)
      }
    }
  }

  @action bumpTier = () => {
    this.increaseTier()

    analytics.event('Reached Arena Tier', {
      tier: this.currentTier
    })
  }

  @action increaseTier = () => {
    this.setTier(this.currentTier + 1)
  }

  @action decreaseTier = () => {
    this.setTier(this.currentTier - 1)
  }

  @action setTier = (tier: number) => {
    if (tier < 1) {
      tier = 1
    }

    this.currentTier = tier
    this.currentTierChallenges = this.createChallenges(this.currentTier)
  }

  get defeatedIncurrentTier() {
    return this.currentTierChallenges
      ? this.currentTierChallenges.filter(challenge => challenge.defeated)
      : []
  }

  shouldMoveToNextTier() {
    return (
      this.defeatedIncurrentTier.length === Arena.challengesPerTier &&
      this.currentTier < Arena.maxTier
    )
  }

  static maxTier = 100
  static challengesPerTier = 5
}
