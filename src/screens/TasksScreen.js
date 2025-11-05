import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Image } from 'react-native';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();
  
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const fetchTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setTasks(data || []);
    }
    setLoading(false);
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

  const handleLogout = async () => {
    await signOut();
  };

  if (!user || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeInDown.duration(500)}
        style={styles.header}
      >
        <View>
          <View style={styles.logoRow}>
            <Image 
              source={require('../../assets/cat.webp')} 
              style={styles.catImage}
              resizeMode="contain"
            />
            <Text style={styles.appName}>FlowState</Text>
          </View>
          <Text style={styles.title}>Your Tasks</Text>
          <Text style={styles.subtitle}>{tasks.length} tasks</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor="#10B981" />
        }
      >
        {tasks.length === 0 ? (
          <Animated.View 
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.emptyState}
          >
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>✨</Text>
            </View>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by adding your first task
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.tasksList}>
            {tasks.map((task, index) => (
              <Animated.View
                key={task.id}
                entering={FadeInUp.delay(index * 80).duration(500)}
                layout={Layout.springify()}
                style={styles.taskCard}
              >
                <View style={styles.taskHeader}>
                  <Text style={styles.taskName} numberOfLines={2}>
                    {task.name}
                  </Text>
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
              </Animated.View>
            ))}
            <View style={styles.bottomSpacer} />
          </View>
        )}
      </ScrollView>

      <Animated.View 
        entering={FadeInUp.delay(400).duration(500)}
        style={styles.addButtonContainer}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTask')}
          style={styles.addButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#10B981", "#34D399"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Text style={styles.addButtonText}>Add Task</Text>
            <Text style={styles.addButtonIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  catImage: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  appName: {
    color: '#059669',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.5,
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
    letterSpacing: -1,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyState: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    color: '#374151',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  tasksList: {
    paddingTop: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskName: {
    color: '#111827',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
    marginRight: 12,
  },
  durationBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  durationText: {
    color: '#059669',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  taskDescription: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 96,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  addButton: {
    height: 56,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginRight: 8,
  },
  addButtonIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 100,
  },
});
