import React from 'react';
import { RotateCw, Play, Zap, TrendingUp, Activity } from 'lucide-react';
import { PropertySection, InputField, SubsectionHeader, ButtonGrid } from '../PropertyUtils';

const AnimationSection = ({ currentStyles, currentAnimation, onPropertyChange, expandedSections, setExpandedSections }) => {
  return (
    <>
      {/* TRANSFORMS - 2D & 3D */}
      <PropertySection
        title="Transforms (2D & 3D)"
        Icon={RotateCw}
        sectionKey="transforms"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        {/* 2D Transforms */}
        <div>
          <SubsectionHeader title="2D Transforms" />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Scale X"
              value={currentStyles.scaleX}
              onChange={(value) => onPropertyChange('scaleX', value, 'style')}
              type="range"
              options={{ min: 0, max: 3, step: 0.1 }}
            />
            <InputField
              label="Scale Y"
              value={currentStyles.scaleY}
              onChange={(value) => onPropertyChange('scaleY', value, 'style')}
              type="range"
              options={{ min: 0, max: 3, step: 0.1 }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Translate X"
              value={currentStyles.translateX}
              onChange={(value) => onPropertyChange('translateX', value, 'style')}
            />
            <InputField
              label="Translate Y"
              value={currentStyles.translateY}
              onChange={(value) => onPropertyChange('translateY', value, 'style')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Rotate"
              value={currentStyles.rotate}
              onChange={(value) => onPropertyChange('rotate', value, 'style')}
              type="range"
              options={{ min: -360, max: 360, step: 1, unit: 'deg' }}
            />
            <InputField
              label="Skew X"
              value={currentStyles.skewX}
              onChange={(value) => onPropertyChange('skewX', value, 'style')}
              type="range"
              options={{ min: -90, max: 90, step: 1, unit: 'deg' }}
            />
          </div>
          <InputField
            label="Skew Y"
            value={currentStyles.skewY}
            onChange={(value) => onPropertyChange('skewY', value, 'style')}
            type="range"
            options={{ min: -90, max: 90, step: 1, unit: 'deg' }}
          />
        </div>

        {/* 3D Transforms */}
        <div>
          <SubsectionHeader title="3D Transforms" />
          <div className="grid grid-cols-3 gap-3">
            <InputField
              label="Translate Z"
              value={currentStyles.translateZ}
              onChange={(value) => onPropertyChange('translateZ', value, 'style')}
            />
            <InputField
              label="Rotate X"
              value={currentStyles.rotateX}
              onChange={(value) => onPropertyChange('rotateX', value, 'style')}
              type="range"
              options={{ min: -360, max: 360, step: 1, unit: 'deg' }}
            />
            <InputField
              label="Rotate Y"
              value={currentStyles.rotateY}
              onChange={(value) => onPropertyChange('rotateY', value, 'style')}
              type="range"
              options={{ min: -360, max: 360, step: 1, unit: 'deg' }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <InputField
              label="Rotate Z"
              value={currentStyles.rotateZ}
              onChange={(value) => onPropertyChange('rotateZ', value, 'style')}
              type="range"
              options={{ min: -360, max: 360, step: 1, unit: 'deg' }}
            />
            <InputField
              label="Scale Z"
              value={currentStyles.scaleZ}
              onChange={(value) => onPropertyChange('scaleZ', value, 'style')}
              type="range"
              options={{ min: 0, max: 3, step: 0.1 }}
            />
            <InputField
              label="Perspective"
              value={currentStyles.perspective}
              onChange={(value) => onPropertyChange('perspective', value, 'style')}
            />
          </div>
        </div>

        {/* Transform Properties */}
        <div>
          <SubsectionHeader title="Transform Properties" />
          <InputField
            label="Transform Origin"
            value={currentStyles.transformOrigin}
            onChange={(value) => onPropertyChange('transformOrigin', value, 'style')}
            type="select"
            options={{
              values: ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right']
            }}
          />
          <InputField
            label="Transform Style"
            value={currentStyles.transformStyle}
            onChange={(value) => onPropertyChange('transformStyle', value, 'style')}
            type="select"
            options={{
              values: ['flat', 'preserve-3d']
            }}
          />
          <InputField
            label="Perspective Origin"
            value={currentStyles.perspectiveOrigin}
            onChange={(value) => onPropertyChange('perspectiveOrigin', value, 'style')}
          />
          <InputField
            label="Backface Visibility"
            value={currentStyles.backfaceVisibility}
            onChange={(value) => onPropertyChange('backfaceVisibility', value, 'style')}
            type="select"
            options={{
              values: ['visible', 'hidden']
            }}
          />
        </div>
      </PropertySection>

      {/* CSS ANIMATIONS */}
      <PropertySection
        title="CSS Animations & Keyframes"
        Icon={Play}
        sectionKey="cssAnimations"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        {/* Animation Properties */}
        <div>
          <SubsectionHeader title="Animation Control" />
          <InputField
            label="Animation Name"
            value={currentStyles.animationName}
            onChange={(value) => onPropertyChange('animationName', value, 'style')}
          />
          <InputField
            label="Animation Duration"
            value={currentStyles.animationDuration}
            onChange={(value) => onPropertyChange('animationDuration', value, 'style')}
            options={{ placeholder: '1s' }}
          />
          <InputField
            label="Animation Delay"
            value={currentStyles.animationDelay}
            onChange={(value) => onPropertyChange('animationDelay', value, 'style')}
            options={{ placeholder: '0s' }}
          />
          <InputField
            label="Animation Iteration Count"
            value={currentStyles.animationIterationCount}
            onChange={(value) => onPropertyChange('animationIterationCount', value, 'style')}
            type="select"
            options={{
              values: ['1', '2', '3', 'infinite']
            }}
          />
          <InputField
            label="Animation Direction"
            value={currentStyles.animationDirection}
            onChange={(value) => onPropertyChange('animationDirection', value, 'style')}
            type="select"
            options={{
              values: ['normal', 'reverse', 'alternate', 'alternate-reverse']
            }}
          />
          <InputField
            label="Animation Fill Mode"
            value={currentStyles.animationFillMode}
            onChange={(value) => onPropertyChange('animationFillMode', value, 'style')}
            type="select"
            options={{
              values: ['none', 'forwards', 'backwards', 'both']
            }}
          />
          <InputField
            label="Animation Play State"
            value={currentStyles.animationPlayState}
            onChange={(value) => onPropertyChange('animationPlayState', value, 'style')}
            type="select"
            options={{
              values: ['running', 'paused']
            }}
          />
        </div>

        {/* Animation Timing Functions */}
        <div>
          <SubsectionHeader title="Timing Functions" />
          <InputField
            label="Animation Timing Function"
            value={currentStyles.animationTimingFunction}
            onChange={(value) => onPropertyChange('animationTimingFunction', value, 'style')}
            type="select"
            options={{
              values: [
                'linear',
                'ease',
                'ease-in',
                'ease-out', 
                'ease-in-out',
                'cubic-bezier(0.25, 0.1, 0.25, 1)',
                'cubic-bezier(0.42, 0, 0.58, 1)',
                'cubic-bezier(0.42, 0, 1, 1)',
                'cubic-bezier(0, 0, 0.58, 1)',
                'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                'steps(10, end)',
                'step-start',
                'step-end'
              ]
            }}
          />
        </div>

        {/* Preset Animations */}
        <div>
          <SubsectionHeader title="Preset Animations" />
          <ButtonGrid
            columns={2}
            buttons={[
              {
                label: 'Fade In',
                onClick: () => {
                  onPropertyChange('animationName', 'fadeIn', 'style');
                  onPropertyChange('animationDuration', '0.5s', 'style');
                },
                className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              },
              {
                label: 'Slide Left',
                onClick: () => {
                  onPropertyChange('animationName', 'slideInLeft', 'style');
                  onPropertyChange('animationDuration', '0.6s', 'style');
                },
                className: 'bg-green-100 text-green-800 hover:bg-green-200'
              },
              {
                label: 'Bounce',
                onClick: () => {
                  onPropertyChange('animationName', 'bounce', 'style');
                  onPropertyChange('animationDuration', '2s', 'style');
                },
                className: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              },
              {
                label: 'Pulse',
                onClick: () => {
                  onPropertyChange('animationName', 'pulse', 'style');
                  onPropertyChange('animationDuration', '2s', 'style');
                  onPropertyChange('animationIterationCount', 'infinite', 'style');
                },
                className: 'bg-red-100 text-red-800 hover:bg-red-200'
              }
            ]}
          />
        </div>
      </PropertySection>

      {/* FRAMER MOTION */}
      <PropertySection
        title="Framer Motion"
        Icon={Zap}
        sectionKey="framerMotion"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        {/* Initial & Animate */}
        <div>
          <SubsectionHeader title="Motion Properties" />
          <InputField
            label="Initial State"
            value={currentAnimation.initial}
            onChange={(value) => onPropertyChange('initial', value, 'animation')}
            type="select"
            options={{
              values: ['hidden', 'visible', 'scale0', 'scale1', 'x-100', 'x100', 'y-100', 'y100', 'opacity0', 'opacity1']
            }}
          />
          <InputField
            label="Animate State"
            value={currentAnimation.animate}
            onChange={(value) => onPropertyChange('animate', value, 'animation')}
            type="select"
            options={{
              values: ['visible', 'hidden', 'scale1', 'scale0', 'x0', 'y0', 'opacity1', 'opacity0']
            }}
          />
          <InputField
            label="Exit State"
            value={currentAnimation.exit}
            onChange={(value) => onPropertyChange('exit', value, 'animation')}
            type="select"
            options={{
              values: ['hidden', 'scale0', 'x-100', 'x100', 'y-100', 'y100', 'opacity0']
            }}
          />
        </div>

        {/* Transition Options */}
        <div>
          <SubsectionHeader title="Transition" />
          <InputField
            label="Duration"
            value={currentAnimation.duration}
            onChange={(value) => onPropertyChange('duration', value, 'animation')}
            type="range"
            options={{ min: 0.1, max: 5, step: 0.1, unit: 's' }}
          />
          <InputField
            label="Delay"
            value={currentAnimation.delay}
            onChange={(value) => onPropertyChange('delay', value, 'animation')}
            type="range"
            options={{ min: 0, max: 3, step: 0.1, unit: 's' }}
          />
          <InputField
            label="Ease"
            value={currentAnimation.ease}
            onChange={(value) => onPropertyChange('ease', value, 'animation')}
            type="select"
            options={{
              values: ['linear', 'easeIn', 'easeOut', 'easeInOut', 'circIn', 'circOut', 'circInOut', 'backIn', 'backOut', 'backInOut', 'anticipate', 'bounceIn', 'bounceOut', 'bounceInOut']
            }}
          />
        </div>

        {/* Spring Physics */}
        <div>
          <SubsectionHeader title="Spring Physics" />
          <InputField
            label="Spring Type"
            value={currentAnimation.springType}
            onChange={(value) => onPropertyChange('springType', value, 'animation')}
            type="select"
            options={{
              values: ['spring', 'keyframes', 'tween', 'inertia']
            }}
          />
          {currentAnimation.springType === 'spring' && (
            <div className="space-y-3">
              <InputField
                label="Stiffness"
                value={currentAnimation.stiffness}
                onChange={(value) => onPropertyChange('stiffness', value, 'animation')}
                type="range"
                options={{ min: 1, max: 1000, step: 10 }}
              />
              <InputField
                label="Damping"
                value={currentAnimation.damping}
                onChange={(value) => onPropertyChange('damping', value, 'animation')}
                type="range"
                options={{ min: 1, max: 100, step: 1 }}
              />
              <InputField
                label="Mass"
                value={currentAnimation.mass}
                onChange={(value) => onPropertyChange('mass', value, 'animation')}
                type="range"
                options={{ min: 0.1, max: 10, step: 0.1 }}
              />
            </div>
          )}
        </div>

        {/* Gestures */}
        <div>
          <SubsectionHeader title="Gestures & Interactions" />
          <InputField
            label="While Hover"
            value={currentAnimation.whileHover}
            onChange={(value) => onPropertyChange('whileHover', value, 'animation')}
            type="select"
            options={{
              values: ['scale1.05', 'scale1.1', 'scale0.95', 'rotate5', 'rotate-5', 'y-5', 'brightness1.1']
            }}
          />
          <InputField
            label="While Tap"
            value={currentAnimation.whileTap}
            onChange={(value) => onPropertyChange('whileTap', value, 'animation')}
            type="select"
            options={{
              values: ['scale0.95', 'scale0.9', 'scale1.05', 'rotate5', 'brightness0.9']
            }}
          />
          <InputField
            label="While In View"
            value={currentAnimation.whileInView}
            onChange={(value) => onPropertyChange('whileInView', value, 'animation')}
            type="select"
            options={{
              values: ['visible', 'scale1', 'opacity1', 'x0', 'y0']
            }}
          />
          <InputField
            label="Drag"
            value={currentAnimation.drag}
            onChange={(value) => onPropertyChange('drag', value, 'animation')}
            type="select"
            options={{
              values: [false, true, 'x', 'y']
            }}
          />
        </div>

        {/* Variants */}
        <div>
          <SubsectionHeader title="Custom Variants" />
          <InputField
            label="Variant Name"
            value={currentAnimation.variantName}
            onChange={(value) => onPropertyChange('variantName', value, 'animation')}
          />
          <InputField
            label="Variant Definition"
            value={currentAnimation.variantDefinition}
            onChange={(value) => onPropertyChange('variantDefinition', value, 'animation')}
            type="textarea"
          />
        </div>
      </PropertySection>

      {/* GSAP ANIMATIONS */}
      <PropertySection
        title="GSAP Animations"
        Icon={TrendingUp}
        sectionKey="gsapAnimations"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        {/* GSAP Timeline */}
        <div>
          <SubsectionHeader title="Timeline Control" />
          <InputField
            label="Timeline Name"
            value={currentAnimation.timelineName}
            onChange={(value) => onPropertyChange('timelineName', value, 'animation')}
          />
          <InputField
            label="Timeline Duration"
            value={currentAnimation.timelineDuration}
            onChange={(value) => onPropertyChange('timelineDuration', value, 'animation')}
            type="range"
            options={{ min: 0.1, max: 10, step: 0.1, unit: 's' }}
          />
          <InputField
            label="Timeline Repeat"
            value={currentAnimation.timelineRepeat}
            onChange={(value) => onPropertyChange('timelineRepeat', value, 'animation')}
            type="select"
            options={{
              values: ['0', '1', '2', '3', '-1']
            }}
          />
          <InputField
            label="Timeline Yoyo"
            value={currentAnimation.timelineYoyo}
            onChange={(value) => onPropertyChange('timelineYoyo', value, 'animation')}
            type="checkbox"
          />
        </div>

        {/* GSAP Tweens */}
        <div>
          <SubsectionHeader title="Tween Properties" />
          <InputField
            label="GSAP Animation Type"
            value={currentAnimation.gsapType}
            onChange={(value) => onPropertyChange('gsapType', value, 'animation')}
            type="select"
            options={{
              values: ['to', 'from', 'fromTo', 'set']
            }}
          />
          <InputField
            label="GSAP Duration"
            value={currentAnimation.gsapDuration}
            onChange={(value) => onPropertyChange('gsapDuration', value, 'animation')}
            type="range"
            options={{ min: 0, max: 10, step: 0.1, unit: 's' }}
          />
          <InputField
            label="GSAP Delay"
            value={currentAnimation.gsapDelay}
            onChange={(value) => onPropertyChange('gsapDelay', value, 'animation')}
            type="range"
            options={{ min: 0, max: 5, step: 0.1, unit: 's' }}
          />
          <InputField
            label="GSAP Ease"
            value={currentAnimation.gsapEase}
            onChange={(value) => onPropertyChange('gsapEase', value, 'animation')}
            type="select"
            options={{
              values: [
                'none',
                'power1.in', 'power1.out', 'power1.inOut',
                'power2.in', 'power2.out', 'power2.inOut',
                'power3.in', 'power3.out', 'power3.inOut',
                'power4.in', 'power4.out', 'power4.inOut',
                'back.in', 'back.out', 'back.inOut',
                'bounce.in', 'bounce.out', 'bounce.inOut',
                'circ.in', 'circ.out', 'circ.inOut',
                'elastic.in', 'elastic.out', 'elastic.inOut',
                'expo.in', 'expo.out', 'expo.inOut',
                'sine.in', 'sine.out', 'sine.inOut'
              ]
            }}
          />
        </div>

        {/* GSAP Stagger */}
        <div>
          <SubsectionHeader title="Stagger Effects" />
          <InputField
            label="Stagger Amount"
            value={currentAnimation.staggerAmount}
            onChange={(value) => onPropertyChange('staggerAmount', value, 'animation')}
            type="range"
            options={{ min: 0, max: 2, step: 0.1, unit: 's' }}
          />
          <InputField
            label="Stagger From"
            value={currentAnimation.staggerFrom}
            onChange={(value) => onPropertyChange('staggerFrom', value, 'animation')}
            type="select"
            options={{
              values: ['start', 'center', 'edges', 'random', 'end']
            }}
          />
          <InputField
            label="Stagger Axis"
            value={currentAnimation.staggerAxis}
            onChange={(value) => onPropertyChange('staggerAxis', value, 'animation')}
            type="select"
            options={{
              values: ['x', 'y', 'both']
            }}
          />
        </div>

        {/* GSAP Morphing */}
        <div>
          <SubsectionHeader title="Morphing & Special Effects" />
          <InputField
            label="Morph Target"
            value={currentAnimation.morphTarget}
            onChange={(value) => onPropertyChange('morphTarget', value, 'animation')}
          />
          <InputField
            label="Text Plugin"
            value={currentAnimation.textPlugin}
            onChange={(value) => onPropertyChange('textPlugin', value, 'animation')}
            type="select"
            options={{
              values: ['none', 'scramble', 'typewriter', 'split']
            }}
          />
          <InputField
            label="Draw SVG"
            value={currentAnimation.drawSVG}
            onChange={(value) => onPropertyChange('drawSVG', value, 'animation')}
            options={{ placeholder: '0% 100%' }}
          />
        </div>
      </PropertySection>

      {/* SCROLL TRIGGER */}
      <PropertySection
        title="Scroll Trigger & Scroll Animations"
        Icon={Activity}
        sectionKey="scrollTrigger"
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
      >
        {/* Basic ScrollTrigger */}
        <div>
          <SubsectionHeader title="ScrollTrigger Setup" />
          <InputField
            label="Enable ScrollTrigger"
            value={currentAnimation.scrollTrigger?.enabled}
            onChange={(value) => {
              const scrollTrigger = currentAnimation.scrollTrigger || {};
              onPropertyChange('scrollTrigger', { ...scrollTrigger, enabled: value }, 'animation');
            }}
            type="checkbox"
          />
          
          {currentAnimation.scrollTrigger?.enabled && (
            <div className="space-y-3">
              <InputField
                label="Trigger Element"
                value={currentAnimation.scrollTrigger.trigger}
                onChange={(value) => {
                  const scrollTrigger = currentAnimation.scrollTrigger || {};
                  onPropertyChange('scrollTrigger', { ...scrollTrigger, trigger: value }, 'animation');
                }}
                options={{ placeholder: 'self or selector' }}
              />
              
              <InputField
                label="Start Position"
                value={currentAnimation.scrollTrigger.start}
                onChange={(value) => {
                  const scrollTrigger = currentAnimation.scrollTrigger || {};
                  onPropertyChange('scrollTrigger', { ...scrollTrigger, start: value }, 'animation');
                }}
                type="select"
                options={{
                  values: ['top center', 'top bottom', 'center center', 'bottom top', 'top top', '20% 80%']
                }}
              />
              
              <InputField
                label="End Position"
                value={currentAnimation.scrollTrigger.end}
                onChange={(value) => {
                  const scrollTrigger = currentAnimation.scrollTrigger || {};
                  onPropertyChange('scrollTrigger', { ...scrollTrigger, end: value }, 'animation');
                }}
                type="select"
                options={{
                  values: ['bottom top', 'bottom center', 'center top', '+=300', '+=500', '+=100%']
                }}
              />
              
              <InputField
                label="Scrub"
                value={currentAnimation.scrollTrigger.scrub}
                onChange={(value) => {
                  const scrollTrigger = currentAnimation.scrollTrigger || {};
                  onPropertyChange('scrollTrigger', { ...scrollTrigger, scrub: value }, 'animation');
                }}
                type="checkbox"
              />
              
              <InputField
                label="Pin Element"
                value={currentAnimation.scrollTrigger.pin}
                onChange={(value) => {
                  const scrollTrigger = currentAnimation.scrollTrigger || {};
                  onPropertyChange('scrollTrigger', { ...scrollTrigger, pin: value }, 'animation');
                }}
                type="checkbox"
              />
              
              <InputField
                label="Snap"
                value={currentAnimation.scrollTrigger.snap}
                onChange={(value) => {
                  const scrollTrigger = currentAnimation.scrollTrigger || {};
                  onPropertyChange('scrollTrigger', { ...scrollTrigger, snap: value }, 'animation');
                }}
                type="select"
                options={{
                  values: ['none', '1', '0.5', 'labels', 'labelsDirectional']
                }}
              />
              
              <InputField
                label="Toggle Actions"
                value={currentAnimation.scrollTrigger.toggleActions}
                onChange={(value) => {
                  const scrollTrigger = currentAnimation.scrollTrigger || {};
                  onPropertyChange('scrollTrigger', { ...scrollTrigger, toggleActions: value }, 'animation');
                }}
                type="select"
                options={{
                  values: ['play none none none', 'play pause resume reset', 'play reverse play reverse', 'restart pause restart pause']
                }}
              />
            </div>
          )}
        </div>

        {/* Scroll Animations */}
        <div>
          <SubsectionHeader title="Scroll Animations" />
          <InputField
            label="Animation on Scroll"
            value={currentAnimation.scrollAnimation}
            onChange={(value) => onPropertyChange('scrollAnimation', value, 'animation')}
            type="select"
            options={{
              values: ['fadeIn', 'fadeOut', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'scaleUp', 'scaleDown', 'rotateIn', 'rotateOut', 'flipX', 'flipY']
            }}
          />
          
          <InputField
            label="Parallax Effect"
            value={currentAnimation.parallax}
            onChange={(value) => onPropertyChange('parallax', value, 'animation')}
            type="select"
            options={{
              values: ['none', 'slow', 'medium', 'fast', 'custom']
            }}
          />
          
          {currentAnimation.parallax === 'custom' && (
            <div className="space-y-3">
              <InputField
                label="Parallax Speed"
                value={currentAnimation.parallaxSpeed}
                onChange={(value) => onPropertyChange('parallaxSpeed', value, 'animation')}
                type="range"
                options={{ min: -5, max: 5, step: 0.1 }}
              />
              <InputField
                label="Parallax Direction"
                value={currentAnimation.parallaxDirection}
                onChange={(value) => onPropertyChange('parallaxDirection', value, 'animation')}
                type="select"
                options={{
                  values: ['vertical', 'horizontal', 'both']
                }}
              />
            </div>
          )}
        </div>

        {/* Batch ScrollTrigger */}
        <div>
          <SubsectionHeader title="Batch Animations" />
          <InputField
            label="Batch Elements"
            value={currentAnimation.batch?.enabled}
            onChange={(value) => {
              const batch = currentAnimation.batch || {};
              onPropertyChange('batch', { ...batch, enabled: value }, 'animation');
            }}
            type="checkbox"
          />
          
          {currentAnimation.batch?.enabled && (
            <div className="space-y-3">
              <InputField
                label="Batch Selector"
                value={currentAnimation.batch.selector}
                onChange={(value) => {
                  const batch = currentAnimation.batch || {};
                  onPropertyChange('batch', { ...batch, selector: value }, 'animation');
                }}
                options={{ placeholder: '.batch-item' }}
              />
              
              <InputField
                label="Batch Interval"
                value={currentAnimation.batch.interval}
                onChange={(value) => {
                  const batch = currentAnimation.batch || {};
                  onPropertyChange('batch', { ...batch, interval: value }, 'animation');
                }}
                type="range"
                options={{ min: 0.1, max: 2, step: 0.1, unit: 's' }}
              />
            </div>
          )}
        </div>
      </PropertySection>
    </>
  );
};

export default AnimationSection;