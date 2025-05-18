import React from 'react';
import {TouchableOpacity, Text, StyleSheet, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For icons
import {AppConstants} from '../utils/AppConstants'; // Import AppConstants for colors
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient
import auth from '@react-native-firebase/auth'; // Import Firebase Auth

const AppBar = ({title, navigation, isProfileScreen}) => {
  const handleLogout = () => {
    auth()
      .signOut()
      .catch(error => {
        Alert.alert('Logout Error', error.message);
      });
  };
  


  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      {/* Conditionally Render Back Button or Profile Button */}
      {isProfileScreen ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={30} color={AppConstants.brightColor} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('ProfileScreen')}>
          <Icon name="person" size={30} color={AppConstants.brightColor} />
        </TouchableOpacity>
      )}

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="exit-to-app" size={30} color={AppConstants.brightColor} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppConstants.primaryColor,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    color: AppConstants.brightColor,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoutButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppBar;
