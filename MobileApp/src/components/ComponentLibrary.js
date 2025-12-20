import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COMPONENT_CATEGORIES = [
  {
    id: 'layout',
    name: 'Layout',
    icon: 'grid-outline',
    components: [
      { id: 'container', name: 'Container', icon: 'square-outline', type: 'div', defaultStyles: { padding: 20, backgroundColor: '#f3f4f6' } },
      { id: 'flex-row', name: 'Flex Row', icon: 'reorder-three-outline', type: 'div', defaultStyles: { display: 'flex', flexDirection: 'row', gap: 10 } },
      { id: 'flex-col', name: 'Flex Col', icon: 'reorder-four-outline', type: 'div', defaultStyles: { display: 'flex', flexDirection: 'column', gap: 10 } },
      { id: 'grid', name: 'Grid', icon: 'grid-outline', type: 'div', defaultStyles: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 } },
    ],
  },
  {
    id: 'typography',
    name: 'Typography',
    icon: 'text-outline',
    components: [
      { id: 'heading', name: 'Heading', icon: 'text', type: 'h1', defaultProps: { text: 'Heading' }, defaultStyles: { fontSize: 32, fontWeight: 'bold' } },
      { id: 'paragraph', name: 'Paragraph', icon: 'document-text-outline', type: 'p', defaultProps: { text: 'Paragraph text' }, defaultStyles: { fontSize: 16 } },
      { id: 'text', name: 'Text', icon: 'text-outline', type: 'span', defaultProps: { text: 'Text' }, defaultStyles: { fontSize: 14 } },
    ],
  },
  {
    id: 'interactive',
    name: 'Interactive',
    icon: 'hand-left-outline',
    components: [
      { id: 'button', name: 'Button', icon: 'radio-button-on-outline', type: 'button', defaultProps: { text: 'Button' }, defaultStyles: { padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6 } },
      { id: 'input', name: 'Input', icon: 'create-outline', type: 'input', defaultProps: { placeholder: 'Enter text...' }, defaultStyles: { padding: 10, border: '1px solid #ccc', borderRadius: 6 } },
      { id: 'link', name: 'Link', icon: 'link-outline', type: 'a', defaultProps: { text: 'Link', href: '#' }, defaultStyles: { color: '#3b82f6', textDecoration: 'underline' } },
    ],
  },
  {
    id: 'media',
    name: 'Media',
    icon: 'image-outline',
    components: [
      { id: 'image', name: 'Image', icon: 'image-outline', type: 'img', defaultProps: { src: 'https://via.placeholder.com/300x200', alt: 'Image' }, defaultStyles: { width: 300, height: 200, objectFit: 'cover', borderRadius: 8 } },
      { id: 'video', name: 'Video', icon: 'videocam-outline', type: 'video', defaultProps: { src: '' }, defaultStyles: { width: 400, height: 300 } },
    ],
  },
  {
    id: 'components',
    name: 'Components',
    icon: 'cube-outline',
    components: [
      { id: 'card', name: 'Card', icon: 'card-outline', type: 'div', defaultStyles: { padding: 20, backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' } },
      { id: 'navbar', name: 'Navbar', icon: 'menu-outline', type: 'nav', defaultStyles: { display: 'flex', justifyContent: 'space-between', padding: 16, backgroundColor: '#1f2937', color: '#fff' } },
      { id: 'footer', name: 'Footer', icon: 'remove-outline', type: 'footer', defaultStyles: { padding: 20, backgroundColor: '#1f2937', color: '#fff', textAlign: 'center' } },
    ],
  },
];

export default function ComponentLibrary({ onAddComponent }) {
  const [selectedCategory, setSelectedCategory] = useState('layout');

  const handleAddComponent = (component) => {
    onAddComponent({
      type: component.type,
      props: component.defaultProps || {},
      styles: component.defaultStyles || {},
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 },
    });
  };

  const currentCategory = COMPONENT_CATEGORIES.find(cat => cat.id === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
        {COMPONENT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon}
              size={20}
              color={selectedCategory === category.id ? '#3b82f6' : '#888'}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Components grid */}
      <ScrollView style={styles.componentsScroll}>
        <View style={styles.componentsGrid}>
          {currentCategory?.components.map((component) => (
            <TouchableOpacity
              key={component.id}
              style={styles.componentCard}
              onPress={() => handleAddComponent(component)}
            >
              <View style={styles.componentIconContainer}>
                <Ionicons name={component.icon} size={28} color="#3b82f6" />
              </View>
              <Text style={styles.componentName}>{component.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  categoryTabs: {
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: 60,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  categoryTabActive: {
    backgroundColor: '#1e3a5f',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  categoryTextActive: {
    color: '#3b82f6',
  },
  componentsScroll: {
    flex: 1,
    padding: 16,
  },
  componentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  componentCard: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  componentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  componentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});
