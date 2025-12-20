import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import DraggableComponent from './DraggableComponent';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Canvas({ 
  components, 
  selectedComponentId, 
  onSelectComponent, 
  onUpdateComponent,
  zoom,
  onZoomChange,
  offset,
  onOffsetChange,
}) {
  const scale = useSharedValue(zoom);
  const translateX = useSharedValue(offset.x);
  const translateY = useSharedValue(offset.y);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Pinch gesture for zoom
  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: (event, ctx) => {
      ctx.startScale = scale.value;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    },
    onActive: (event, ctx) => {
      scale.value = Math.max(0.5, Math.min(2, ctx.startScale * event.scale));
    },
    onEnd: () => {
      // Callback to update zoom in state
      // runOnJS(onZoomChange)(scale.value);
    },
  });

  // Pan gesture for canvas movement
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      // runOnJS(onOffsetChange)({ x: translateX.value, y: translateY.value });
    },
  });

  const animatedCanvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
        <Animated.View style={styles.gestureContainer}>
          <PanGestureHandler onGestureEvent={panGestureHandler} minPointers={2}>
            <Animated.View style={[styles.canvas, animatedCanvasStyle]}>
              {/* Grid background */}
              <View style={styles.grid} />

              {/* Render components */}
              {components.map((component) => (
                <DraggableComponent
                  key={component.id}
                  component={component}
                  isSelected={component.id === selectedComponentId}
                  onSelect={onSelectComponent}
                  onUpdate={onUpdateComponent}
                  zoom={scale.value}
                />
              ))}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gestureContainer: {
    flex: 1,
  },
  canvas: {
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 2,
    backgroundColor: '#1a1a1a',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
  },
});
