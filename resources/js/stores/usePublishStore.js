import { create } from 'zustand';

export const usePublishStore = create((set, get) => ({
  isPublishing: false,
  publishProgress: 0,
  publishMessage: '',
  publishedUrl: null,
  publishError: null,
  showModal: false,
  modalMode: 'publish', // 'publish' or 'unpublish'
  
  // Modal control
  openPublishModal: () => set({ showModal: true, modalMode: 'publish' }),
  openUnpublishModal: () => set({ showModal: true, modalMode: 'unpublish' }),
  closeModal: () => set({ showModal: false }),
  
  // Publishing flow
  startPublish: () => set({ 
    isPublishing: true, 
    publishProgress: 0, 
    publishMessage: 'Initializing...',
    publishedUrl: null,
    publishError: null,
    showModal: false
  }),
  
  updateProgress: (progress, message) => set({ 
    publishProgress: progress, 
    publishMessage: message 
  }),
  
  finishPublish: (url) => set({ 
    isPublishing: false, 
    publishProgress: 100, 
    publishMessage: 'Published successfully!',
    publishedUrl: url 
  }),
  
  failPublish: (error) => set({ 
    isPublishing: false, 
    publishError: error,
    publishMessage: 'Failed to publish'
  }),
  
  resetPublish: () => set({ 
    isPublishing: false, 
    publishProgress: 0, 
    publishMessage: '',
    publishedUrl: null,
    publishError: null
  }),
}));
