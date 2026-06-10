import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type ConfettiProps = {
  active: boolean;
  particleCount?: number;
};

type ParticleSeed = {
  color: string;
  startX: number;
  driftX: number;
  rotation: number;
  startDelay: number;
  fadeDelay: number;
};

const PARTICLE_COLORS = [
  '#F44336',
  '#FF9800',
  '#FFEB3B',
  '#4CAF50',
  '#2196F3',
  '#9C27B0',
];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function buildSeeds(count: number): ParticleSeed[] {
  return Array.from({length: count}, () => ({
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]!,
    startX: randomBetween(-70, 70),
    driftX: randomBetween(-70, 70),
    rotation: randomBetween(-480, 480),
    startDelay: randomBetween(0, 280),
    fadeDelay: randomBetween(700, 1150),
  }));
}

function Particle({
  seed,
  index,
}: {
  seed: ParticleSeed;
  index: number;
}): React.JSX.Element {
  const tx = useSharedValue(seed.startX);
  const ty = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  tx.value = withDelay(
    seed.startDelay,
    withTiming(seed.startX + seed.driftX, {
      duration: 1300,
      easing: Easing.linear,
    }),
  );
  ty.value = withDelay(
    seed.startDelay,
    withTiming(260, {duration: 1300, easing: Easing.linear}),
  );
  rotate.value = withDelay(
    seed.startDelay,
    withTiming(seed.rotation, {duration: 1300}),
  );
  opacity.value = withDelay(seed.fadeDelay, withTiming(0, {duration: 200}));

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {translateX: tx.value},
      {translateY: ty.value},
      {rotate: `${rotate.value}deg`},
    ],
  }));

  return (
    <Animated.View
      testID={`confetti-particle-${index}`}
      style={[styles.particle, {backgroundColor: seed.color}, animatedStyle]}
    />
  );
}

export function Confetti({
  active,
  particleCount = 24,
}: ConfettiProps): React.JSX.Element | null {
  const seeds = useMemo(
    () => (active ? buildSeeds(particleCount) : []),
    [active, particleCount],
  );

  if (!active) return null;

  return (
    <View testID="confetti-root" pointerEvents="none" style={styles.root}>
      {seeds.map((seed, index) => (
        <Particle
          key={`${index}-${seed.startX}-${seed.rotation}`}
          seed={seed}
          index={index}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
