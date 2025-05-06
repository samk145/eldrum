import React, {
  memo,
  useMemo,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  useCallback
} from 'react'
import { FlatList, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LinearGradient } from 'expo-linear-gradient'
import { variables } from '../../../styles'
import { useStores, useConfig } from '../../../contexts/stores'
import { AccessType } from '../../../stores/purchase'
import { type Save as DatabaseSave } from '../../../models/database/schemas/save'
import { formatTimestamp } from '../../../helpers/misc'
import { Button } from '../../units/button/button'
import { RoundButton } from '../../units/round-button/round-button'
import { Text } from '../../units/text/text'
import { AlertCardModal, type IAlertButton } from '../../units/alert-card-modal/alert-card-modal'
import { LimitReachedAlert } from '../limit-reached-alert/limit-reached-alert'
import { UpgradeAlert } from '../upgrade-alert/upgrade-alert'
import SaveContextualMenu from './save-contextual-menu'
import Save from './save'
import style from './playthrough.style'
import { Icon } from '../../units'

const { colors } = variables

type TPlaythroughSlotsProps = {
  playthrough: DatabaseSave[]
  hideTitle?: boolean
  hideMostRecent?: boolean
  deleteButton?: boolean
  enableContextualMenu?: boolean
}

export interface IPlaythroughInstance {
  scrollToTop: () => void
}

