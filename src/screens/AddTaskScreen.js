import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import GlassButton from '../components/GlassButton';

export default function AddTaskScreen({ navigation }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  let [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    const durationNum = parseInt(duration);
    if (!duration || isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Error', 'Please enter a valid duration (minutes)');
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: user.id,
          name: name.trim(),
          duration: durationNum,
          description: description.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (token && data?.id) {
        const supabaseUrl = supabase.supabaseUrl;
        
        fetch(`${supabaseUrl}/functions/v1/suggest-task-icon`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: data.id,
            taskName: name.trim(),
            taskDescription: description.trim() || '',
          }),
        }).catch(err => {
          console.log('Icon suggestion failed:', err);
        });
      }
    } catch (iconError) {
      console.log('Icon suggestion error:', iconError);
    }

    setLoading(false);
    navigation.goBack();
  };

  return (
    <GlassBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.logoRow}>
                <Image 
                  source={require('../../assets/cat.png')} 
                  style={styles.catImage}
                  contentFit="contain"
                />
                <Text style={styles.appName}>New Task</Text>
              </View>
              <Text style={styles.title}>ADD A TASK</Text>
              <Text style={styles.subtitle}>
                Break it down, make it manageable
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <GlassCard>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Task Name</Text>
                <GlassInput
                  placeholder="What needs to be done?"
                  value={name}
                  onChangeText={setName}
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <GlassInput
                  placeholder="30"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (optional)</Text>
                <GlassInput
                  placeholder="Any additional details..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                  maxLength={500}
                />
              </View>

              <GlassButton
                onPress={handleSubmit}
                disabled={loading}
                variant="primary"
                style={styles.submitButton}
              >
                {loading ? 'CREATING...' : 'CREATE TASK'}
              </GlassButton>
            </GlassCard>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  backButton: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#10B981',
    fontSize: 17,
    fontFamily: 'Quicksand_700Bold',
  },
  headerContent: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  catImage: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  appName: {
    color: '#10B981',
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
  },
  title: {
    color: '#44403C',
    fontSize: 30,
    fontFamily: 'Quicksand_700Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#78716C',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#44403C',
    fontSize: 15,
    fontFamily: 'Quicksand_700Bold',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  submitButton: {
    marginTop: 12,
  },
  bottomSpacer: {
    height: 100,
  },
});
