import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AppConstants} from '../utils/AppConstants';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';


const EventDetailPage = ({route, navigation}) => {
  const {event} = route.params;

  const currentUser = auth().currentUser;
  const userId = currentUser ? currentUser.uid : null;

  const [isParticipating, setIsParticipating] = useState(false);
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (event.participants && userId) {
      setIsParticipating(event.participants.includes(userId));
    }

    if (event.dateTime) {
      startCountdownTimer(event.dateTime);
    }

    return () => clearInterval(timerRef.current);
  }, []);

  const startCountdownTimer = eventDateTime => {
    const targetTime = new Date(eventDateTime).getTime();

    timerRef.current = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance <= 0) {
        clearInterval(timerRef.current);
        setCountdown('Event Started');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
  };

  const handleParticipateToggle = async () => {
    if (!userId) {
      alert('Please login to participate.');
      return;
    }

    const eventRef = firestore().collection('events').doc(event.id);

    try {
      if (isParticipating) {
        await eventRef.update({
          participants: firestore.FieldValue.arrayRemove(userId),
        });
        setIsParticipating(false);
      } else {
        await eventRef.update({
          participants: firestore.FieldValue.arrayUnion(userId),
        });
        setIsParticipating(true);
      }
    } catch (error) {
      console.error('Participation error:', error);
      alert('Failed to update participation status.');
    }
  };

  const renderSection = (title, content) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.underline} />
      <View style={styles.sectionContent}>{content}</View>
    </View>
  );

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.gradientContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Icon name="arrow-back" size={28} color={AppConstants.primaryColor} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        {event.images && event.images.length > 0 ? (
          <FlatList
            data={event.images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <Image source={{uri: item}} style={styles.eventImage} />
            )}
            style={{marginBottom: 20}}
          />
        ) : (
          <Image source={{uri: event.image}} style={styles.eventImage} />
        )}

        <Text style={styles.eventTitle}>{event.title}</Text>

        {renderSection(
          'Description',
          <Text style={styles.eventDescription}>{event.description}</Text>,
        )}

        {event.location &&
          renderSection(
            'Location',
            <Text style={styles.eventDescription}>{event.location}</Text>,
          )}

        {event.rules &&
          renderSection(
            'Rules',
            Array.isArray(event.rules) ? (
              event.rules.map((rule, i) => (
                <Text key={i} style={styles.ruleText}>
                  {i + 1}. {rule}
                </Text>
              ))
            ) : (
              <Text style={styles.eventDescription}>{event.rules}</Text>
            ),
          )}

        {isParticipating ? (
          <View style={styles.participatingContainer}>
            <Text style={styles.participatingText}>You are participating</Text>
            <Text style={styles.countdownText}>Starts in: {countdown}</Text>
            <TouchableOpacity
              style={[styles.participateButton, styles.cancelButton]}
              onPress={handleParticipateToggle}>
              <Text style={styles.participateButtonText}>
                Cancel Participation
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.participateButton}
            onPress={handleParticipateToggle}>
            <Text style={styles.participateButtonText}>Participate</Text>
          </TouchableOpacity>
        )}

        {event.contactInfo &&
          renderSection(
            'Contact',
            Array.isArray(event.contactInfo) ? (
              event.contactInfo.map((contact, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    if (contact.includes('@')) {
                      Linking.openURL(`mailto:${contact}`);
                    } else {
                      Linking.openURL(`tel:${contact}`);
                    }
                  }}>
                  <Text style={styles.contactText}>{contact}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (event.contactInfo.includes('@')) {
                    Linking.openURL(`mailto:${event.contactInfo}`);
                  } else {
                    Linking.openURL(`tel:${event.contactInfo}`);
                  }
                }}>
                <Text style={styles.contactText}>{event.contactInfo}</Text>
              </TouchableOpacity>
            ),
          )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginTop: 20, // adjust as needed for status bar
    marginLeft: 15,
    padding: 5,
    alignSelf: 'flex-start',
    // optional shadow
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    zIndex: 10,
  },
  eventImage: {
    width: 320,
    height: 220,
    borderRadius: 15,
    marginRight: 15,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: AppConstants.brightColor,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  sectionContainer: {
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppConstants.brightColor,
  },
  underline: {
    width: 50,
    height: 4,
    backgroundColor: AppConstants.primaryColor,
    marginVertical: 8,
    borderRadius: 2,
  },
  sectionContent: {
    marginTop: 5,
  },
  eventDescription: {
    fontSize: 16,
    color: '#eee',
    lineHeight: 22,
  },
  ruleText: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 6,
    lineHeight: 22,
  },
  participateButton: {
    marginTop: 10,
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#b00020', // a slightly brighter red for better look
    marginTop: 10,
    marginBottom: 15,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#d32f2f', // subtle red shadow
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5, // for Android shadow
  },

  participateButtonText: {
    color: AppConstants.brightColor,
    fontSize: 20,
    fontWeight: '700',
  },
  participatingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  participatingText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'lightgreen',
  },
  countdownText: {
    marginTop: 8,
    fontSize: 18,
    color: '#eee',
  },
  contactText: {
    fontSize: 16,
    color: AppConstants.primaryColor,
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
});

export default EventDetailPage;
