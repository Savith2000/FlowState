import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function GlassBackground({ children }) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
});
