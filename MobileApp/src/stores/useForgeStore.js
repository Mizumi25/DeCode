import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useForgeStore = create((set, get) => ({
  // Canvas state
  components: [],
  selectedComponentId: null,
  canvasZoom: 1,
  canvasOffset: { x: 0, y: 0 },
  
  // Frame data
  currentFrame: null,
  frameName: 'Untitled Frame',
  
  // Component actions
  addComponent: (component) => {
    const newComponent = {
      id: `component-${Date.now()}-${Math.random()}`,
      type: component.type,
      props: component.props || {},
      styles: component.styles || {},
      position: component.position || { x: 100, y: 100 },
      size: component.size || { width: 200, height: 100 },
      children: component.children || [],
    };
    
    set((state) => ({
      components: [...state.components, newComponent],
      selectedComponentId: newComponent.id,
    }));
    
    get().saveToStorage();
  },
  
  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map((comp) =>
        comp.id === id ? { ...comp, ...updates } : comp
      ),
    }));
    get().saveToStorage();
  },
  
  deleteComponent: (id) => {
    set((state) => ({
      components: state.components.filter((comp) => comp.id !== id),
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
    }));
    get().saveToStorage();
  },
  
  selectComponent: (id) => {
    set({ selectedComponentId: id });
  },
  
  clearSelection: () => {
    set({ selectedComponentId: null });
  },
  
  // Canvas controls
  setZoom: (zoom) => {
    set({ canvasZoom: Math.max(0.5, Math.min(2, zoom)) });
  },
  
  setOffset: (offset) => {
    set({ canvasOffset: offset });
  },
  
  resetCanvas: () => {
    set({
      canvasZoom: 1,
      canvasOffset: { x: 0, y: 0 },
    });
  },
  
  // Storage
  saveToStorage: async () => {
    try {
      const state = get();
      const data = {
        components: state.components,
        frameName: state.frameName,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('forge_state', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  },
  
  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem('forge_state');
      if (data) {
        const parsed = JSON.parse(data);
        set({
          components: parsed.components || [],
          frameName: parsed.frameName || 'Untitled Frame',
        });
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  },
  
  // Generate upload key
  generateUploadKey: () => {
    const state = get();
    return {
      frameName: state.frameName,
      components: state.components,
      timestamp: Date.now(),
      version: '1.0.0',
    };
  },
  
  clearAll: async () => {
    set({
      components: [],
      selectedComponentId: null,
      frameName: 'Untitled Frame',
    });
    await AsyncStorage.removeItem('forge_state');
  },
}));

export default useForgeStore;
