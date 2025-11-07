import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from './src/hooks/useAuth';
import AuthScreen from './src/screens/AuthScreen';
import TasksScreen from './src/screens/TasksScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Tasks" component={TasksScreen} />
          <Stack.Screen 
            name="AddTask" 
            component={AddTaskScreen}
            options={{
              animation: 'slide_from_bottom',
            }}
          />
        </Stack.Navigator>
      ) : (
        <AuthScreen />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
