// app/screens/HomeScreen.js

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import LottieView from 'lottie-react-native';
import {AppConstants} from '../utils/AppConstants';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = ({navigation}) => {
  const openLink = url => {
    Linking.openURL(url).catch(err =>
      console.error('Error opening link: ', err),
    );
  };

  return (
    
    <LinearGradient 
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      {/* Upper Part: Animation */}
      <View style={styles.upperContainer}>
        <LottieView
          source={require('../assets/film.json')}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>

      {/* Lower Part: Buttons + Social Media */}
      <View style={styles.lowerContainer}>
        <Text style={[styles.title, {color: AppConstants.primaryColor}]}>
          Welcome to Shutrzzz
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LoginScreen')}>
          <Icon
            name="sign-in"
            size={20}
            color="#3D5C51"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignupScreen')}>
          <Icon
            name="user-plus"
            size={20}
            color="#3D5C51"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.button}
          onPress={() => alert('Sign in with Google Button Pressed!')}>
          <Icon
            name="google"
            size={20}
            color="#3D5C51"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity> */}

        <View style={styles.socialContainer}>
          <TouchableOpacity
            onPress={() => openLink('https://www.facebook.com')}>
            <Icon
              name="facebook"
              size={30}
              color="#4267B2"
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openLink('https://www.instagram.com')}>
            <Icon
              name="instagram"
              size={30}
              color="#E1306C"
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://www.twitter.com')}>
            <Icon
              name="twitter"
              size={30}
              color="#1DA1F2"
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  upperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 250,
    height: 250,
  },
  lowerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: -3},
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
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
    width: '70%',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    color: AppConstants.primaryColor,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  socialIcon: {
    marginHorizontal: 15,
  },
});

export default HomeScreen;
