import React from 'react'
import { useTranslation } from 'react-i18next'
import { Reader } from '../../../structures'
import { variables } from '../../../../styles'

const { colors } = variables

type TCreditsProps = {
  buttonAction: () => void
  visible: boolean
}

const Credits = (props: TCreditsProps) => {
  const { t } = useTranslation()

  return (
    <Reader
      textColor={colors.white}
      backgroundColor={colors.nightLight}
      buttonBackground={colors.white}
      buttonTextColor={colors.black}
      content={t('CREDITS')}
      buttonLabel={t('CLOSE-LABEL')}
      {...props}
    />
  )
}

export default Credits
