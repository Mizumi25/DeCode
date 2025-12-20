import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function RightSection({ onZoomIn, onZoomOut, onResetZoom, zoom, onGenerateKey }) {
  const handleGenerateKey = async () => {
    const key = onGenerateKey();
    const keyString = JSON.stringify(key, null, 2);
    
    await Clipboard.setStringAsync(keyString);
    
    Alert.alert(
      'Upload Key Generated',
      'The upload key has been copied to your clipboard. Paste it in the web app to sync.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.button} onPress={onZoomOut}>
          <Ionicons name="remove" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.zoomDisplay} onPress={onResetZoom}>
          <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={onZoomIn}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.syncButton} onPress={handleGenerateKey}>
        <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
        <Text style={styles.syncText}>Sync</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  zoomDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
  },
  zoomText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  syncText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
