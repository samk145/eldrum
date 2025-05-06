import type { EditorArea } from '@actnone/eldrum-editor/dist/types'
import type { IReactionDisposer } from 'mobx'
import type { TMapPointType, TCoordinates } from '../../../../models/movement'
import type { TSizePerDimension } from '../../../../styles'
import type Game from '../../../../models/game'

import React from 'react'
import {
  TouchableOpacity,
  View,
  PanResponder,
  Animated,
  ScrollView,
  AccessibilityInfo,
  BackHandler,
  type NativeEventSubscription,
  type PanResponderInstance
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observable, computed, action, reaction } from 'mobx'
import { observer } from 'mobx-react'
import * as Svg from 'react-native-svg'
// @ts-expect-error: Missing type definitions for 'polygon-centroid'
import centroid from 'polygon-centroid'
import { withGameStore } from '../../../../contexts/stores'
import { size, dimensions } from '../../../../styles'
import { t } from '../../../../i18n'
import Movement from '../../../../models/movement'
import { Text } from '../../../units'
import Areas from './areas/areas'
import Labels from './labels/labels'
import Lines from './lines/lines'
import Locations from './locations/locations'
import PlayerLocation from './player-location/player-location'
import LocationList from './location-list/location-list'
import style from './world-map.style'
import AreaName from './area-name/area-name'
import MapBottomBar from './map-bottom-bar/map-bottom-bar'

const TRAVEL_INTERRUPTION_MESSAGE = 'Travel interrupted by encounter'

const AnimatedSvg = Animated.createAnimatedComponent(Svg.Svg)

const mapSizeMinimized: TSizePerDimension = {
  xlarge: 70,
  large: 60,
  medium: 55,
  small: 55,
  xsmall: 50,
  xxsmall: 50
}

const mapSize = {
  maximized: {
    width: dimensions.width,
    height: dimensions.height
  },
  minimized: {
    width: mapSizeMinimized[size],
    height: mapSizeMinimized[size]
  }
}

const reversed = {
  inputRange: [0, 1],
  outputRange: [1, 0]
}

type TWorldMapProps = {
  game: Game
}

type TCenter = {
  pan: Animated.ValueXY
  position: TCoordinates
}

type TPlane = { width: number; height: number }

@observer
class WorldMap extends React.Component<TWorldMapProps> {
  /**
   * Buffers coordinates using WorldMap.buffer. This is useful when
   * using WorldMap.bufferMap to expand the map dimensions since
   * all coordinates on the map will need to be slightly nudged
   * if the map has increased in size.
   *
   * @param {object} coordinates
   * @param {number} coordinates.x
   * @param {number} coordinates.y
   */
  static bufferCoordinates = (coordinates: TCoordinates) => {
    return {
      x: coordinates.x + WorldMap.buffer[size] / 2,
      y: coordinates.y + WorldMap.buffer[size] / 2
    }
  }

