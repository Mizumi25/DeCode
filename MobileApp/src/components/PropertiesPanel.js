import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PropertiesPanel({ component, onUpdate, onDelete }) {
  const [activeSection, setActiveSection] = useState('styles');

  if (!component) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="hand-left-outline" size={48} color="#444" />
        <Text style={styles.emptyText}>Select a component to edit properties</Text>
      </View>
    );
  }

  const updateStyle = (key, value) => {
    onUpdate({
      ...component,
      styles: {
        ...component.styles,
        [key]: value,
      },
    });
  };

  const updateProp = (key, value) => {
    onUpdate({
      ...component,
      props: {
        ...component.props,
        [key]: value,
      },
    });
  };

  const updatePosition = (axis, value) => {
    onUpdate({
      ...component,
      position: {
        ...component.position,
        [axis]: parseFloat(value) || 0,
      },
    });
  };

  const updateSize = (dimension, value) => {
    onUpdate({
      ...component,
      size: {
        ...component.size,
        [dimension]: parseFloat(value) || 0,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="cube-outline" size={20} color="#3b82f6" />
          <Text style={styles.componentType}>{component.type}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Section tabs */}
      <View style={styles.sectionTabs}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'styles' && styles.tabActive]}
          onPress={() => setActiveSection('styles')}
        >
          <Text style={[styles.tabText, activeSection === 'styles' && styles.tabTextActive]}>
            Styles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'props' && styles.tabActive]}
          onPress={() => setActiveSection('props')}
        >
          <Text style={[styles.tabText, activeSection === 'props' && styles.tabTextActive]}>
            Props
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'layout' && styles.tabActive]}
          onPress={() => setActiveSection('layout')}
        >
          <Text style={[styles.tabText, activeSection === 'layout' && styles.tabTextActive]}>
            Layout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeSection === 'styles' && (
          <View>
            <PropertyInput
              label="Background"
              value={component.styles?.backgroundColor || ''}
              onChangeText={(val) => updateStyle('backgroundColor', val)}
              placeholder="#ffffff"
            />
            <PropertyInput
              label="Color"
              value={component.styles?.color || ''}
              onChangeText={(val) => updateStyle('color', val)}
              placeholder="#000000"
            />
            <PropertyInput
              label="Font Size"
              value={component.styles?.fontSize?.toString() || ''}
              onChangeText={(val) => updateStyle('fontSize', parseFloat(val) || 16)}
              placeholder="16"
              keyboardType="numeric"
            />
            <PropertyInput
              label="Padding"
              value={component.styles?.padding?.toString() || ''}
              onChangeText={(val) => updateStyle('padding', parseFloat(val) || 0)}
              placeholder="0"
              keyboardType="numeric"
            />
            <PropertyInput
              label="Border Radius"
              value={component.styles?.borderRadius?.toString() || ''}
              onChangeText={(val) => updateStyle('borderRadius', parseFloat(val) || 0)}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        )}

        {activeSection === 'props' && (
          <View>
            {component.type === 'button' || component.type === 'p' || component.type === 'h1' || component.type === 'span' ? (
              <PropertyInput
                label="Text"
                value={component.props?.text || ''}
                onChangeText={(val) => updateProp('text', val)}
                placeholder="Enter text"
              />
            ) : null}
            {component.type === 'input' && (
              <PropertyInput
                label="Placeholder"
                value={component.props?.placeholder || ''}
                onChangeText={(val) => updateProp('placeholder', val)}
                placeholder="Enter placeholder"
              />
            )}
            {component.type === 'img' && (
              <>
                <PropertyInput
                  label="Image URL"
                  value={component.props?.src || ''}
                  onChangeText={(val) => updateProp('src', val)}
                  placeholder="https://..."
                />
                <PropertyInput
                  label="Alt Text"
                  value={component.props?.alt || ''}
                  onChangeText={(val) => updateProp('alt', val)}
                  placeholder="Image description"
                />
              </>
            )}
            {component.type === 'a' && (
              <PropertyInput
                label="Link URL"
                value={component.props?.href || ''}
                onChangeText={(val) => updateProp('href', val)}
                placeholder="https://..."
              />
            )}
          </View>
        )}

        {activeSection === 'layout' && (
          <View>
            <Text style={styles.sectionTitle}>Position</Text>
            <View style={styles.row}>
              <PropertyInput
                label="X"
                value={component.position?.x?.toString() || '0'}
                onChangeText={(val) => updatePosition('x', val)}
                keyboardType="numeric"
                style={styles.halfWidth}
              />
              <PropertyInput
                label="Y"
                value={component.position?.y?.toString() || '0'}
                onChangeText={(val) => updatePosition('y', val)}
                keyboardType="numeric"
                style={styles.halfWidth}
              />
            </View>

            <Text style={styles.sectionTitle}>Size</Text>
            <View style={styles.row}>
              <PropertyInput
                label="Width"
                value={component.size?.width?.toString() || '0'}
                onChangeText={(val) => updateSize('width', val)}
                keyboardType="numeric"
                style={styles.halfWidth}
              />
              <PropertyInput
                label="Height"
                value={component.size?.height?.toString() || '0'}
                onChangeText={(val) => updateSize('height', val)}
                keyboardType="numeric"
                style={styles.halfWidth}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function PropertyInput({ label, value, onChangeText, placeholder, keyboardType, style }) {
  return (
    <View style={[styles.inputGroup, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#555"
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  componentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#2a1a1a',
  },
  sectionTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#3b82f6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
});
