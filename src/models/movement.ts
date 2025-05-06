import type Game from './game'
import type {
  EditorPathEncounter,
  EditorPath,
  EditorLocation,
  EditorArea,
  EditorCondition
} from '@actnone/eldrum-editor/dist/types'

import { observable, computed, action, reaction } from 'mobx'
import { logger } from '../helpers/logger'

type TCoordinates = {
  x: number
  y: number
}

type TMapPointType = 'location' | 'sub-area' | 'parent-area'

type TMapPoint = {
  type: TMapPointType
  label: string
  id: string
  coordinates: TCoordinates
  isKnown: boolean
}

type TMapLine = {
  id: string
  from: { coordinates: TCoordinates }
  to: { coordinates: TCoordinates }
}

export class Movement {
  constructor(public _game: Game) {
    this.locationId = _game._default.movement.locationId
    this.pendingLocationId = _game._default.movement.pendingLocationId
    this.currentPathId = _game._default.movement.currentPathId
    this.pathEncounterId = _game._default.movement.pathEncounterId
  }

  @observable locationId: string
  @observable pendingLocationId: string | null
  @observable currentPathId: string | null
  @observable pathEncounterId: string | null
  @observable traveling = false
  @observable route: EditorPath[] | null = null

  @computed get location(): EditorLocation {
    return this._game.getEntity('locations', this.locationId)
  }

  @computed get currentPath(): EditorPath | null {
    return this.currentPathId ? this._game.getEntity('paths', this.currentPathId) : null
  }

  @computed get area(): EditorArea {
    return this._game.getEntity('areas', this.location.area)
  }

  @computed get parentArea(): EditorArea | null {
    return this.area ? this._game.getEntity('areas', this.area.parent) : null
  }

  @computed get pendingLocation(): EditorLocation | null {
    return this.pendingLocationId ? this._game.getEntity('locations', this.pendingLocationId) : null
  }

  @computed get pendingArea(): EditorArea | null {
    return this.pendingLocation ? this._game.getEntity('areas', this.pendingLocation.area) : null
  }

  @computed get pathEncounter() {
    return this.pathEncounterId && this.currentPath
      ? this.currentPath.encounters.find(e => e._id === this.pathEncounterId)
      : undefined
  }

  @computed get movementOptions() {
    const { localPaths } = this
    const { statistics, scene } = this._game
    const lastSeenLocation = statistics.getRecord('lastSeenLocation')

    if (scene.type !== 'location') {
      return []
    }

    const paths = localPaths
      .filter(path => {
        const hasVisitedLocation = !!statistics.getRecord('seenLocations', path.to)

        return !!(!path.map || !hasVisitedLocation)
      })
      .sort((a, b) => {
        if (a.to === lastSeenLocation) {
          return 99
        } else if (b.to === lastSeenLocation) {
          return -1
        } else if (a.weight < b.weight) {
          return -1
        } else if (a.weight < b.weight) {
          return 1
        } else {
          return 0
        }
      })

    return paths
  }

  @computed get localPaths() {
    return this.getLocationPaths(this.location._id)
  }

  @computed get mapIsAvailable() {
    const localPathsWithMapDisplay = this.localPaths.filter(path => path.map).length > 0
    const { statistics, scene, combat, character } = this._game
    const lastSeenLocation = statistics.getRecord('lastSeenLocation')

    if (!localPathsWithMapDisplay) {
      return false
    } else if (!lastSeenLocation) {
      return false
    } else if (scene.type !== 'location') {
      return false
    } else if (combat) {
      return false
    } else if (!character.alive) {
      return false
    }

    return true
  }

