import React from 'react';
import WindowPanel from '@/Components/WindowPanel';
import IconModal from './IconModal';
import { useIconStore } from '@/stores/useIconStore';

const IconWindowPanel = ({ onIconSelect }) => {
  const { isIconPanelOpen, closeIconPanel } = useIconStore();

  const handleIconSelect = (icon) => {
    if (onIconSelect) {
      onIconSelect(icon);
    }
    // Optionally close panel after selection
    // closeIconPanel();
  };

  return (
    <WindowPanel
      isOpen={isIconPanelOpen}
      title="Icon Browser"
      onClose={closeIconPanel}
      onModeChange={() => {}} // Icons panel shouldn't be able to go fullscreen
      initialMode="modal"
      initialPosition={{ x: 100, y: 100 }}
      initialSize={{ width: 400, height: 500 }}
      minSize={{ width: 350, height: 400 }}
      maxSize={{ width: 500, height: 600 }} // Restricted max size
      isDraggable={true}
      isResizable={true}
      className="icon-panel"
      zIndexBase={1500}
      panelCollisionOffset={320}
      content={
        <IconModal onIconSelect={handleIconSelect} />
      }
    />
  );
};

export default IconWindowPanel;