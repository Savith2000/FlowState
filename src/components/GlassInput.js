import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

export default function GlassInput({ style, ...props }) {
  return (
    <TextInput
      {...props}
      style={[styles.input, style]}
      placeholderTextColor="#A8A29E"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#44403C',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#1C1917',
  },
});
