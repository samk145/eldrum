import React from 'react'
import { View } from 'react-native'
import { LoadingIndicator } from '../../../units'
import style from './paywall.style'

const PaywallLoading = () => (
  <View style={style.wrapper}>
    <LoadingIndicator size={150} />
  </View>
)

export default PaywallLoading
