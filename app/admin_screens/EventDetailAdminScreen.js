import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
  Linking,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { AppConstants } from '../utils/AppConstants'; // Your colors
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker'; // Image picker
import axios from 'axios'; // For making the API call to Cloudinary

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dl608o0ir/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'shutrzzz'; // Your unsigned upload preset

const EventDetailAdminScreen = ({ route, navigation }) => {
  const { event } = route.params;

  // Modal state
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [newContactInfo, setNewContactInfo] = useState('');
  const [newImageUri, setNewImageUri] = useState('');
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [newRule, setNewRule] = useState('');
  
  // Open modal to add contact info
  const handleAddContactInfo = () => {
    setNewContactInfo('');
    setInfoModalVisible(true);
  };

  // Handle the image picker to select an image
  const pickImage = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
    })
      .then(image => {
        setNewImageUri(image.path);
        setImageModalVisible(true); // Show confirmation modal before uploading
      })
      .catch(err => {
        console.log('Image selection cancelled', err);
      });
  };
  
  const deleteImageFromFirestore = async imageUrlToDelete => {
    try {
      const eventRef = firestore().collection('events').doc(event.id);
      const doc = await eventRef.get();

      if (doc.exists) {
        const currentImages = doc.data().images || [];
        const updatedImages = currentImages.filter(
          url => url !== imageUrlToDelete,
        );

        await eventRef.update({
          images: updatedImages,
        });

        Alert.alert('Deleted', 'Image removed successfully!');
        fetchEventData(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      Alert.alert('Error', 'Unable to delete image.');
    }
  };
  const addRuleToFirestore = async () => {
    if (!newRule.trim()) {
      Alert.alert('Error', 'Please enter a rule.');
      return;
    }

    try {
      const eventRef = firestore().collection('events').doc(event.id);
      const doc = await eventRef.get();

      if (!doc.exists) {
        Alert.alert('Error', 'Event not found');
        setRulesModalVisible(false);
        return;
      }

      const currentRules = doc.data().rules || [];
      const updatedRules = [...currentRules, newRule.trim()];

      await eventRef.update({
        rules: updatedRules,
      });

      Alert.alert('Success', 'Rule added successfully!');
      setNewRule('');
      setRulesModalVisible(false);
      fetchEventData(); // Refresh rules list
    } catch (error) {
      console.error('Error updating rules:', error);
      Alert.alert('Error', 'Failed to update rules.');
    }
  };
  const deleteRuleFromFirestore = async ruleToDelete => {
    try {
      const eventRef = firestore().collection('events').doc(event.id);
      const doc = await eventRef.get();

      if (doc.exists) {
        const currentRules = doc.data().rules || [];
        const updatedRules = currentRules.filter(rule => rule !== ruleToDelete);

        await eventRef.update({
          rules: updatedRules,
        });

        Alert.alert('Deleted', 'Rule removed successfully!');
        fetchEventData(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
      Alert.alert('Error', 'Unable to delete rule.');
    }
  };
  
  // Upload image to Cloudinary and get the URL
  const uploadImageToCloudinary = async (imagePath) => {
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
      return response.data.secure_url;
    } catch (error) {
      console.error('Upload failed', error);
      Alert.alert('Upload Failed', 'There was an issue uploading the image.');
      return null;
    }
  };

  // Update contactInfo array in Firestore by appending new contact info
  const addContactInfoToFirestore = async () => {
    if (!newContactInfo.trim()) {
      Alert.alert('Error', 'Please enter contact information.');
      return;
    }

    try {
      const eventRef = firestore().collection('events').doc(event.id);

      // Fetch the current event document to get existing contactInfo
      const doc = await eventRef.get();
      if (!doc.exists) {
        Alert.alert('Error', 'Event not found');
        setInfoModalVisible(false);
        return;
      }

      // Get current contactInfo array or initialize to an empty array if not available
      const currentContactInfo = doc.data().contactInfo || [];

      // Append new contact info
      const updatedContactInfo = [...currentContactInfo, newContactInfo.trim()];

      // Update Firestore document
      await eventRef.update({
        contactInfo: updatedContactInfo,
      });

      Alert.alert('Success', 'Contact information added successfully!');
      setInfoModalVisible(false);
    } catch (error) {
      console.error('Error updating contact info:', error);
      Alert.alert('Error', 'Failed to update contact information.');
    }
  };

  // Update images array in Firestore by appending new image URL
  const addImageToFirestore = async () => {
    if (!newImageUri) {
      Alert.alert('Error', 'Please select an image.');
      return;
    }

    const imageUrl = await uploadImageToCloudinary(newImageUri);

    if (!imageUrl) return;

    try {
      const eventRef = firestore().collection('events').doc(event.id);

      // Fetch the current event document to get existing images
      const doc = await eventRef.get();
      if (!doc.exists) {
        Alert.alert('Error', 'Event not found');
        return;
      }

      // Get current images array or initialize to an empty array if not available
      const currentImages = doc.data().images || [];

      // Append the new image URL
      const updatedImages = [...currentImages, imageUrl];

      // Update Firestore document
      await eventRef.update({
        images: updatedImages,
      });

      Alert.alert('Success', 'Image added successfully!');
      setNewImageUri('');
      setImageModalVisible(false); // Close modal after adding image
      fetchEventData(); // Refresh the event data
    } catch (error) {
      console.error('Error updating images:', error);
      Alert.alert('Error', 'Failed to update images.');
    }
  };

  // Function to fetch the updated event data from Firestore
  const fetchEventData = async () => {
    try {
      const eventRef = firestore().collection('events').doc(event.id);
      const doc = await eventRef.get();
      if (doc.exists) {
        const updatedEvent = doc.data();
        // Navigate back and pass the updated event data to refresh the screen
        navigation.replace('EventDetailAdminScreen', { event: updatedEvent });
      } else {
        Alert.alert('Error', 'Event not found.');
      }
    } catch (error) {
      console.error('Error fetching updated event data:', error);
      Alert.alert('Error', 'Failed to refresh event data.');
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
      style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Icon name="arrow-back" size={28} color={AppConstants.primaryColor} />
      </TouchableOpacity>

      {/* Contact Info Modal */}
      <Modal
        visible={infoModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInfoModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Contact Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact info (email or phone)"
              value={newContactInfo}
              onChangeText={setNewContactInfo}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {backgroundColor: AppConstants.primaryColor},
                ]}
                onPress={addContactInfoToFirestore}>
                <Text style={styles.buttonText}>Add Info</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: 'gray'}]}
                onPress={() => setInfoModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Display existing contact info with delete option */}
            {event.contactInfo && event.contactInfo.length > 0 && (
              <View style={styles.contactList}>
                {event.contactInfo.map((contact, index) => (
                  <View key={index} style={styles.contactItem}>
                    <Text style={styles.contactText}>{contact}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteContactInfo(contact)}>
                      <Icon name="delete" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setImageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Upload Image</Text>
            <Image
              source={{uri: newImageUri}}
              style={{width: '100%', height: 200, borderRadius: 10}}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {backgroundColor: AppConstants.primaryColor},
                ]}
                onPress={addImageToFirestore}>
                <Text style={styles.buttonText}>Upload Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: 'gray'}]}
                onPress={() => setImageModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={rulesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRulesModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Rule</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter rule"
              value={newRule}
              onChangeText={setNewRule}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {backgroundColor: AppConstants.primaryColor},
                ]}
                onPress={addRuleToFirestore}>
                <Text style={styles.buttonText}>Add Rule</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: 'gray'}]}
                onPress={() => setRulesModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Show Existing Rules */}
            {event.rules && event.rules.length > 0 && (
              <View style={styles.contactList}>
                {event.rules.map((rule, index) => (
                  <View key={index} style={styles.contactItem}>
                    <Text>{rule}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteRuleFromFirestore(rule)}>
                      <Icon name="delete" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {event.images && event.images.length > 0 ? (
          <FlatList
            data={event.images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View
                style={{
                  backgroundColor: '#fff',
                  marginRight: 10,
                  borderRadius: 10,
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  shadowOffset: {width: 0, height: 2},
                  padding: 5,
                  position: 'relative',
                }}>
                <Image
                  source={{uri: item}}
                  style={{
                    width: 150,
                    height: 100,
                    borderRadius: 8,
                  }}
                />
                <TouchableOpacity
                  onPress={() => deleteImageFromFirestore(item)}
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: '#b00020',
                    borderRadius: 20,
                    padding: 4,
                    zIndex: 2,
                  }}>
                  <Icon name="delete" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            style={{marginBottom: 20}}
          />
        ) : (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              elevation: 3,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 5,
              shadowOffset: {width: 0, height: 2},
              padding: 5,
              marginBottom: 20,
            }}>
            <Image
              source={{uri: event.image}}
              style={{
                width: '100%',
                height: 180,
                borderRadius: 8,
              }}
            />
          </View>
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

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={handleAddContactInfo}>
            <Text style={styles.buttonText}>+ Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={pickImage}>
            <Text style={styles.buttonText}>+ Img</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={() => setRulesModalVisible(true)}>
            <Text style={styles.buttonText}>+ Rules</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  backButton: {
    marginTop: 20,
    marginLeft: 15,
    padding: 5,
    alignSelf: 'flex-start',
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
  },
  eventImage: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: AppConstants.brightColor,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
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
  contactText: {
    fontSize: 16,
    color: AppConstants.primaryColor,
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
  actionsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: AppConstants.primaryColor,
  },
  buttonText: {
    color: AppConstants.brightColor,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactList: {
    marginTop: 15,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#b00020',
    padding: 5,
    borderRadius: 5,
  },
});

export default EventDetailAdminScreen;
