import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import SkeletonCard from '../components/SkeletonCard';
import SwipeableTask from '../components/SwipeableTask';
import * as Icons from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = 180;

const getIconComponent = (iconName) => {
  if (!iconName) return Icons.Circle;
  
  const pascalCase = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  return Icons[pascalCase] || Icons.Circle;
};

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deletedTask, setDeletedTask] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoOpacity = useRef(new Animated.Value(0)).current;
  const undoTimer = useRef(null);
  const restoredTaskId = useRef(null);
  const { signOut, user } = useAuth();
  const animatedValues = useRef({}).current;
  
  let [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  const fetchTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error} = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setTasks(data || []);
    }
    setLoading(false);
    setInitialLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (!taskToDelete) return;

    setDeletedTask(taskToDelete);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    setShowUndo(true);
    Animated.timing(undoOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
    }
    
    undoTimer.current = setTimeout(async () => {
      Animated.timing(undoOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowUndo(false);
        setDeletedTask(null);
      });
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Failed to delete task:', error);
      }
    }, 10000);
  };

  const handleUndoDelete = () => {
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
    }
    
    Animated.timing(undoOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowUndo(false);
      setDeletedTask(null);
    });
    
    if (deletedTask) {
      restoredTaskId.current = deletedTask.id;
      
      animatedValues[deletedTask.id] = {
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0.5),
      };
      
      setTasks(prevTasks => {
        const newTasks = [deletedTask, ...prevTasks];
        return newTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      });
      
      setTimeout(() => {
        if (animatedValues[deletedTask.id]) {
          Animated.parallel([
            Animated.spring(animatedValues[deletedTask.id].opacity, {
              toValue: 1,
              useNativeDriver: true,
              friction: 6,
              tension: 80,
            }),
            Animated.spring(animatedValues[deletedTask.id].scale, {
              toValue: 1,
              useNativeDriver: true,
              friction: 6,
              tension: 80,
              overshootClamping: false,
            }),
          ]).start(() => {
            restoredTaskId.current = null;
          });
        }
      }, 50);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    fetchTasks();

    const subscription = supabase
      .channel('tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const scrollY = useRef(new Animated.Value(0)).current;

  const handleLogout = async () => {
    await signOut();
  };

  if (!user || !fontsLoaded) {
    return (
      <GlassBackground>
        <Text style={styles.loadingText}>Loading...</Text>
      </GlassBackground>
    );
  }

  const renderTaskCard = ({ item: task, index }) => {
    const IconComponent = getIconComponent(task.icon_name);
    
    const inputRange = [
      (index - 1) * CARD_HEIGHT,
      index * CARD_HEIGHT,
      (index + 1) * CARD_HEIGHT,
    ];
    
    const carouselScale = scrollY.interpolate({
      inputRange,
      outputRange: [0.88, 1, 0.88],
      extrapolate: 'clamp',
    });
    
    const carouselOpacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    const isRestored = restoredTaskId.current === task.id;
    const restoreAnim = animatedValues[task.id];

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [
              { 
                scale: isRestored && restoreAnim 
                  ? Animated.multiply(carouselScale, restoreAnim.scale)
                  : carouselScale 
              }
            ],
            opacity: isRestored && restoreAnim
              ? Animated.multiply(carouselOpacity, restoreAnim.opacity)
              : carouselOpacity,
          },
        ]}
      >
        <SwipeableTask onDelete={() => handleDeleteTask(task.id)}>
          <GlassCard style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={styles.taskTitleRow}>
                <View style={styles.iconContainer}>
                  <IconComponent 
                    size={24} 
                    color="#10B981" 
                    strokeWidth={2.5}
                  />
                </View>
                <Text style={styles.taskName} numberOfLines={2}>
                  {task.name}
                </Text>
              </View>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {task.duration} min
                </Text>
              </View>
            </View>
            {task.description ? (
              <Text style={styles.taskDescription}>
                {task.description}
              </Text>
            ) : null}
          </GlassCard>
        </SwipeableTask>
      </Animated.View>
    );
  };

  const renderContent = () => {
    if (initialLoading) {
      return (
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }
    
    if (tasks.length === 0) {
      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.emptyState}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor="#10B981" />
          }
        >
          <View style={styles.emptyIllustration}>
            <Image 
              source={require('../../assets/cat.png')} 
              style={styles.emptyCatImage}
              contentFit="contain"
            />
            <View style={styles.emptyChecklistBox}>
              <View style={styles.emptyCheckItem}>
                <View style={styles.emptyCheckbox} />
                <View style={styles.emptyCheckLine} />
              </View>
              <View style={styles.emptyCheckItem}>
                <View style={styles.emptyCheckbox} />
                <View style={styles.emptyCheckLine} />
              </View>
              <View style={styles.emptyCheckItem}>
                <View style={styles.emptyCheckbox} />
                <View style={styles.emptyCheckLineLong} />
              </View>
            </View>
          </View>
          <Text style={styles.emptyTitle}>All Clear!</Text>
          <Text style={styles.emptySubtitle}>
            No tasks yet. Ready to get started?
          </Text>
        </ScrollView>
      );
    }

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.FlatList
          data={tasks}
          renderItem={renderTaskCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={CARD_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
          getItemLayout={(data, index) => ({
            length: CARD_HEIGHT,
            offset: CARD_HEIGHT * index,
            index,
          })}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={loading && !initialLoading} onRefresh={fetchTasks} tintColor="#10B981" />
          }
        />
      </GestureHandlerRootView>
    );
  };

  return (
    <GlassBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <View style={styles.logoRow}>
              <Image 
                source={require('../../assets/cat.png')} 
                style={styles.catImage}
                contentFit="contain"
              />
              <Text style={styles.appName}>FlowState</Text>
            </View>
            <Text style={styles.title}>Your Tasks</Text>
            <Text style={styles.subtitle}>{tasks.length} tasks</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}

        <View style={styles.addButtonContainer}>
          <GlassButton
            onPress={() => navigation.navigate('AddTask')}
            variant="primary"
          >
            ADD TASK +
          </GlassButton>
        </View>

        {showUndo && (
          <Animated.View style={[styles.undoContainer, { opacity: undoOpacity }]}>
            <View style={styles.undoCard}>
              <Text style={styles.undoText}>Task deleted</Text>
              <TouchableOpacity onPress={handleUndoDelete} style={styles.undoButton}>
                <Text style={styles.undoButtonText}>UNDO</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFEF9',
    borderBottomWidth: 3,
    borderBottomColor: '#44403C',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  catImage: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  appName: {
    color: '#10B981',
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
  },
  title: {
    color: '#44403C',
    fontSize: 30,
    fontFamily: 'Quicksand_700Bold',
  },
  subtitle: {
    color: '#78716C',
    fontSize: 15,
    fontFamily: 'Quicksand_600SemiBold',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FFFEF9',
    borderWidth: 3,
    borderColor: '#44403C',
    borderRadius: 16,
  },
  logoutText: {
    color: '#10B981',
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
  },
  carouselContent: {
    paddingTop: 40,
    paddingBottom: 380,
    paddingHorizontal: 24,
  },
  cardWrapper: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
  },
  skeletonContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIllustration: {
    position: 'relative',
    width: 200,
    height: 180,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCatImage: {
    width: 100,
    height: 100,
    position: 'absolute',
    left: 20,
    top: 40,
  },
  emptyChecklistBox: {
    position: 'absolute',
    right: 20,
    top: 30,
    backgroundColor: '#FFFEF9',
    borderWidth: 3,
    borderColor: '#44403C',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    transform: [{ rotate: '8deg' }],
  },
  emptyCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#44403C',
    borderRadius: 6,
    backgroundColor: '#FFFEF9',
  },
  emptyCheckLine: {
    width: 40,
    height: 3,
    backgroundColor: '#D6D3D1',
    borderRadius: 2,
  },
  emptyCheckLineLong: {
    width: 60,
    height: 3,
    backgroundColor: '#D6D3D1',
    borderRadius: 2,
  },
  emptyTitle: {
    color: '#44403C',
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#78716C',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
    maxWidth: 280,
  },
  taskCard: {},
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#44403C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskName: {
    color: '#44403C',
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    flex: 1,
  },
  durationBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#44403C',
  },
  durationText: {
    color: '#047857',
    fontSize: 13,
    fontFamily: 'Quicksand_700Bold',
  },
  taskDescription: {
    color: '#78716C',
    fontSize: 15,
    fontFamily: 'Quicksand_400Regular',
    lineHeight: 22,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: 'transparent',
  },
  loadingText: {
    color: '#78716C',
    fontSize: 17,
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
    marginTop: 100,
  },
  undoContainer: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  undoCard: {
    backgroundColor: 'rgba(68, 64, 60, 0.95)',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#44403C',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  undoText: {
    color: '#FFFEF9',
    fontSize: 15,
    fontFamily: 'Quicksand_600SemiBold',
    marginRight: 20,
  },
  undoButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFEF9',
  },
  undoButtonText: {
    color: '#FFFEF9',
    fontSize: 13,
    fontFamily: 'Quicksand_700Bold',
  },
});
