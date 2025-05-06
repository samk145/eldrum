import React from 'react'
import { TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react'
import { useGameStore } from '../../../../../contexts/stores'
import { Rect } from '../../../../../helpers/misc'
import { Icon } from '../../../../units'
import statBarStyle from '../stat-bar.style'

const hitSlop = Rect(10, 10, 10, 10)

const Opener: React.FC = observer(() => {
  const game = useGameStore()

  return (
    <TouchableOpacity
      accessibilityLabel="Content Inspector"
      touchSoundDisabled={true}
      style={statBarStyle.menu}
      hitSlop={hitSlop}
      onPress={() => {
        if (game) {
          if (game.inspector?.bot.running) {
            game.inspector.bot.stop()
          } else {
            game.puppeteer.openModal('contentInspector')
          }
        }
      }}
    >
      <Icon
        name={game && game.inspector?.bot.running ? 'pause' : 'bug'}
        height={statBarStyle.menuIcon.height}
        width={statBarStyle.menuIcon.width}
        fill="#FFFFFF"
      />
    </TouchableOpacity>
  )
})

export default Opener
