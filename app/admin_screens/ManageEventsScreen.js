import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {LinearGradient} from 'react-native-linear-gradient';
import {AppConstants} from '../utils/AppConstants'; // Assuming this is where primary color is defined
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker'; // To select image
import axios from 'axios';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment'; // For easy date formatting

// Cloudinary URL and Upload Preset
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dl608o0ir/image/upload'; // Replace with your Cloudinary URL
const CLOUDINARY_UPLOAD_PRESET = 'shutrzzz'; // Your unsigned upload preset

const ManageEventsScreen = ({navigation}) => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [addEventModalVisible, setAddEventModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    location: '',
    dateTime: new Date(),
    description: '',
    image: '',
    contactInfo: '',
    participants: '',
    rules: '',
    images: [],
  });
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const snapshot = await firestore().collection('events').get();
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to fetch events.');
    }
  };

  const handleDeleteEvent = async eventId => {
    try {
      await firestore().collection('events').doc(eventId).delete();
      fetchEvents(); // Refresh events list
      Alert.alert('Success', 'Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete the event');
    }
  };

  const handleAddNewEvent = async () => {
    try {
      // If an image is selected, upload to Cloudinary
      let imageUrl = newEvent.image;
      if (newEvent.image) {
        imageUrl = await uploadImageToCloudinary(newEvent.image);
        if (!imageUrl) {
          return; // If image upload fails, stop adding the event
        }
      }

      const eventData = {
        title: newEvent.title.trim(),
        location: newEvent.location.trim(),
        dateTime: newEvent.dateTime.toISOString(),
        description: newEvent.description.trim(),
        image: imageUrl || null,
        contactInfo: newEvent.contactInfo.trim()
          ? newEvent.contactInfo.split(',')
          : null,
        participants: newEvent.participants.trim()
          ? newEvent.participants.split(',')
          : null,
        rules: newEvent.rules.trim() ? newEvent.rules.split(',') : null,
        images: newEvent.images.length > 0 ? newEvent.images : null,
      };

      await firestore().collection('events').add(eventData);

      // Reset the form after submission
      setNewEvent({
        title: '',
        location: '',
        dateTime: new Date(),
        description: '',
        image: '',
        contactInfo: '',
        participants: '',
        rules: '',
        images: [],
      });

      Alert.alert('Success', 'Event added successfully!');
      setAddEventModalVisible(false);
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'Failed to add the event');
    }
  };

  // Select image for event
  const pickImage = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
    }).then(image => {
      setNewEvent({...newEvent, image: image.path});
    });
  };

  // Upload Image to Cloudinary and save the URL in Firestore
  const uploadImageToCloudinary = async imagePath => {
    const formData = new FormData();
    formData.append('file', {
      uri: imagePath,
      type: 'image/jpeg',
      name: 'image.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const cloudinaryUrl = response.data.secure_url;
      return cloudinaryUrl;
    } catch (error) {
      console.error('Upload failed', error);
      Alert.alert('Upload Failed', 'There was an issue uploading the image.');
      return null;
    }
  };

  const renderEvent = ({item}) => (
    <View style={styles.Eventimg}>
      <Image
        source={{uri: item.image}}
        style={styles.eventImage}
        resizeMode="cover"
      />
      <View style={styles.eventCard}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
      </View>
      <View style={styles.eventActions}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('EventDetailAdminScreen', {event: item})
          }>
          <Icon name="visibility" size={24} color={AppConstants.primaryColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
          <Icon name="delete" size={24} color={'red'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAddEventModal = () => (
    <Modal
      visible={addEventModalVisible}
      animationType="slide"
      transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Event</Text>

          {/* Title */}
          <Text style={styles.label}>Event Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            value={newEvent.title}
            onChangeText={text => setNewEvent({...newEvent, title: text})}
          />

          {/* Location */}
          <Text style={styles.label}>Event Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Location"
            value={newEvent.location}
            onChangeText={text => setNewEvent({...newEvent, location: text})}
          />

          {/* Description */}
          <Text style={styles.label}>Event Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Description"
            value={newEvent.description}
            onChangeText={text => setNewEvent({...newEvent, description: text})}
          />

          {/* Date and Time Picker */}
          <Text style={styles.label}>Event Date and Time</Text>
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <Text style={styles.input}>
              {moment(newEvent.dateTime).format('YYYY-MM-DD HH:mm')}
            </Text>
          </TouchableOpacity>

          {/* DateTimePicker Modal */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            date={newEvent.dateTime}
            onConfirm={date => {
              setDatePickerVisible(false);
              setNewEvent({...newEvent, dateTime: date});
            }}
            onCancel={() => setDatePickerVisible(false)}
          />

          {/* Image Picker */}
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}>
            <Text style={styles.imagePickerButtonText}>Pick Event Image</Text>
          </TouchableOpacity>

          {/* Display selected image */}
          {newEvent.image ? (
            <Image
              source={{uri: newEvent.image}}
              style={styles.selectedImage}
            />
          ) : null}

          {/* Save and Cancel buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={handleAddNewEvent}
              style={[
                styles.button,
                {backgroundColor: AppConstants.primaryColor},
              ]}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAddEventModalVisible(false)}
              style={[styles.button, {backgroundColor: 'gray'}]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={AppConstants.primaryColor} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Manage Events</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, {backgroundColor: AppConstants.primaryColor}]}
        onPress={() => setAddEventModalVisible(true)}>
        <Text style={styles.buttonText}>Add New Event</Text>
      </TouchableOpacity>

      {/* Render Add Event Modal */}
      {renderAddEventModal()}

      {/* Render Event Details or Events List */}
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={item => item.id}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  button: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  imagePickerButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalActions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginBottom: 10,
    marginRight: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 15,
  },
  backButton: {
    marginRight: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    marginBottom: 10,
  },
  eventCard: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    textAlign: 'center',
  },
  Eventimg: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventLocation: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
  },
});

export default ManageEventsScreen;
