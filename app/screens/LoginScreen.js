import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import LottieView from 'lottie-react-native';
import {AppConstants} from '../utils/AppConstants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      // No manual navigation here — root App.js will handle routing
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Half */}
        <View style={styles.topHalf}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>

          <LottieView
            source={require('../assets/film.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        {/* Bottom Half */}
        <View style={styles.bottomHalf}>
          <Text style={[styles.title, {color: AppConstants.primaryColor}]}>
            Login
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={AppConstants.primaryColor} />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => alert('Redirect to Forgot Password Screen')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('SignupScreen')}>
            <Text style={styles.linkText}>Don't have an account? Signup</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bottomHalf: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  animation: {
    width: 220,
    height: 220,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
    paddingLeft: 15,
    borderRadius: 25,
  },
  button: {
    backgroundColor: AppConstants.secondaryColor,
    borderWidth: 1,
    borderColor: AppConstants.primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    justifyContent: 'center',
  },
  buttonText: {
    color: AppConstants.primaryColor,
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: AppConstants.primaryColor,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
