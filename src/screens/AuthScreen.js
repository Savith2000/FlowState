import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { useAuth } from '../hooks/useAuth';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import GlassButton from '../components/GlassButton';
import TypewriterText from '../components/TypewriterText';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  
  let [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Pacifico_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    let result;
    if (isSignUp) {
      result = await signUp(email, password);
    } else {
      result = await signIn(email, password);
    }
    
    setLoading(false);

    if (result.error) {
      Alert.alert('Error', result.error.message);
    } else if (isSignUp) {
      Alert.alert('Success', 'Check your email to confirm your account');
    }
  };

  return (
    <GlassBackground>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TypewriterText 
              text={isSignUp ? 'Create Account' : 'Welcome Back'}
              style={styles.title}
              delay={100}
            />
          </View>

          <View style={styles.cardContainer}>
            <Image 
              source={require('../../assets/cat_animated.gif')} 
              style={styles.catOnCard}
              contentFit="contain"
            />
            
            <GlassCard style={styles.formCard}>
            <Text style={styles.flowStateInCard}>FlowState</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <GlassInput
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <GlassInput
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <GlassButton
              onPress={handleAuth}
              disabled={loading}
              variant="primary"
              style={styles.submitButton}
            >
              {loading ? 'LOADING...' : isSignUp ? 'SIGN UP' : 'SIGN IN'}
            </GlassButton>

            <GlassButton
              onPress={() => setIsSignUp(!isSignUp)}
              variant="secondary"
              style={styles.toggleButton}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </GlassButton>
          </GlassCard>
          
          <Text style={styles.subtitle}>
            Progress, not pressure
          </Text>
        </View>
      </View>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: '#44403C',
    fontSize: 36,
    fontFamily: 'Pacifico_400Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#78716C',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
    marginTop: 20,
  },
  cardContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 40,
  },
  catOnCard: {
    width: 220,
    height: 165,
    position: 'absolute',
    top: -85,
    zIndex: 10,
  },
  formCard: {
    paddingTop: 80,
    width: '100%',
  },
  flowStateInCard: {
    color: '#10B981',
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    textAlign: 'center',
    marginBottom: 10,
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
  submitButton: {
    marginTop: 12,
  },
  toggleButton: {
    marginTop: 14,
  },
});