  constructor(props: TWorldMapProps) {
    super(props)

    const { area, location, route } = props.game.movement
    const center = WorldMap.getCenterPoints(
      area.dimensions,
      location.coordinates,
      mapSize[this.mode]
    )

    this.currentArea = props.game.movement.area

    this.center = {
      pan: new Animated.ValueXY(center.pan),
      position: center.position
    }

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          !(gestureState.dx === 0 && gestureState.dy === 0) &&
          !this.pendingPlayerLocationId &&
          !this.locked
        )
      },
      onPanResponderMove: (evt, gestureState) => {
        this.center.pan.setValue({
          x: this.center.position.x - gestureState.dx,
          y: this.center.position.y - gestureState.dy
        })

        this.panning = true
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.center.position.x = this.center.position.x - gestureState.dx
        this.center.position.y = this.center.position.y - gestureState.dy
        this.panning = false
      }
    })

    this.playerlocationAboutToChange = reaction(
      () => this.pendingPlayerLocationId,
      pendingPlayerLocationId => {
        // Move the centerpoint when traveling
        if (pendingPlayerLocationId) {
          if (this.pendingPlayerArea && this.pendingPlayerArea._id !== this.currentArea._id) {
            this.handleTravelToPendingArea()
          } else {
            this.handleTravelToPendingLocation()
          }
        } else {
          // Recenter when going back on a path from an encounter
          const isPlayerCentered =
            this.center.position.x === center.pan.x && this.center.position.y === center.pan.y
          if (!isPlayerCentered) {
            this.reCenterPlayer()
          }
        }
      },
      { name: 'WorldMapPlayerlocationAboutToChange' }
    )

    this.travelReaction = reaction(
      () => this.traveling,
      traveling => {
        // Maximize the map if traveling has been initialized
        if (traveling && this.mode !== 'maximized' && route !== null) {
          this.handleMaximize()
          // Minimize the map and re-center it after traveling has finished
        } else if (!traveling && !this.pathEncounter) {
          this.handleMinimize()
        }
      },
      { name: 'WorldMapTravelReaction' }
    )

    this.updateCurrentLocation = reaction(
      () => this.playerLocationId,
      playerLocationId => {
        if (!this.traveling) {
          this.reCenterPlayer()
        }

        if (this.playerLocation && this.mode === 'maximized') {
          AccessibilityInfo.announceForAccessibility(this.playerLocation.name)
        }
      },
      { name: 'WorldMapUpdateCurrentLocation' }
    )

    this.minimizeAfterEncounter = reaction(
      () => this.pathEncounter,
      pathEncounter => {
        !pathEncounter && this.handleMinimize()
      },
      { name: 'WorldMapMinimizeAfterEncounter' }
    )
  }

  componentWillUnmount() {
    // Dispose of reactions
    this.playerlocationAboutToChange()
    this.travelReaction()
    this.updateCurrentLocation()
    this.minimizeAfterEncounter()
  }

  setupPanResponder = () => {
    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          !(gestureState.dx === 0 && gestureState.dy === 0) &&
          !this.pendingPlayerLocationId &&
          !this.locked
        )
      },
      onPanResponderMove: (evt, gestureState) => {
        this.center.pan.setValue({
          x: this.center.position.x - gestureState.dx,
          y: this.center.position.y - gestureState.dy
        })

        this.panning = true
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.center.position.x = this.center.position.x - gestureState.dx
        this.center.position.y = this.center.position.y - gestureState.dy
        this.panning = false
      }
    })
  }

  @observable currentArea: EditorArea
  @observable selectedPointId: string | null = null
  @observable route: string[] = []
  @observable panning: boolean = false
  @observable locked: boolean = false
  @observable center: TCenter
  @observable playerCoordinates = new Animated.ValueXY(
    WorldMap.bufferCoordinates(this.props.game.movement.location.coordinates)
  )

  playerlocationAboutToChange: IReactionDisposer
  minimizeAfterEncounter: IReactionDisposer
  travelReaction: IReactionDisposer
  updateCurrentLocation: IReactionDisposer
  _panResponder: PanResponderInstance
  androidBackHandler?: NativeEventSubscription

  @computed get mode() {
    return this.props.game.puppeteer.mapMode
  }

  @computed get currentAreaParent() {
    const id = this.currentArea.parent

    return id ? this.props.game.getEntity('areas', id) : null
  }

  @computed get knownLocationsInParentArea() {
    const parentAreaMapData =
      this.currentAreaParent && this.mapData.find(d => d.area_id === this.currentArea.parent)

    return parentAreaMapData?.points.filter(point => point.isKnown).length
  }

  @computed get traveling() {
    return this.props.game.movement.traveling
  }

  @computed get playerLocationId() {
    return this.props.game.movement.locationId
  }

  @computed get playerLocation() {
    return this.props.game.movement.location
  }

  @computed get pendingPlayerLocationId() {
    return this.props.game.movement.pendingLocationId
  }

  @computed get pendingPlayerLocation() {
    return this.props.game.movement.pendingLocation
  }

  @computed get pendingPlayerArea() {
    return this.props.game.movement.pendingArea
  }

  @computed get playerArea() {
    return this.props.game.movement.area
  }

  @computed get pathEncounter() {
    return this.props.game.movement.pathEncounter
  }

  @computed get mapData() {
    return this.props.game.movement.mapData
  }

  @computed get mapIsAvailable() {
    return this.props.game.movement.mapIsAvailable
  }

  @computed get animateCenter() {
    return !this.panning
  }

  @computed get currentMapData() {
    const area = this.mapData.find(d => d.area_id === this.currentArea._id)

    return area
  }

  @computed get currentMapLocations() {
    const { currentMapData } = this

    return currentMapData ? currentMapData.points.filter(p => p.type === 'location') : []
  }

  @computed get currentMapAreas() {
    const { currentMapData } = this

    return currentMapData
      ? currentMapData.points.filter(p => ['sub-area', 'parent-area'].includes(p.type))
      : []
  }

  movePlayerCoordinates = async ({
    coordinates,
    animate = true
  }: {
    coordinates: TCoordinates
    animate?: boolean
  }) => {
    const bufferedCoordinates = WorldMap.bufferCoordinates(coordinates)

    if (animate) {
      Animated.timing(this.playerCoordinates, {
        toValue: bufferedCoordinates,
        duration: Movement.travelDuration,
        useNativeDriver: true
      }).start()
    } else {
      this.playerCoordinates.setValue(bufferedCoordinates)
    }
  }

  @action moveCenter = async ({
    dimensions,
    coordinates,
    animate = true
  }: {
    dimensions: TPlane
    coordinates: TCoordinates
    animate?: boolean
  }) => {
    const viewbox = mapSize[this.mode]
    const center = WorldMap.getCenterPoints(dimensions, coordinates, viewbox)

    if (this.center.position.x === center.pan.x && this.center.position.y === center.pan.y) {
      return
    }

    if (animate) {
      Animated.timing(this.center.pan, {
        toValue: {
          x: center.pan.x,
          y: center.pan.y
        },
        duration: Movement.travelDuration,
        useNativeDriver: true
      }).start()
    } else {
      this.center.pan.setValue(center.pan)
    }

    this.center.position = center.position
  }

  @action handleTravelToPendingLocation = async () => {
    const path = this.props.game.movement.currentPath

    if (this.mode === 'maximized' || !this.pathEncounter) {
      if (path && this.pendingPlayerArea && this.pendingPlayerLocation) {
        this.moveCenter({
          dimensions: this.pendingPlayerArea.dimensions,
          coordinates: this.pendingPlayerLocation.coordinates,
          animate: path.map
        })

        this.movePlayerCoordinates({
          coordinates: this.pendingPlayerLocation.coordinates,
          animate: path.map
        })
      }
    }

    if (this.pathEncounter) {
      this.handlePathEncounter()
    }
  }

  @action handleTravelToPendingArea = () => {
    if (!this.pendingPlayerArea) return

    if (this.pendingPlayerArea._id === this.currentArea.parent) {
      this.handleTravelToParentArea()
    } else if (this.pendingPlayerArea.parent === this.currentArea._id) {
      this.handleTravelToSubArea()
    }
  }

  @action handleTravelToSubArea = async () => {
    if (!this.pendingPlayerArea) return

    if (this.pathEncounter) {
      this.moveCenter({
        dimensions: this.currentArea.dimensions,
        coordinates: this.pendingPlayerArea.coordinates,
        animate: true
      })

      this.movePlayerCoordinates({
        coordinates: this.pendingPlayerArea.coordinates
      })

      this.handlePathEncounter()
    } else {
      await Promise.all([
        this.moveCenter({
          dimensions: this.currentArea.dimensions,
          coordinates: this.pendingPlayerArea.coordinates,
          animate: true
        }),
        this.movePlayerCoordinates({
          coordinates: this.pendingPlayerArea.coordinates
        })
      ])
    }
  }

  @action handleTravelToParentArea = async () => {
    if (!this.pendingPlayerArea || !this.pendingPlayerLocation) return

    await Promise.all([
      this.movePlayerCoordinates({
        coordinates: this.currentArea.coordinates,
        animate: false
      }),
      this.moveCenter({
        dimensions: this.pendingPlayerArea.dimensions,
        coordinates: this.currentArea.coordinates,
        animate: false
      })
    ])

    this.currentArea = this.pendingPlayerArea

    this.moveCenter({
      dimensions: this.currentArea.dimensions,
      coordinates: this.pendingPlayerLocation.coordinates,
      animate: true
    })

    this.movePlayerCoordinates({
      coordinates: this.pendingPlayerLocation.coordinates
    })

    if (this.pathEncounter) {
      this.handlePathEncounter()
    }
  }

  @action reCenterPlayer = () => {
    if (this.currentArea._id !== this.playerArea._id) {
      this.currentArea = this.playerArea
    }

    this.movePlayerCoordinates({
      coordinates: this.playerLocation.coordinates,
      animate: false
    })

    this.moveCenter({
      dimensions: this.playerArea.dimensions,
      coordinates: this.playerLocation.coordinates,
      animate: false
    })
  }

  @action resetBaseValues = () => {
    this.selectedPointId = null
    this.panning = false
    this.route = []
  }

  @action handleMaximize = async () => {
    if (this.currentArea._id !== this.playerArea._id) {
      this.currentArea = this.playerArea
    }

    await this.props.game.puppeteer.changeMapMode('maximized')

    await this.moveCenter({
      dimensions: this.playerArea.dimensions,
      coordinates: this.playerLocation.coordinates,
      animate: false
    })

    this.androidBackHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.handleMinimize()
      return true
    })

    this.locked = false
  }

  @action handleMinimize = async () => {
    await this.props.game.puppeteer.changeMapMode('minimized')

    await this.moveCenter({
      dimensions: this.playerArea.dimensions,
      coordinates: this.playerLocation.coordinates,
      animate: false
    })

    if (this.currentArea._id !== this.playerArea._id) {
      this.currentArea = this.playerArea
    }

    this.resetBaseValues()

    if (this.androidBackHandler) {
      this.androidBackHandler.remove()
    }
  }

  @action travelToLocation = async (id: string) => {
    const { travelToLocation } = this.props.game.movement
    const shouldUpdateCurrentArea = this.currentArea._id !== this.playerArea._id
    const animate = !shouldUpdateCurrentArea
    this.locked = true

    this.resetBaseValues()

    if (shouldUpdateCurrentArea) {
      this.currentArea = this.playerArea
    }

    await this.props.game.puppeteer.changeMapMode('maximized')

    await this.moveCenter({
      dimensions: this.playerArea.dimensions,
      coordinates: this.playerLocation.coordinates,
      animate
    })

    travelToLocation(id, false, true)
  }

  @action handleLocationSelection = (id: string) => {
    const { getShortestRoute } = this.props.game.movement

    this.selectedPointId = id
    this.route = getShortestRoute(this.playerLocationId, id, {
      mapOnly: true
    }).map(path => path._id)
  }

  @action handlePointPressOut = (type?: TMapPointType, id?: string) => {
    if (id === this.playerLocationId || this.locked) {
      return
    }

    if (!type && !this.selectedPointId) {
      return
    }

    if (id && type === 'location' && this.selectedPointId !== id) {
      this.handleLocationSelection(id)
    } else if (id && type === 'location' && this.selectedPointId === id) {
      this.travelToLocation(id)
    } else if (id && type === 'sub-area') {
      this.handleZoomIn(id)
    } else if (id && type === 'parent-area') {
      this.handleZoomOut(id)
    } else {
      this.resetBaseValues()
    }
  }

  @action handleLocationListButtonAction = (type: TMapPointType, id: string) => {
    if (type === 'location') {
      this.travelToLocation(id)
    } else if (type === 'sub-area') {
      this.handleZoomIn(id)
    } else if (type === 'parent-area') {
      this.handleZoomOut(id)
    }
  }

  @action handleZoomIn = async (id: string) => {
    const newArea = this.props.game.getEntity('areas', id)
    const newAreaMapData = this.mapData.find(d => d.area_id === newArea._id)
    const points = newAreaMapData?.points.map(point => point.coordinates)
    const coordinates = centroid(points)

    this.currentArea = newArea

    await this.moveCenter({
      dimensions: newArea.dimensions,
      coordinates,
      animate: false
    })
  }

  @action handleZoomOut = async (areaId: string) => {
    const { currentArea } = this
    const area = this.props.game.getEntity('areas', areaId)

    this.currentArea = area

    await this.moveCenter({
      dimensions: area.dimensions,
      coordinates: currentArea.coordinates,
      animate: false
    })

    this.resetBaseValues()
  }

  @action handleBottomBarZoomOut = () => {
    this.handleZoomOut(this.currentArea.parent)
  }

  @action handlePathEncounter = () => {
    if (this.mode === 'minimized') {
      this.locked = false
      // Animate the path encounter when we're in full map mode
    } else if (this.mode === 'maximized') {
      setTimeout(() => {
        this.playerCoordinates.stopAnimation()
        this.center.pan.stopAnimation()
        AccessibilityInfo.announceForAccessibility(TRAVEL_INTERRUPTION_MESSAGE)

        setTimeout(async () => {
          this.locked = false
          await this.props.game.puppeteer.changeMapMode('minimized')
          this.reCenterPlayer()
        }, Movement.pathEncounterHaltDuration)
      }, Movement.travelDuration / 2)
    }
  }

  /**
   * Retrieves an absolute center given a surface (dimensions),
   * coordinates and viewbox
   *
   * @param {object} dimensions
   * @param {number} dimensions.width
   * @param {number} dimensions.height
   * @param {object} coordinates
   * @param {number} coordinates.x
   * @param {number} coordinates.y
   * @param {object} viewbox - Dimensions of the viewbox surrounding the map
   * @param {number} viewbox.width
   * @param {number} viewbox.height
   */
  static getCenterPoints(dimensions: TPlane, coordinates: TCoordinates, viewbox: TPlane) {
    const zoom = WorldMap.zoomSize[size]

    const viewboxWidth = viewbox.width / zoom
    const viewboxHeight = viewbox.height / zoom

    const center = WorldMap.bufferCoordinates({
      x: -(viewboxWidth / 2) + coordinates.x,
      y: -(dimensions.height / 2) + coordinates.y - (viewboxHeight - dimensions.height) / 2
    })

    center.x = center.x * zoom
    center.y = center.y * zoom

    return {
      position: center,
      pan: center
    }
  }

  /**
   * Buffers area size using WorldMap.buffer. This is used to add
   * padding (buffer) to the map so that labels etc that belong to points
   * that are close to the edges of the map are not cut off.
   *
   * @param {object} dimensions
   * @param {number} dimensions.width
   * @param {number} dimensions.height
   */
  static bufferMap(dimensions: TPlane) {
    return {
      width: dimensions.width + WorldMap.buffer[size],
      height: dimensions.height + WorldMap.buffer[size]
    }
  }

  /**
   * The size in pixel with which the map will be increased when buffered.
   *
   * @namespace buffer
   */
  static buffer: TSizePerDimension = {
    xlarge: 1000,
    large: 800,
    medium: 300,
    small: 300,
    xsmall: 200,
    xxsmall: 200
  }

  /**
   * The multiplier to
   *
   * @namespace buffer
   */
  static zoomSize: TSizePerDimension = {
    xlarge: 1.4,
    large: 1.3,
    medium: 1,
    small: 1,
    xsmall: 1,
    xxsmall: 1
  }

  getTransform() {
    const { center } = this

    return {
      transform: [
        { translateX: center.pan.x.interpolate(reversed) },
        { translateY: center.pan.y.interpolate(reversed) }
      ]
    }
  }

  getViewBox(mapDimensions: TPlane) {
    const zoomSize = WorldMap.zoomSize[size]

    return `0 0 ${mapDimensions.width / zoomSize} ${mapDimensions.height / zoomSize}`
  }

  render() {
    const {
      currentArea,
      playerArea,
      mode,
      currentMapData,
      currentMapLocations,
      currentMapAreas,
      playerLocation,
      pendingPlayerLocationId,
      playerCoordinates,
      selectedPointId,
      route
    } = this
    const mapDimensions = WorldMap.bufferMap(currentArea.dimensions)
    const { screenReaderEnabled } = this.props.game._ui
    const shouldFocusAreaName = !this.locked || !this.traveling

    if (!this.mapData || !this.props.game.character.alive || !currentMapData) {
      return null
    }

    const panHandlers = mode === 'maximized' ? this._panResponder.panHandlers : {}

    return (
      <SafeAreaView pointerEvents="box-none" style={style.wrapper}>
        <View
          style={[
            mode === 'minimized' ? style.mapMinimized : style.mapMaximized,
            mode === 'minimized' && mapSize.minimized,
            screenReaderEnabled && mode === 'minimized' && { backgroundColor: 'rgba(0,0,0,1)' }
          ]}
        >
          {!screenReaderEnabled && (
            <AnimatedSvg
              style={this.getTransform()}
              {...panHandlers}
              width={mapDimensions.width}
              height={mapDimensions.height}
              viewBox={this.getViewBox(mapDimensions)}
            >
              <Svg.Rect
                onPress={() => this.handlePointPressOut()}
                fill="black"
                fillOpacity={mode === 'maximized' ? 0 : 0.3}
                width="100%"
                height="100%"
              />

              <Lines
                lines={currentMapData.lines}
                route={route}
                buffer={WorldMap.bufferCoordinates}
              />

              {(currentArea._id === playerArea._id || !!pendingPlayerLocationId) && (
                <PlayerLocation coordinates={playerCoordinates} mode={mode} />
              )}

              <Locations
                playerLocation={playerLocation}
                locations={currentMapLocations}
                selectedPointId={selectedPointId}
                buffer={WorldMap.bufferCoordinates}
                onPressOut={this.handlePointPressOut}
              />

              <Areas
                playerLocation={playerLocation}
                areas={currentMapAreas}
                buffer={WorldMap.bufferCoordinates}
                onPressOut={this.handlePointPressOut}
              />

              {mode === 'maximized' && (
                <Labels
                  points={currentMapData.points}
                  mode={mode}
                  buffer={WorldMap.bufferCoordinates}
                  playerLocation={playerLocation}
                />
              )}
            </AnimatedSvg>
          )}

          {screenReaderEnabled && mode === 'maximized' && (
            <ScrollView style={style.locationList} onAccessibilityEscape={this.handleMinimize}>
              <LocationList
                locked={this.locked}
                playerArea={playerArea}
                playerLocation={playerLocation}
                points={currentMapData.points}
                action={this.handleLocationListButtonAction}
                getShortestRoute={this.props.game.movement.getShortestRoute}
              />
            </ScrollView>
          )}

          {mode === 'minimized' && (
            <TouchableOpacity
              disabled={this.traveling}
              accessible={!this.traveling || !this.locked}
              accessibilityRole="button"
              accessibilityState={{ disabled: this.traveling }}
              touchSoundDisabled={true}
              style={style.maximizeButton}
              onPress={this.handleMaximize}
            >
              {screenReaderEnabled && (
                <Text style={style.maximizeButtonLabel}>{t('MAP-OPEN-BUTTON-LABEL')}</Text>
              )}
            </TouchableOpacity>
          )}

          {mode === 'maximized' && (
            <AreaName currentAreaId={currentArea._id} shouldFocus={shouldFocusAreaName} />
          )}

          {mode === 'maximized' && !pendingPlayerLocationId && (
            <MapBottomBar
              knownLocationsInParentArea={this.knownLocationsInParentArea}
              currentAreaParent={this.currentArea?.parent}
              handleMinimize={this.handleMinimize}
              handleZoomOut={this.handleBottomBarZoomOut}
              mapDataLength={this.mapData?.length}
              reCenterPlayer={this.reCenterPlayer}
            />
          )}
        </View>
      </SafeAreaView>
    )
  }
}

export default withGameStore(WorldMap)
