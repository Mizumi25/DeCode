import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useForgeStore from '../stores/useForgeStore';
import Header from '../components/Header/Header';
import Canvas from '../components/Canvas/Canvas';
import ComponentLibrary from '../components/ComponentLibrary';
import PropertiesPanel from '../components/PropertiesPanel';

export default function ForgeScreen() {
  const {
    components,
    selectedComponentId,
    canvasZoom,
    canvasOffset,
    frameName,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    clearSelection,
    setZoom,
    setOffset,
    resetCanvas,
    generateUploadKey,
    loadFromStorage,
    saveToStorage,
  } = useForgeStore();

  const [showLibrary, setShowLibrary] = useState(false);
  const [showProperties, setShowProperties] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save on component changes
  useEffect(() => {
    if (components.length > 0) {
      saveToStorage();
    }
  }, [components]);

  const selectedComponent = components.find(c => c.id === selectedComponentId);

  const handleAddComponent = (component) => {
    addComponent(component);
    setShowLibrary(false);
  };

  const handleUpdateComponent = (id, updates) => {
    updateComponent(id, updates);
  };

  const handleDeleteComponent = () => {
    if (selectedComponentId) {
      deleteComponent(selectedComponentId);
      setShowProperties(false);
    }
  };

  const handleSelectComponent = (id) => {
    selectComponent(id);
    setShowProperties(true);
  };

  const handleZoomIn = () => {
    setZoom(canvasZoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom(canvasZoom - 0.1);
  };

  const handleResetZoom = () => {
    resetCanvas();
  };

  const handleGenerateKey = () => {
    return generateUploadKey();
  };

  const handleFrameNameChange = (name) => {
    useForgeStore.setState({ frameName: name });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <Header
        frameName={frameName}
        onFrameNameChange={handleFrameNameChange}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        zoom={canvasZoom}
        onGenerateKey={handleGenerateKey}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Canvas */}
        <Canvas
          components={components}
          selectedComponentId={selectedComponentId}
          onSelectComponent={handleSelectComponent}
          onUpdateComponent={handleUpdateComponent}
          zoom={canvasZoom}
          onZoomChange={setZoom}
          offset={canvasOffset}
          onOffsetChange={setOffset}
        />

        {/* Floating Action Buttons */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, styles.fabLibrary]}
            onPress={() => setShowLibrary(true)}
          >
            <Ionicons name="add-circle" size={28} color="#fff" />
          </TouchableOpacity>

          {selectedComponent && (
            <TouchableOpacity
              style={[styles.fab, styles.fabProperties]}
              onPress={() => setShowProperties(true)}
            >
              <Ionicons name="settings" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Component Library Modal */}
      <Modal
        visible={showLibrary}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLibrary(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <View />
            <TouchableOpacity onPress={() => setShowLibrary(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          <ComponentLibrary onAddComponent={handleAddComponent} />
        </SafeAreaView>
      </Modal>

      {/* Properties Panel Modal */}
      <Modal
        visible={showProperties}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProperties(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <View />
            <TouchableOpacity onPress={() => setShowProperties(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          <PropertiesPanel
            component={selectedComponent}
            onUpdate={(updated) => handleUpdateComponent(updated.id, updated)}
            onDelete={handleDeleteComponent}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabLibrary: {
    backgroundColor: '#3b82f6',
  },
  fabProperties: {
    backgroundColor: '#8b5cf6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
});
