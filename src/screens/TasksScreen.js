import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();
  
  let [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
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
      <GlassBackground>
        <Text style={styles.loadingText}>Loading...</Text>
      </GlassBackground>
    );
  }

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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor="#10B981" />
          }
        >
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptySubtitle}>
                Start by adding your first task
              </Text>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {tasks.map((task) => (
                <GlassCard key={task.id} style={styles.taskCard}>
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
                </GlassCard>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.addButtonContainer}>
          <GlassButton
            onPress={() => navigation.navigate('AddTask')}
            variant="primary"
          >
            ADD TASK +
          </GlassButton>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  emptyState: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#44403C',
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
  },
  emptySubtitle: {
    color: '#78716C',
    fontSize: 15,
    fontFamily: 'Quicksand_600SemiBold',
    marginTop: 10,
  },
  tasksList: {
    gap: 16,
  },
  taskCard: {
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  taskName: {
    color: '#44403C',
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    flex: 1,
    marginRight: 12,
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
    bottom: 32,
    left: 24,
    right: 24,
  },
  loadingText: {
    color: '#78716C',
    fontSize: 17,
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
    marginTop: 100,
  },
});
