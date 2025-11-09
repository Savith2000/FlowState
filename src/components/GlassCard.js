import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';

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
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
