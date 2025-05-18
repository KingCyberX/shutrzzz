// app/screens/SplashScreen.js

import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native'; // Import LottieView for animation
import {AppConstants} from '../utils/AppConstants'; // Import app constants for colors
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    // Navigate to HomeScreen after 5 seconds
    const timer = setTimeout(() => {
      navigation.replace('HomeScreen');
    }, 2000); // Splash duration is now 5 seconds

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [navigation]);

  const colorFilters = [
    {
      keypath: 'shape1', // The shape/part name in the Lottie JSON
      color: AppConstants.secondaryColor, // Apply secondary color from AppConstants
    },
    {
      keypath: 'shape2',
      color: '#FF5733', // A different color (e.g., red)
    },
  ];

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
            start={{x: 0.5, y: 0}}
            end={{x: 0.5, y: 1}}
            style={styles.container}>
      <LottieView
        source={require('../assets/film.json')} // Your Lottie animation file
        autoPlay
        loop
        style={styles.animation}
        colorFilters={colorFilters} // Apply the color filters
      />
      <Text style={[styles.title, {color: AppConstants.primaryColor}]}>
        Shutrzzz
      </Text>
      {/* Text color set to primary */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 30,
    color: AppConstants.secondaryColor, // Use secondary color for title text
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default SplashScreen;
