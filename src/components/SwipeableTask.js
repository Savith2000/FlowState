import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';

export default function SwipeableTask({ children, onDelete }) {
  const swipeableRef = useRef(null);
  const deleteAnimation = useRef(new Animated.Value(1)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    swipeableRef.current?.close();
    
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: -500,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(deleteAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete();
    });
  };

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -20, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteContainer,
          {
            transform: [{ translateX: trans }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
          disabled={isDeleting}
        >
          <Trash2 size={28} color="#FFFEF9" strokeWidth={2.5} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={{
        opacity: deleteAnimation,
        transform: [{ translateX: slideAnimation }],
      }}
    >
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
        enabled={!isDeleting}
      >
        {children}
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  deleteContainer: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#44403C',
    marginBottom: 16,
    marginLeft: 12,
    overflow: 'hidden',
  },
  deleteButton: {
    width: 90,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 8,
  },
  deleteText: {
    color: '#FFFEF9',
    fontSize: 12,
    fontFamily: 'Quicksand_700Bold',
    marginTop: 2,
  },
});

