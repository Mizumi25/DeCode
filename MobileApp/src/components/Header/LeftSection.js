import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LeftSection({ onUndo, onRedo, canUndo, canRedo }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canUndo && styles.disabled]}
        onPress={onUndo}
        disabled={!canUndo}
      >
        <Ionicons name="arrow-undo" size={18} color={canUndo ? "#fff" : "#666"} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, !canRedo && styles.disabled]}
        onPress={onRedo}
        disabled={!canRedo}
      >
        <Ionicons name="arrow-redo" size={18} color={canRedo ? "#fff" : "#666"} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
