import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function Card() {
  return (
    <View style={styles.container}>
      <Text>Card Page!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffs',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