const Playthrough = forwardRef<IPlaythroughInstance, TPlaythroughSlotsProps>(
  (
    {
      playthrough,
      hideTitle = false,
      hideMostRecent = false,
      deleteButton = true,
      enableContextualMenu = false
    }: TPlaythroughSlotsProps,
    ref
  ) => {
    const { t, i18n } = useTranslation()
    const config = useConfig()
    const gameId = playthrough[0].saveData?._id
    const { saves, purchase, play } = useStores()
    const [selectedSave, setSelectedSave] = useState<DatabaseSave>(playthrough[0])
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false)
    const [contextualMenuVisible, setContextMenuVisible] = useState(false)
    const [rewindVisible, setRewindVisible] = useState(false)
    const [limitReachedVisible, setLimitReachedVisible] = useState(false)
    const [deletePlaythroughVisible, setDeletePlaythroughVisible] = useState(false)
    const handleLongPress = (save: DatabaseSave) => {
      setSelectedSave(save)
      setContextMenuVisible(true)
    }
    const hideUpgradeModal = () => setUpgradeModalVisible(false)
    const hideContext = () => setContextMenuVisible(false)
    const hideRewindModal = () => setRewindVisible(false)
    const hideLimitReached = () => setLimitReachedVisible(false)
    const hideDeletePlaythrough = () => setDeletePlaythroughVisible(false)
    const scrollView = useRef<FlatList>(null)
    const startDate = useMemo(
      () => playthrough.find(save => !!save.saveData?.startDate)?.saveData?.startDate,
      [playthrough]
    )
    const formattedStartDate = startDate ? formatTimestamp(startDate, i18n.language) : ' '
    const deletePlaythroughButtons: IAlertButton[] = [
      {
        text: t('PLAYTHROUGH-DELETE_BUTTON-LABEL'),
        onPress: () => gameId && play.deletePlaythrough(gameId),
        tintColor: colors.lowHealth
      },
      { text: t('CANCEL_BUTTON-LABEL'), onPress: hideDeletePlaythrough }
    ]
    const rewindModalButtons: IAlertButton[] = [
      {
        text: t('CANCEL_BUTTON-LABEL'),
        onPress: () => hideRewindModal()
      },
      {
        text: t('LOAD-BRANCH_PLAYTHROUGH_BUTTON-LABEL'),
        onPress: () => handleBranch()
      },
      {
        text: t('CONTINUE_BUTTON-LABEL'),
        onPress: () => {
          play.loadGame(selectedSave)
        }
      }
    ]

    const handleDeletePlaythrough = () => setDeletePlaythroughVisible(true)

    const handleLoadSelected = () => {
      const latestSave = saves.getLatestSave(selectedSave.saveData?._id, true)

      if (latestSave.timestamp > selectedSave.timestamp) {
        setRewindVisible(true)
        return
      }

      play.loadGame(selectedSave)
    }

    const handleBranch = async () => {
      const numberOfPlaythroughs = saves.playthroughs.length

      if (purchase.isConfigured && purchase.access < AccessType.premium) {
        setUpgradeModalVisible(true)
        return
      }

      if (numberOfPlaythroughs >= config.maxPlaythroughsPremium) {
        setLimitReachedVisible(true)
        return
      }

      play.branchPlaythroughFromSave(selectedSave)
    }

    const scrollToTop = () => {
      scrollView.current?.scrollToOffset({ offset: 0 })
      setSelectedSave(playthrough[0])
    }

    useImperativeHandle(
      ref,
      (): IPlaythroughInstance => ({
        scrollToTop
      })
    )

    const renderItem = useCallback(
      ({ item: save, index }: { item: DatabaseSave; index: number }) => {
        return (
          <View style={style.save}>
            <Save
              save={save}
              selected={selectedSave.id === save.id}
              isMostRecent={!hideMostRecent && index === 0}
              onPress={setSelectedSave}
              onLongPress={enableContextualMenu ? handleLongPress : undefined}
            />
          </View>
        )
      },
      [enableContextualMenu, handleLongPress, hideMostRecent, selectedSave]
    )

    return (
      <View style={style.wrapper}>
        {!hideTitle && (
          <View style={style.headerWrapper}>
            {startDate && (
              <Text style={style.date}>
                {t('LOAD-PLAYTHROUGH_DATE-LABEL', { date: formattedStartDate })}
              </Text>
            )}
            {deleteButton && (
              <RoundButton
                accessibilityLabel={t('PLAYTHROUGH-DELETE_BUTTON-LABEL')}
                style={style.deleteButton}
                onPress={handleDeletePlaythrough}
                size="mini"
                icon={props => <Icon name="skull" {...props} />}
              />
            )}
          </View>
        )}

        <View style={style.scrollListWrapper}>
          <LinearGradient
            pointerEvents="none"
            colors={[`${colors.night}ff`, `${colors.night}00`]}
            style={style.gradient}
          />

          <FlatList
            contentContainerStyle={style.savesList}
            data={playthrough}
            ref={scrollView}
            renderItem={renderItem}
            initialNumToRender={5}
            maxToRenderPerBatch={8}
            windowSize={4}
          />
          <LinearGradient
            pointerEvents="none"
            colors={[`${colors.night}00`, `${colors.night}ff`]}
            style={[style.gradient, style.bottomGradient]}
          />
        </View>

        <View style={style.loadButtonWrapper}>
          <Button
            label={t('LOAD-LOAD_BUTTON-LABEL')}
            size="regular"
            onPress={handleLoadSelected}
            disabled={!selectedSave}
            wrapperStyle={style.loadButton}
          />
        </View>
        <SaveContextualMenu
          save={selectedSave}
          visible={contextualMenuVisible}
          hide={hideContext}
        />
        <AlertCardModal
          onDismiss={hideDeletePlaythrough}
          visible={deletePlaythroughVisible}
          title={t('PLAYTHROUGH-DELETE-WARNING-TITLE')}
          text={t('PLAYTHROUGH-DELETE-WARNING-DESC')}
          buttons={deletePlaythroughButtons}
        />
        <AlertCardModal
          onDismiss={hideRewindModal}
          visible={rewindVisible}
          title={t('LOAD-REWIND_WARNING-TITLE')}
          text={t('LOAD-REWIND_WARNING-DESC')}
          buttons={rewindModalButtons}
        >
          <UpgradeAlert
            type="branch"
            onDismiss={hideUpgradeModal}
            visible={upgradeModalVisible}
            onPurchaseFinished={handleBranch}
          />
          <LimitReachedAlert
            type="branch"
            onDismiss={hideLimitReached}
            visible={limitReachedVisible}
          />
        </AlertCardModal>
      </View>
    )
  }
)

Playthrough.displayName = 'Playthrough'

export default memo(Playthrough)
