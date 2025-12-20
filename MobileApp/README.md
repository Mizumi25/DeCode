# DeCode Mobile - Offline ForgePage

A standalone React Native mobile app for DeCode's visual builder (ForgePage), built with Expo.

## 🚀 Features

- ✅ **Offline-First** - Work on designs without internet
- ✅ **Touch Gestures** - Drag, drop, pinch to zoom
- ✅ **Component Library** - All UI components (Layout, Typography, Interactive, Media)
- ✅ **Properties Panel** - Edit styles, props, and layout
- ✅ **Header Controls** - Undo/redo, zoom, frame naming
- ✅ **Sync via Key** - Generate upload key to sync with web app
- ✅ **AsyncStorage** - Auto-save your work locally

## 📦 Installation

1. **Install dependencies:**
   ```bash
   cd MobileApp
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/simulator:**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web (for testing)
   npm run web
   ```

## 🏗️ Project Structure

```
MobileApp/
├── App.js                          # Main entry point
├── package.json                    # Dependencies
├── app.json                        # Expo config
├── src/
│   ├── screens/
│   │   └── ForgeScreen.js         # Main visual builder screen
│   ├── components/
│   │   ├── Header/                # Header with Left, Center, Right sections
│   │   │   ├── Header.js
│   │   │   ├── LeftSection.js    # Undo/Redo
│   │   │   ├── CenterSection.js  # Frame name editor
│   │   │   └── RightSection.js   # Zoom + Sync button
│   │   ├── Canvas/
│   │   │   ├── Canvas.js         # Main canvas with gestures
│   │   │   └── DraggableComponent.js  # Individual draggable components
│   │   ├── ComponentLibrary.js   # Component picker modal
│   │   └── PropertiesPanel.js    # Properties editor modal
│   ├── stores/
│   │   └── useForgeStore.js      # Zustand state management
│   └── utils/
└── assets/
```

## 🎨 How It Works

### 1. **Canvas**
- Pinch to zoom (0.5x - 2x)
- Two-finger pan to move canvas
- Tap component to select
- Drag component to move

### 2. **Component Library**
- Tap "+" FAB to open
- Categories: Layout, Typography, Interactive, Media, Components
- Tap any component to add to canvas

### 3. **Properties Panel**
- Tap gear icon on selected component
- Three tabs: Styles, Props, Layout
- Edit colors, fonts, sizes, positions
- Delete component

### 4. **Sync with Web App**
- Tap "Sync" button in header
- Upload key copied to clipboard
- Paste into web app to sync design

## 📱 Usage Flow

```
Open App → ForgePage Screen
    ↓
Tap + → Select Component → Add to Canvas
    ↓
Drag component to position
    ↓
Tap component → Edit properties
    ↓
Repeat for all components
    ↓
Tap "Sync" → Copy key → Paste in web app
```

## 🔄 Sync Process

The mobile app generates an upload key containing:
```json
{
  "frameName": "My Design",
  "components": [...],
  "timestamp": 1234567890,
  "version": "1.0.0"
}
```

**To upload to web app:**
1. Tap "Sync" button in mobile app
2. Key automatically copied to clipboard
3. Open DeCode web app
4. Navigate to import section
5. Paste key
6. Design syncs to your project

## 🛠️ Technologies

- **Expo** - React Native framework
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Touch gestures
- **Zustand** - State management
- **AsyncStorage** - Local persistence
- **React Navigation** - Navigation
- **Expo Vector Icons** - Icons

## 🎯 Components Available

### Layout
- Container, Flex Row, Flex Col, Grid

### Typography
- Heading (h1), Paragraph (p), Text (span)

### Interactive
- Button, Input, Link

### Media
- Image, Video

### Components
- Card, Navbar, Footer

## 💾 Storage

All designs are automatically saved to device storage using AsyncStorage. Your work persists even after closing the app.

## 🚧 Development Notes

- This app is **completely isolated** from the main DeCode web app
- All dependencies are in `MobileApp/node_modules`
- No interference with Laravel/React web codebase
- Can be built and deployed independently

## 📲 Building for Production

```bash
# Build standalone APK (Android)
eas build --platform android --profile preview

# Build for App Store (iOS)
eas build --platform ios --profile production
```

## 🔗 Integration with Web App

The web app should have an import endpoint that accepts the upload key JSON:

```javascript
POST /api/frames/import
Body: {
  frameName: "...",
  components: [...],
  timestamp: ...,
  version: "1.0.0"
}
```

## 📝 License

Part of DeCode project - for internal use.
