import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AppConstants} from '../utils/AppConstants';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dl608o0ir/image/upload'; // Cloudinary URL
const CLOUDINARY_UPLOAD_PRESET = 'shutrzzz'; // Cloudinary Upload preset

const AdminGalleryImages = ({route, navigation}) => {
  const {galleryId} = route.params; // Get galleryId from the route params
  const [galleryImages, setGalleryImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [imageTitle, setImageTitle] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch gallery images from Firestore based on galleryId
  const fetchGalleryImages = async () => {
    if (!galleryId) {
      return;
    }

    try {
      const snapshot = await firestore()
        .collection('galleryImages')
        .where('galleryId', '==', galleryId) // Filter images by galleryId
        .get();

      if (snapshot.empty) {
        return;
      }

      const images = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt, // Firestore timestamp
        };
      });

      setGalleryImages(images);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  useEffect(() => {
    if (galleryId) {
      fetchGalleryImages();
    }
  }, [galleryId]);

  // Handle delete functionality
  const handleDeleteImage = async id => {
    try {
      await firestore().collection('galleryImages').doc(id).delete();
      setGalleryImages(galleryImages.filter(image => image.id !== id)); // Remove image from state
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Handle add image functionality
  const handleAddImage = async () => {
    if (!imageTitle || !imageDescription || !imageUri) {
      Alert.alert('Error', 'Please fill in all fields and select an image');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      // Upload image to Cloudinary
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      const cloudinaryUrl = response.data.secure_url;

      // Save image info to Firestore
      await firestore().collection('galleryImages').add({
        galleryId: galleryId,
        title: imageTitle,
        description: imageDescription,
        imageUrl: cloudinaryUrl,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      setModalVisible(false); // Close modal
      setImageTitle('');
      setImageDescription('');
      setImageUri(null);
      setLoading(false);
      fetchGalleryImages(); // Refresh gallery
    } catch (error) {
      setLoading(false);
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'There was an issue uploading the image');
    }
  };

  // Render header component for the FlatList
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={28} color={AppConstants.primaryColor} />
      </TouchableOpacity>
      <Text style={styles.title}>Gallery Images</Text>
      {/* Add Image Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.addButton}>
        <Icon name="add" size={28} color="white" />
        <Text style={styles.addButtonText}>Add Image</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      {/* FlatList to display images and render header */}
      <FlatList
        ListHeaderComponent={renderHeader} // Use renderHeader to render the header
        data={galleryImages}
        renderItem={({item}) => (
          <View style={styles.imageContainer}>
            <Image source={{uri: item.imageUrl}} style={styles.galleryImage} />
            <View style={styles.textContainer}>
              <Text style={styles.imageTitle}>{item.title}</Text>
              <Text style={styles.imageDescription}>{item.description}</Text>
              <Text style={styles.createdAt}>
                {item.createdAt?.toDate().toLocaleString()}{' '}
                {/* Convert Firestore timestamp */}
              </Text>
            </View>
            {/* Delete Button */}
            <TouchableOpacity
              onPress={() => handleDeleteImage(item.id)}
              style={styles.deleteButton}>
              <Icon name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
      />

      {/* Modal for Adding Image */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Image</Text>

            {/* Input for Image Title */}
            <TextInput
              style={styles.input}
              placeholder="Image Title"
              value={imageTitle}
              onChangeText={setImageTitle}
            />

            {/* Input for Image Description */}
            <TextInput
              style={styles.input}
              placeholder="Image Description"
              value={imageDescription}
              onChangeText={setImageDescription}
            />

            {/* Choose Image Button */}
            <TouchableOpacity
              onPress={() => {
                ImagePicker.openPicker({
                  width: 800,
                  height: 800,
                  cropping: true,
                  mediaType: 'photo',
                })
                  .then(image => {
                    setImageUri(image.path);
                  })
                  .catch(error => {
                    Alert.alert('Error', 'Failed to select image');
                  });
              }}
              style={styles.chooseImageButton}>
              <Text style={styles.chooseImageButtonText}>Choose Image</Text>
            </TouchableOpacity>

            {/* Show selected image */}
            {imageUri && (
              <Image source={{uri: imageUri}} style={styles.selectedImage} />
            )}

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleAddImage}
              style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>
                {loading ? 'Uploading...' : 'Save Image'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// Styles for the page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppConstants.primaryColor,
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    justifyContent: 'center',
    padding: 10,
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    textAlign: 'center',
  },
  imageDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  createdAt: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
    textAlign: 'center',
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: 'transparent',
    padding: 5,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  chooseImageButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  chooseImageButtonText: {
    color: 'white',
    fontSize: 16,
  },
  selectedImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 10,
  },
  uploadButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default AdminGalleryImages;