  /**
   * Keeps track of locations and paths that are currently
   * available to the player.
   *
   * @return {object} An object containing arrays of available location and path ids
   */
  @computed get locationsAndPaths() {
    const { _game, locationId } = this
    const availablePaths: string[] = []
    const availableLocations = [locationId]
    const locationsToParse: Set<string> = new Set<string>([locationId])
    const parsedLocations: Set<string> = new Set<string>()

    while (locationsToParse.size > parsedLocations.size) {
      locationsToParse.forEach(id => {
        const hasBeenParsed = parsedLocations.has(id)

        if (!hasBeenParsed) {
          const locationPaths = this.getLocationPaths(id)

          locationPaths.forEach(path => {
            const hasSeen = !!_game.statistics.getRecord('seenLocations', path.from)
            const shouldBeVisibleToPlayer = path.from === locationId || hasSeen

            if (shouldBeVisibleToPlayer && path.map) {
              const isAlreadyAvailable = availableLocations.includes(path.to)
              const inQueue = locationsToParse.has(path.to)

              if (!isAlreadyAvailable) {
                availableLocations.push(path.to)
              }

              if (!inQueue) {
                locationsToParse.add(path.to)
              }

              availablePaths.push(path._id)
            }
          })

          parsedLocations.add(id)
        }
      })
    }

    return {
      locations: availableLocations,
      paths: availablePaths
    }
  }

  @computed get mapData() {
    const { getEntity } = this._game
    const { locationsAndPaths } = this

    const areas = locationsAndPaths.locations.reduce((areas: EditorArea[], locationId) => {
      const areaId: string = getEntity('locations', locationId).area

      if (!areas.find(a => a._id === areaId)) {
        const area = getEntity('areas', areaId)
        areas.push(area)
      }

      return areas
    }, [])

    const data = areas.map(area => {
      const { statistics } = this._game
      const { locations, paths } = locationsAndPaths

      const points = locations.reduce((points: TMapPoint[], id) => {
        const location = getEntity('locations', id)

        // Bail if this location doesn't belong to the area being processed
        if (location.area !== area._id) {
          return points
        }

        points.push({
          type: 'location',
          label: location.name,
          id: location._id,
          coordinates: location.coordinates,
          isKnown: !!statistics.getRecord('seenLocations', id) || this.location._id === id
        })

        return points
      }, [])

      const lines = paths.reduce((lines: TMapLine[], id) => {
        const path = getEntity('paths', id)
        const fromLocation = getEntity('locations', path.from)
        const toLocation = getEntity('locations', path.to)

        // Bail if this path has nothing to do with the area being processed
        if (fromLocation.area !== area._id && toLocation.area !== area._id) {
          return lines
        }

        const toArea = areas.find(a => a._id === toLocation.area)!
        const fromArea = areas.find(a => a._id === fromLocation.area)!
        const knownArea = !!this._game.statistics.getRecord('seenAreas', toArea._id)

        if (
          (fromArea._id === area._id && toArea._id === area._id) || // Both locations are in the area
          (fromArea._id === area._id && toArea.parent === area._id) || // From-location is in a sub-area
          (fromArea._id !== area._id && toArea._id === area._id && fromArea.parent === area._id) // To-location is in a sub-area
        ) {
          lines.push({
            id: path._id,
            from: {
              coordinates:
                fromLocation.area !== area._id ? fromArea.coordinates : fromLocation.coordinates
            },
            to: {
              coordinates:
                toLocation.area !== area._id ? toArea.coordinates : toLocation.coordinates
            }
          })

          if (toArea._id !== area._id) {
            points.push({
              type: 'sub-area',
              label: toArea.name,
              id: toArea._id,
              coordinates: toArea.coordinates,
              isKnown: knownArea
            })
          }
        } else if (
          fromArea._id === area._id &&
          area.parent === toArea._id // To-location is in parent area
        ) {
          const toCoordinates = {
            x: fromLocation.coordinates.x + (toLocation.coordinates.x - fromArea.coordinates.x),
            y: fromLocation.coordinates.y + (toLocation.coordinates.y - fromArea.coordinates.y)
          }

          lines.push({
            id: path._id,
            from: {
              coordinates: fromLocation.coordinates
            },
            to: {
              coordinates: toCoordinates
            }
          })

          points.push({
            type: 'parent-area',
            label: toArea.name,
            id: toArea._id,
            coordinates: toCoordinates,
            isKnown: knownArea
          })
        }

        return lines
      }, [])

      return {
        area_id: area._id,
        parent_id: area.parent || null,
        points,
        lines
      }
    })

    return data
  }

