import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppConstants} from '../utils/AppConstants';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dl608o0ir/image/upload'; // Cloudinary URL
const CLOUDINARY_UPLOAD_PRESET = 'shutrzzz'; // Cloudinary Upload preset

const ManageGalleryScreen = ({navigation}) => {
  const [galleryImages, setGalleryImages] = useState([]); // State to hold gallery images
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [isEditing, setIsEditing] = useState(false); // Track if we are editing
  const [selectedImage, setSelectedImage] = useState(null); // For storing the selected image
  const [imageTitle, setImageTitle] = useState(''); // For storing title
  const [imageDescription, setImageDescription] = useState(''); // For storing description
  const [currentImageId, setCurrentImageId] = useState(null); // To identify the image being edited
  const [loading, setLoading] = useState(false); // For loading state during image upload

  // Function to fetch gallery images from Firestore
  const fetchGalleryImages = async () => {
    try {
      const snapshot = await firestore().collection('galleries').get(); // Fetch images from Firestore
      const images = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          createdAt: data.createdAt,
          imageUrl: data.imageUrl,
          galleryId: data.galleryId, // Store galleryId
        };
      });
      setGalleryImages(images); // Update state with gallery images
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  useEffect(() => {
    fetchGalleryImages(); // Fetch images on component mount
  }, []);

  const handleAddNewImage = () => {
    console.log('Opening Modal...'); // Add a log to check if it's being triggered
    setIsEditing(false);
    setModalVisible(true); // Make sure this is being triggered
    setImageTitle('');
    setImageDescription('');
    setSelectedImage(null);
  };
  // Handle selecting an image from gallery
  const chooseImage = () => {
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        setSelectedImage(image.path);
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to select image');
      });
  };

  // Handle upload to Cloudinary and save data to Firestore
  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: selectedImage,
      type: 'image/jpeg',
      name: 'image.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      // Upload to Cloudinary
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      const cloudinaryUrl = response.data.secure_url;

      // Create a timestamp for the new image
      const timestamp = firestore.FieldValue.serverTimestamp();

      if (isEditing) {
        // Edit existing image
        await firestore().collection('galleries').doc(currentImageId).update({
          title: imageTitle,
          description: imageDescription,
          imageUrl: cloudinaryUrl,
          createdAt: timestamp,
        });
      } else {
        // Add new image to Firestore
        await firestore().collection('galleries').add({
          title: imageTitle,
          description: imageDescription,
          imageUrl: cloudinaryUrl,
          createdAt: timestamp,
        });
      }

      // Close modal and refresh the gallery list
      setModalVisible(false);
      setImageTitle('');
      setImageDescription('');
      setSelectedImage(null);
      setLoading(false);
      fetchGalleryImages(); // Refresh gallery after adding or editing

      Alert.alert('Success', 'Image has been successfully added/updated');
    } catch (error) {
      console.error('Upload failed', error);
      setLoading(false);
      Alert.alert('Upload Failed', 'There was an issue uploading the image.');
    }
  };

  // Handle delete image functionality
  const handleDeleteImage = async id => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        {text: 'Cancel'},
        {
          text: 'Delete',
          onPress: async () => {
            await firestore().collection('galleries').doc(id).delete();
            setGalleryImages(galleryImages.filter(image => image.id !== id));
            Alert.alert('Deleted', 'Image has been deleted.');
          },
        },
      ],
      {cancelable: true},
    );
  };

  // Handle edit image functionality
  const handleEditImage = id => {
    const selectedImage = galleryImages.find(image => image.id === id);
    setIsEditing(true);
    setCurrentImageId(id);
    setImageTitle(selectedImage.title);
    setImageDescription(selectedImage.description);
    setSelectedImage(selectedImage.imageUrl);
    setModalVisible(true);
  };

  const handleViewGallery = id => {
    console.log('Navigating with galleryId:', id); // Debugging log
    navigation.navigate('AdminGalleryImages', {galleryId: id});
  };
  
  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={AppConstants.primaryColor} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Gallery</Text>
      </View>

      <Text style={styles.description}>
        Here you can manage the gallery images.
      </Text>

      {/* Add New Image Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddNewImage}>
        <Text style={styles.addButtonText}>Add New Image</Text>
      </TouchableOpacity>

      {/* Gallery Images List */}
      <FlatList
        data={galleryImages}
        renderItem={({item}) => (
          <View style={styles.imageContainer}>
            <Image source={{uri: item.imageUrl}} style={styles.galleryImage} />
            <View style={styles.textContainer}>
              <Text style={styles.imageTitle}>{item.title}</Text>
              <Text style={styles.imageDescription}>{item.description}</Text>
              <Text style={styles.createdAt}>
                {item.createdAt.toDate().toLocaleString()}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEditImage(item.id)}>
                <Icon name="edit" size={24} color={AppConstants.primaryColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteImage(item.id)}>
                <Icon name="delete" size={24} color="red" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                 (`Gallery ID: ${item.id}`);

                  // Navigate to AdminGalleryImages screen and pass item.id as galleryId
                  navigation.navigate('AdminGalleryImages', {
                    galleryId: item.id,
                  });
                }}>
                <Icon
                  name="visibility"
                  size={24}
                  color={AppConstants.primaryColor}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
        style={styles.galleryList}
      />

      {/* Modal for Adding/Editing Image */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Content */}
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={imageTitle}
              onChangeText={setImageTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={imageDescription}
              onChangeText={setImageDescription}
            />

            {/* Choose Image Button */}
            <TouchableOpacity
              onPress={chooseImage}
              style={styles.chooseImageButton}>
              <Text style={styles.chooseImageButtonText}>Choose Image</Text>
            </TouchableOpacity>

            {/* Display selected image */}
            {selectedImage && (
              <Image
                source={{uri: selectedImage}}
                style={styles.selectedImage}
              />
            )}

            {/* Upload Button */}
            <TouchableOpacity onPress={uploadImage} style={styles.uploadButton}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    marginLeft: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  galleryList: {
    flex: 1,
  },
  imageContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomColor: '#ccc',
    padding: 5,
    borderRadius: 10,
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppConstants.primaryColor,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
  },
  imageDescription: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  createdAt: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999, // Add this line to ensure modal stays on top
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    zIndex: 1000, // Ensure modal content is on top
  },

  label: {
    fontSize: 16,
    marginBottom: 5,
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

export default ManageGalleryScreen;
