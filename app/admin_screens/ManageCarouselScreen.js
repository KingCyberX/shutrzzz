import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Button,
  FlatList,
  Image,
  Alert,
  Modal,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import {LinearGradient} from 'react-native-linear-gradient';
import {AppConstants} from '../utils/AppConstants';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons

// Cloudinary URL and Upload Preset
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dl608o0ir/image/upload'; // Replace with your Cloudinary URL
const CLOUDINARY_UPLOAD_PRESET = 'shutrzzz'; // Your unsigned upload preset

const ManageCarouselScreen = ({navigation}) => {
  const [carouselImages, setCarouselImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Modal visibility state
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false); // To track if we are editing an existing image
  const [editImageId, setEditImageId] = useState(null); // To store the image ID to be edited

  useEffect(() => {
    // Fetch carousel images when the component mounts
    fetchCarouselImages();
  }, []);

  // Fetch carousel images from Firestore
  const fetchCarouselImages = async () => {
    try {
      const snapshot = await firestore().collection('carouselImages').get();
      const images = snapshot.docs.map(doc => ({
        id: doc.id,
        url: doc.data().url,
        title: doc.data().title || '',
      }));
      setCarouselImages(images);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };
  // When you close the modal (whether from editing or adding), reset the states.
  const closeModal = () => {
    setModalVisible(false);
    setEditMode(false); // Reset the edit mode so the next time the modal is opened, it will be for adding a new image.
    setNewTitle(''); // Reset the title input.
    setImageUri(null); // Reset the selected image.
  };

  // Function to choose an image
  const chooseImage = () => {
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        setImageUri(image.path); // Set the URI of the selected image
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to select image');
      });
  };

  // Function to upload the image to Cloudinary and save it in Firestore
  const uploadImage = async () => {
    if (!imageUri || !newTitle) {
      Alert.alert('Error', 'Please choose an image and provide a title');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'carousel_image.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      // Upload to Cloudinary
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const cloudinaryUrl = response.data.secure_url;
      setNewImageUrl(cloudinaryUrl); // Set the image URL

      if (editMode) {
        // If we are editing, update the existing image in Firestore
        await firestore().collection('carouselImages').doc(editImageId).update({
          url: cloudinaryUrl,
          title: newTitle,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

        Alert.alert(
          'Update Successful',
          'Your image was updated successfully!',
        );
      } else {
        // Save the Cloudinary URL to Firestore under the 'carouselImages' collection
        await firestore().collection('carouselImages').add({
          url: cloudinaryUrl,
          title: newTitle,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

        Alert.alert(
          'Upload Successful',
          'Your image was uploaded successfully!',
        );
      }

      setImageUri(null);
      setNewTitle('');
      setEditMode(false);
      fetchCarouselImages(); // Reload the images after adding or editing
    } catch (error) {
      console.error('Upload failed', error);
      Alert.alert('Upload Failed', 'There was an issue uploading the image.');
    } finally {
      setUploading(false);
      setModalVisible(false); // Close the modal after saving
    }
  };

  // Function to delete image from Firestore and Cloudinary
  const deleteImage = async id => {
    try {
      // Delete image from Firestore
      await firestore().collection('carouselImages').doc(id).delete();

      Alert.alert('Success', 'Image deleted successfully');
      setCarouselImages(carouselImages.filter(img => img.id !== id)); // Remove from state
    } catch (error) {
      Alert.alert('Error', 'Failed to delete image');
      console.error(error);
    }
  };

  // Function to set modal for editing an image
  const editImage = (id, title, url) => {
    setNewTitle(title);
    setImageUri(url);
    setEditMode(true);
    setEditImageId(id); // Set the ID of the image to edit
    setModalVisible(true); // Open the modal
  };

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={28} color={AppConstants.primaryColor} />
      </TouchableOpacity>

      <Text style={styles.title}>Manage Carousel</Text>

      {/* Button to open modal for adding a new carousel image */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Carousel Image</Text>
      </TouchableOpacity>

      {/* Carousel Images List */}
      <Text style={styles.title}>Uploaded Carousel Images</Text>

      <FlatList
        data={carouselImages}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.imageCard}>
            {/* Image, Title and Action Buttons in a row */}
            <View style={styles.imageRow}>
              <Image source={{uri: item.url}} style={styles.image} />
              <View style={styles.textAndButtons}>
                <View style={styles.actionButtons}>
                  <Text style={styles.imageTitle}>{item.title}</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => editImage(item.id, item.title, item.url)}>
                    <Icon name="edit" size={24} color="orange" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteImage(item.id)}>
                    <Icon name="delete" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      {/* Modal for adding or editing a carousel image */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editMode ? 'Edit Carousel Image' : 'Add Carousel Image'}
            </Text>

            {/* Label and Input for Image Title */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Image Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Image Title"
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            {/* Choose Image Button */}
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={chooseImage}>
              <Text style={styles.buttonText}>Choose Image</Text>
            </TouchableOpacity>

            {imageUri && (
              <Image source={{uri: imageUri}} style={styles.image} />
            )}
            {uploading && <Text>Uploading...</Text>}

            {/* Inline Save and Close Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveButton, {marginRight: 10}]}
                onPress={uploadImage}
                disabled={uploading || !imageUri || !newTitle}>
                <Text style={styles.saveButtonText}>
                  {editMode ? 'Save Changes' : 'Save'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 10,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppConstants.primaryColor,
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonContainer: {
    backgroundColor: AppConstants.primaryColor,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    marginBottom: 20,
    textAlign: 'center',
  },
  imageCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  textAndButtons: {
    flex: 1,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppConstants.primaryColor,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: AppConstants.primaryColor,
    marginBottom: 20,
  },
  closeModalButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%%',
  },
  addButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10, // Adds rounded corners
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0,
      height: 2, // Vertical shadow
    },
    shadowOpacity: 0.1, // Light shadow opacity
    shadowRadius: 6, // Radius of shadow
    elevation: 3, // Shadow effect for Android
    alignItems: 'center', // Center text horizontally
    marginVertical: 10, // Space between buttons
  },
  addButtonText: {
    color: '#fff', // White text color
    fontSize: 16,
    fontWeight: '600', // Semi-bold font weight
  },
});

export default ManageCarouselScreen;
