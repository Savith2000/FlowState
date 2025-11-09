import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

export default function SkeletonCard() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Animated.View style={[styles.iconSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.titleSkeleton, { opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.badgeSkeleton, { opacity: pulseAnim }]} />
      </View>
      <Animated.View style={[styles.descriptionSkeleton, { opacity: pulseAnim }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFEF9',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#44403C',
    padding: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconSkeleton: {
    backgroundColor: '#E7E5E4',
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 12,
  },
  titleSkeleton: {
    backgroundColor: '#E7E5E4',
    height: 22,
    flex: 1,
    borderRadius: 8,
  },
  badgeSkeleton: {
    backgroundColor: '#E7E5E4',
    height: 30,
    width: 65,
    borderRadius: 12,
  },
  descriptionSkeleton: {
    backgroundColor: '#E7E5E4',
    height: 18,
    width: '85%',
    borderRadius: 6,
  },
});

