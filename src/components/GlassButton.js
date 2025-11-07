import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function GlassButton({ onPress, children, disabled, style, variant = 'primary' }) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={isPrimary ? styles.primaryText : styles.secondaryText}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#44403C',
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  secondaryButton: {
    backgroundColor: '#FFFEF9',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    textTransform: 'uppercase',
  },
  secondaryText: {
    color: '#10B981',
    fontSize: 15,
    fontFamily: 'Quicksand_600SemiBold',
  },
});
