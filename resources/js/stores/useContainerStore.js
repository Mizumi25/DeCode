import { create } from 'zustand';

const useContainerStore = create((set) => ({
  containerMode: false,
  containers: [],
  
  setContainerMode: (mode) => set({ containerMode: mode }),
  toggleContainerMode: () => set((state) => ({ containerMode: !state.containerMode })),
  
  setContainers: (containers) => set({ containers }),
  addContainer: (container) => set((state) => ({ 
    containers: [...state.containers, container] 
  })),
  updateContainer: (uuid, updates) => set((state) => ({
    containers: state.containers.map(c => 
      c.uuid === uuid ? { ...c, ...updates } : c
    )
  })),
  removeContainer: (uuid) => set((state) => ({
    containers: state.containers.filter(c => c.uuid !== uuid)
  })),
}));

export default useContainerStore;
