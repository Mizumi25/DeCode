import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

export default function DraggableComponent({ component, isSelected, onSelect, onUpdate, zoom }) {
  const translateX = useSharedValue(component.position.x);
  const translateY = useSharedValue(component.position.y);

  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX / zoom;
      translateY.value = ctx.startY + event.translationY / zoom;
    },
    onEnd: () => {
      runOnJS(onUpdate)(component.id, {
        position: { x: translateX.value, y: translateY.value },
      });
    },
  });

  const tapGestureHandler = useAnimatedGestureHandler({
    onEnd: () => {
      runOnJS(onSelect)(component.id);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const renderContent = () => {
    const styles = convertWebStylesToRN(component.styles);

    switch (component.type) {
      case 'button':
        return (
          <View style={[localStyles.button, styles]}>
            <Text style={[localStyles.buttonText, { color: styles.color || '#fff' }]}>
              {component.props?.text || 'Button'}
            </Text>
          </View>
        );

      case 'h1':
      case 'h2':
      case 'h3':
        return (
          <Text style={[localStyles.heading, styles]}>
            {component.props?.text || 'Heading'}
          </Text>
        );

      case 'p':
        return (
          <Text style={[localStyles.paragraph, styles]}>
            {component.props?.text || 'Paragraph'}
          </Text>
        );

      case 'span':
        return (
          <Text style={[localStyles.text, styles]}>
            {component.props?.text || 'Text'}
          </Text>
        );

      case 'input':
        return (
          <View style={[localStyles.input, styles]}>
            <Text style={localStyles.inputPlaceholder}>
              {component.props?.placeholder || 'Input'}
            </Text>
          </View>
        );

      case 'img':
        return (
          <Image
            source={{ uri: component.props?.src || 'https://via.placeholder.com/300x200' }}
            style={[localStyles.image, styles, { width: component.size.width, height: component.size.height }]}
            resizeMode="cover"
          />
        );

      case 'div':
      default:
        return (
          <View style={[localStyles.container, styles]}>
            <Text style={localStyles.containerLabel}>{component.type}</Text>
          </View>
        );
    }
  };

  return (
    <TapGestureHandler onGestureEvent={tapGestureHandler}>
      <Animated.View>
        <PanGestureHandler onGestureEvent={panGestureHandler}>
          <Animated.View
            style={[
              animatedStyle,
              localStyles.draggable,
              {
                width: component.size.width,
                height: component.size.height,
                borderWidth: isSelected ? 2 : 0,
                borderColor: '#3b82f6',
              },
            ]}
          >
            {renderContent()}
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </TapGestureHandler>
  );
}

// Convert web styles to React Native styles
function convertWebStylesToRN(webStyles) {
  const rnStyles = {};

  if (webStyles.backgroundColor) rnStyles.backgroundColor = webStyles.backgroundColor;
  if (webStyles.color) rnStyles.color = webStyles.color;
  if (webStyles.fontSize) rnStyles.fontSize = parseFloat(webStyles.fontSize);
  if (webStyles.fontWeight) rnStyles.fontWeight = webStyles.fontWeight;
  if (webStyles.padding) rnStyles.padding = parseFloat(webStyles.padding);
  if (webStyles.borderRadius) rnStyles.borderRadius = parseFloat(webStyles.borderRadius);
  if (webStyles.textAlign) rnStyles.textAlign = webStyles.textAlign;

  return rnStyles;
}

const localStyles = StyleSheet.create({
  draggable: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  containerLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  paragraph: {
    fontSize: 16,
    color: '#000',
  },
  text: {
    fontSize: 14,
    color: '#000',
  },
  input: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  inputPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  image: {
    borderRadius: 8,
  },
});
