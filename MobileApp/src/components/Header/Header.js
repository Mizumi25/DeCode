import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeftSection from './LeftSection';
import CenterSection from './CenterSection';
import RightSection from './RightSection';

export default function Header({
  frameName,
  onFrameNameChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  zoom,
  onGenerateKey,
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.section}>
          <LeftSection
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </View>
        
        <View style={styles.centerSection}>
          <CenterSection
            frameName={frameName}
            onFrameNameChange={onFrameNameChange}
          />
        </View>
        
        <View style={styles.section}>
          <RightSection
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onResetZoom={onResetZoom}
            zoom={zoom}
            onGenerateKey={onGenerateKey}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    minWidth: 100,
  },
  centerSection: {
    flex: 1,
  },
});
