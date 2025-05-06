import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Reader } from '../../structures/reader/reader'
import { RoundButton } from '../round-button/round-button'
import { variables } from '../../../styles'

type TTooltipProps = {
  content: string
}

export const Tooltip = ({ content }: TTooltipProps) => {
  const { t } = useTranslation()
  const [visible, setVisibility] = useState(false)

  const open = () => setVisibility(true)
  const close = () => setVisibility(false)

  return (
    <RoundButton
      accessibilityLabel={t('TOOLTIPS-OPEN-LABEL')}
      color={variables.colors.nightLight}
      label="?"
      onPress={open}
    >
      <Reader content={content} visible={visible} buttonAction={close} />
    </RoundButton>
  )
}
