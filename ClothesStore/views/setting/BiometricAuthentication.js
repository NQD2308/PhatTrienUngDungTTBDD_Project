import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function BiometricAuthentication({route}) {
    const { userId } = route.params || {};

  return (
    <View>
      <Text>BiometricAuthentication</Text>
    </View>
  )
}

const styles = StyleSheet.create({})