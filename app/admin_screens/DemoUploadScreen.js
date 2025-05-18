import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';

// Cloudinary URL and Upload Preset
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dl608o0ir/image/upload'; // Replace with your Cloudinary URL
const CLOUDINARY_UPLOAD_PRESET = 'shutrzzz'; // Your unsigned upload preset

const DemoUploadScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [demoImages, setDemoImages] = useState([]); // State for storing images from Firestore

  // Choose Image Function using Image Crop Picker
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

  // Upload Image to Cloudinary and Save URL in Firebase Firestore
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please choose an image first.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'slider/'); // Specify the folder where images will be uploaded (optional)

    try {
      // Upload to Cloudinary
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const cloudinaryUrl = response.data.secure_url;
      setImageUrl(cloudinaryUrl); // Set the image URL

      // Save the Cloudinary URL to Firestore under the 'demoimage' collection
      await firestore().collection('demoimage').add({
        imageUrl: cloudinaryUrl,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Upload Successful', 'Your image was uploaded successfully!');
    } catch (error) {
      console.error('Upload failed', error);
      Alert.alert('Upload Failed', 'There was an issue uploading the image.');
    } finally {
      setUploading(false);
    }
  };

  // Fetch demo images from Firebase Firestore
  const fetchDemoImages = async () => {
    try {
      const snapshot = await firestore().collection('demoimage').get();
      const images = snapshot.docs.map(doc => doc.data()); // Get image data from Firestore
      setDemoImages(images); // Store the fetched data in the state
    } catch (error) {
      console.error('Error fetching images:', error);
      Alert.alert('Error', 'There was an issue fetching the demo images.');
    }
  };

  // Call the function to fetch demo images when the component mounts
  useEffect(() => {
    fetchDemoImages();
  }, []); // Empty dependency array makes it run once when the component mounts

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo Upload Screen</Text>
      <Text style={styles.description}>
        This is the Demo Upload screen where you can choose an image, upload it
        to Cloudinary, and store the URL in Firebase.
      </Text>

      <Button title="Choose Image" onPress={chooseImage} />

      {imageUri && <Image source={{uri: imageUri}} style={styles.image} />}
      {uploading && <Text>Uploading...</Text>}

      <Button
        title="Upload Image"
        onPress={uploadImage}
        disabled={uploading || !imageUri}
      />

      {imageUrl && (
        <Text style={styles.urlText}>
          Image URL: <Text style={styles.link}>{imageUrl}</Text>
        </Text>
      )}

      {/* Display the list of demo images from Firebase */}
      <Text style={styles.title}>Uploaded Demo Images</Text>

      <FlatList
        data={demoImages}
        renderItem={({item}) => (
          <View style={styles.imageContainer}>
            <Image source={{uri: item.imageUrl}} style={styles.uploadedImage} />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  urlText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default DemoUploadScreen;
