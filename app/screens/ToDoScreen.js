import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AppConstants} from '../utils/AppConstants';
import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const ToDoScreen = ({navigation}) => {
  const user = auth().currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  const [eventName, setEventName] = useState('');
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen to todoList collection where userId == current user id
    const unsubscribe = firestore()
      .collection('todoList')
      .where('userId', '==', user.uid)
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        snapshot => {
          const eventsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setEvents(eventsData);
          setLoading(false);
        },
        error => {
          console.error('Firestore snapshot error:', error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [user]);

  const addEvent = async () => {
    if (!eventName.trim() || !user) return;

    const newEvent = {
      userId: user.uid,
      name: eventName.trim(),
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      timestamp: firestore.FieldValue.serverTimestamp(),
    };

    try {
      await firestore().collection('todoList').add(newEvent);
      setEventName('');
      setDate(new Date());
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(
        prev =>
          new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            prev.getHours(),
            prev.getMinutes(),
          ),
      );
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setDate(
        prev =>
          new Date(
            prev.getFullYear(),
            prev.getMonth(),
            prev.getDate(),
            selectedTime.getHours(),
            selectedTime.getMinutes(),
          ),
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
      <View style={styles.innerContainer}>
        <Text style={styles.text}>To-Do List</Text>

        <TouchableOpacity
          style={styles.addEventButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Add Event</Text>
        </TouchableOpacity>

        <FlatList
          data={events}
          keyExtractor={item => item.id}
          contentContainerStyle={{marginTop: 20}}
          ListEmptyComponent={
            <Text
              style={{color: AppConstants.primaryColor, fontStyle: 'italic'}}>
              No events added yet.
            </Text>
          }
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.eventItem}
              onPress={() =>
                navigation.navigate('ToDoDetailScreen', {
                  eventId: item.id,
                  eventName: item.name,
                })
              }>
              <Text style={styles.eventName}>{item.name}</Text>
              <Text style={styles.eventDateTime}>
                {item.date} at {item.time}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Event</Text>

            <TextInput
              placeholder="Event Name"
              value={eventName}
              onChangeText={setEventName}
              style={styles.input}
              autoFocus
            />

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateTimeButton}>
              <Text style={styles.dateTimeButtonText}>
                Select Date: {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={styles.dateTimeButton}>
              <Text style={styles.dateTimeButtonText}>
                Select Time:{' '}
                {date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={onChangeTime}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {backgroundColor: AppConstants.secondaryColor},
                ]}
                onPress={addEvent}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {backgroundColor: AppConstants.primaryColor},
                ]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {flex: 1},
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    marginBottom: 25,
    alignSelf: 'center',
  },
  addEventButton: {
    backgroundColor: AppConstants.secondaryColor,
    paddingVertical: 16,
    paddingHorizontal: 55,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: AppConstants.brightColor,
    fontSize: 18,
    fontWeight: '700',
  },
  eventItem: {
    backgroundColor: AppConstants.brightColor,
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  eventName: {
    fontSize: 20,
    fontWeight: '700',
    color: AppConstants.primaryColor,
  },
  eventDateTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: AppConstants.primaryColor,
  },
  input: {
    borderColor: '#bbb',
    borderWidth: 1.2,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  dateTimeButton: {
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: AppConstants.primaryColor,
    marginBottom: 15,
    alignItems: 'center',
  },
  dateTimeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
  },
});


export default ToDoScreen;
