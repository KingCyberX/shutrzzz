// /utils/location.js

import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform} from 'react-native';

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'App needs access to your location to show weather data.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });
