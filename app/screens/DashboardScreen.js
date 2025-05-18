import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import AppBar from '../components/AppBar';
import BottomNav from '../components/BottomNav';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const DashboardScreen = ({navigation}) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          navigation.replace('LoginScreen'); // User not logged in, redirect
          return;
        }
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          setUserData(userDoc.data());
        } else {
          // Handle missing user data
          alert('User data not found!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigation]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar title="Dashboard" navigation={navigation} userData={userData} />
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default DashboardScreen;
