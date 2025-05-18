import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import LottieView from 'lottie-react-native'; // Import LottieView for animation
import {AppConstants} from '../utils/AppConstants'; // Your custom constants file
import Icon from 'react-native-vector-icons/MaterialIcons'; // Material Icons for the back button
import LinearGradient from 'react-native-linear-gradient';

const SignupScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state

  // Default role is 'user'
 const role = true; // true means user, false means admin

 const handleSignup = async () => {
   try {
     setLoading(true);
     const userCredential = await auth().createUserWithEmailAndPassword(
       email,
       password,
     );
     const {user} = userCredential;

     // Save user data with boolean role
     await firestore().collection('users').doc(user.uid).set({
       name,
       email,
       role, // boolean now
       createdAt: firestore.FieldValue.serverTimestamp(),
     });

     Alert.alert('Signup Successful', 'You have been successfully signed up!', [
       {text: 'OK', onPress: () => navigation.navigate('LoginScreen')},
     ]);
   } catch (error) {
     Alert.alert('Signup Error', error.message);
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Lottie Animation for Signup */}
      <LottieView
        source={require('../assets/film.json')} // Signup animation file
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Title */}
      <Text style={[styles.title, {color: AppConstants.primaryColor}]}>
        Signup
      </Text>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Signup Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading} // Disable the button while loading
      >
        {loading ? (
          <ActivityIndicator color={AppConstants.primaryColor} /> // Show loading spinner
        ) : (
          <Text style={styles.buttonText}>Signup</Text>
        )}
      </TouchableOpacity>

      {/* Navigate to Login */}
      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  animation: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingLeft: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4, // for Android shadow
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
    fontSize: 18,
    color: AppConstants.primaryColor,
    fontWeight: '500',
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;