  @computed get state() {
    const { location, _game } = this
    const state = location.states.find(
      state => !state.conditions || (state.conditions && _game.passesConditions(state.conditions))
    )

    if (!state) {
      logger.warn(
        "Couldn't find an active location state. Defaulting to the location's first state."
      )
    }

    return state || location.states[0]
  }

  /**
   * Action: Go to location
   */
  @action goToLocation = (id: string) => {
    this._game.saveCurrentState(['scene', 'node', 'location', 'area'])

    // Move to the new location
    this.locationId = id
    this.resetPathVars()
    this._game.scene.resetSceneVars()
  }

  /**
   * Action: Travel to location
   *
   * Moves the player from the current location to the target location,
   * using the shortest available route.
   */
  @action travelToLocation = async (target: string, anyRoute = false, mapOnly = false) => {
    this.route = this.getShortestRoute(this.location._id, target, {
      anyRoute,
      mapOnly
    })
    this.traveling = true

    for (const path of this.route) {
      try {
        await this.usePath(path)

        if (path.to === target) {
          this.resetTravelVars()
        }
      } catch (error) {
        this.resetTravelVars()
        break
      }
    }
  }

  @action resetTravelVars = () => {
    this.traveling = false
    this.route = null
  }

  @action resetPathVars = () => {
    this.pathEncounterId = null
    this.pendingLocationId = null
    this.currentPathId = null
  }

  /**
   * Action: Execute path option
   *
   * Executes a single path/movement option (i.e. uses a path)
   */
  @action executePathOption = async (path: EditorPath) => {
    this.traveling = true
    this._game.statistics.record('usedMovementOptions', path._id)

    try {
      await this.usePath(path)
    } catch (error) {
    } finally {
      this.resetTravelVars()
    }
  }

  /**
   * Action: Use path
   *
   * Checks for path encounters and availability before
   * moving on to the new location.
   */
  @action usePath = (path: EditorPath) => {
    return new Promise<void>((resolve, reject) => {
      this.currentPathId = path._id
      this.pendingLocationId = path.to

      if (this._game.puppeteer.modal) {
        this._game.puppeteer.closeModal()
      }

      const pathEncounter = this.getPathEncounter(path.encounters)

      if (pathEncounter) {
        this._game.saveCurrentState(['scene', 'node', 'location', 'area'])
        this.pathEncounterId = pathEncounter._id
        this._game.scene.resetSceneVars()
        return reject(new Error('Travel interrupted by path encounter'))
      } else {
        // Use timeout to allow the travel animation to finish before actually moving.
        // We're adding a small time buffer when switching areas because otherwise the
        // move to the next location will trigger the next animation before the previous
        // has finished which causes a glitch when moving from parent area to sub area.
        const duration =
          this.pendingArea && this.pendingArea._id !== this.area._id
            ? Movement.travelDuration + 50
            : Movement.travelDuration

        setTimeout(
          () => {
            this._game.saveCurrentState(['path'])
            this.goToLocation(path.to)
            return resolve()
          },
          this.mapIsAvailable && path.map ? duration : 0
        )
      }
    })
  }

  static travelDuration = 1250

  static pathEncounterHaltDuration = 250

  /**
   * Reaction: Location change
   */
  locationChange = reaction(
    () => this.locationId,
    locationId => {
      this._game.questLog.evaluateQuests()
    },
    { name: 'locationChange', fireImmediately: true }
  )

  /**
   * Reaction: Path encounter change
   */
  encounterChange = reaction(
    () => this.pathEncounter,
    pathEncounter => {
      if (pathEncounter) {
        this._game.questLog.evaluateQuests()
      }
    },
    { name: 'encounterChange' }
  )

  getPathEncounter(pathEncounters: EditorPathEncounter[] = []) {
    return this._game.getEntityByConditions<EditorPathEncounter>(
      pathEncounters,
      pathEncounter => {
        const previousEncounters = this._game.statistics.getRecord(
          'seenPathEncounters',
          pathEncounter._id
        )

        if (pathEncounter.maxAccounts && previousEncounters >= pathEncounter.maxAccounts) {
          return false
        } else {
          return true
        }
      },
      true
    )
  }

