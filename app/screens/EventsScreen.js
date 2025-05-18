import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import {AppConstants} from '../utils/AppConstants';

const EventsScreen = ({navigation}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('events') // Your Firestore collection name
      .onSnapshot(
        querySnapshot => {
          const eventsData = [];
          querySnapshot.forEach(doc => {
            eventsData.push({id: doc.id, ...doc.data()});
          });
          setEvents(eventsData);
          setLoading(false);
        },
        error => {
          console.error(error);
          setLoading(false);
        },
      );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleEventClick = event => {
    navigation.navigate('EventDetailPage', {event});
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color={AppConstants.primaryColor} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      <FlatList
        data={events}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => handleEventClick(item)}>
            <Image source={{uri: item.image}} style={styles.eventImage} />
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{paddingBottom:70}}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  eventCard: {
    backgroundColor: AppConstants.brightColor,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 10,
  },
  eventDescription: {
    fontSize: 14,
    color: AppConstants.primaryColor,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default EventsScreen;
