import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function GlassCard({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFEF9',
    borderRadius: 24,
    padding: 24,
    borderWidth: 3,
    borderColor: '#44403C',
  },
});