  /**
   * Helper: Calculates and returns the closest way between two
   * locations. Only paths that the user has taken previously will
   * be used in the route creation.
   *
   * @param {string}  source - The source (starting point) location id
   * @param {string}  target - The target location id
   * @param {object}  options
   * @param {boolean} [options.anyRoute] - Whether or not to use all paths or only paths
   *                                    that are available to the player.
   * @param {boolean} [options.mapOnly] - Whether to include only paths that are not displayed on maps
   * @return {array} Route - A list of path objects
   */
  getShortestRoute = (
    source: string,
    target: string,
    options: { anyRoute?: boolean; mapOnly?: boolean } = { anyRoute: false, mapOnly: false }
  ) => {
    const { _game } = this
    const graph = new Graph()
    const paths: EditorPath[] = options.mapOnly
      ? _game.getEntities('paths').filter((p: EditorPath) => p.map)
      : _game.getEntities('paths')

    paths.forEach(path => {
      const baseConditions: EditorCondition[] = []
      let pathAvailabilityConditions: EditorCondition[] | EditorCondition[][] = []

      if (!options.anyRoute) {
        baseConditions.push({
          type: 'hasSeenLocation',
          parameters: [path.to]
        })

        // Since the location source might not yet have been marked as "seen"
        // since that happens once the player exits a location, we won't
        // add that condition.
        if (source !== path.from) {
          baseConditions.push({
            type: 'hasSeenLocation',
            parameters: [path.from]
          })
        }

        pathAvailabilityConditions = path.availability
      }

      if (
        _game.passesConditions(baseConditions) &&
        _game.passesConditions(pathAvailabilityConditions)
      ) {
        graph.addEdge(path.from, path.to)
      }
    })

    const locationIds = shortestPath(graph, source, target)

    const route = locationIds
      ? locationIds.reduce((route: EditorPath[], id, index) => {
          if (index < locationIds.length - 1) {
            const path = paths.find(path => path.from === id && path.to === locationIds[index + 1])

            if (path) {
              route.push(path)
            }
          }
          return route
        }, [])
      : []

    return route
  }

  /**
   * Helper: Returns available paths that lead from the given location
   *
   * @param  {string} locationId - Location id
   * @return {array} An array containing the path objects
   */
  getLocationPaths = (locationId: string): EditorPath[] => {
    const { _game } = this

    return _game
      .getEntities('paths')
      .filter(
        (path: EditorPath) => path.from === locationId && _game.passesConditions(path.availability)
      )
  }
}

/**
 * Helper: Creates an unweighted graph
 * See https://stackoverflow.com/a/32527538/930998
 */
class Graph {
  neighbors: Record<string, string[]> = { u: [], v: [] }

  addEdge = (u: string, v: string) => {
    const { neighbors } = this

    if (neighbors[u] === undefined) {
      neighbors[u] = []
    }

    neighbors[u].push(v)

    if (neighbors[v] === undefined) {
      neighbors[v] = []
    }

    neighbors[v].push(u)
  }
}

/**
 * Helper: Finds the shortest path between two targets.
 * See https://stackoverflow.com/a/32527538/930998
 */
function shortestPath(graph: Graph, source: string, target: string) {
  if (source === target) {
    return []
  }

  const queue: string[] = [source]
  const visited: Record<string, boolean> = { source: true }
  const predecessor: Record<string, string> = {}
  let tail = 0

  while (tail < queue.length) {
    let u = queue[tail++]
    const neighbors = graph.neighbors[u]

    if (!neighbors) {
      return []
    }

    for (let i = 0; i < neighbors.length; ++i) {
      const v = neighbors[i]

      if (visited[v]) {
        continue
      }

      visited[v] = true

      if (v === target) {
        const path: string[] = [v]

        while (u !== source) {
          path.push(u)
          u = predecessor[u]
        }
        path.push(u)
        path.reverse()
        return path
      }
      predecessor[v] = u
      queue.push(v)
    }
  }
}

export type { TMapPoint, TMapPointType, TMapLine, TCoordinates }
export default Movement
