import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, StyleSheet, Image } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function AddTaskScreen({ navigation }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
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
    const { error } = await supabase.from('tasks').insert([
      {
        user_id: user.id,
        name: name.trim(),
        duration: durationNum,
        description: description.trim() || null,
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <Animated.View 
          entering={FadeInDown.duration(500)}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <Image 
              source={require('../../assets/cat.webp')} 
              style={styles.catImage}
              resizeMode="contain"
            />
            <Text style={styles.appName}>New Task</Text>
          </View>
          <Text style={styles.title}>Add a Task</Text>
          <Text style={styles.subtitle}>
            Break it down, make it manageable
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.form}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="30"
              placeholderTextColor="#9CA3AF"
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional details..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#10B981", "#34D399"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>
                {loading ? 'Creating...' : 'Create Task'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  catImage: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  appName: {
    color: '#059669',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.5,
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: -1,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 32,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  submitButton: {
    height: 56,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  bottomSpacer: {
    height: 128,
  },
});
