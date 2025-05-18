import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppConstants} from '../utils/AppConstants';
import LinearGradient from 'react-native-linear-gradient';
import AppBar from '../components/AppBar';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';

// Cloudinary URL and Upload Preset
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dl608o0ir/image/upload'; // Replace with your Cloudinary URL
const CLOUDINARY_UPLOAD_PRESET = 'shutrzzz'; // Your unsigned upload preset

const ProfileScreen = ({navigation}) => {
  const [userName, setUserName] = useState(''); // State to hold user name
  const [profileImage, setProfileImage] = useState(''); // State to hold profile image URL
  const [loading, setLoading] = useState(false); // Loading state for upload

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          const userDoc = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .get();

          if (userDoc.exists) {
            setUserName(userDoc.data().name || 'User');
            setProfileImage(userDoc.data().profileImage || ''); // Get profile image URL
          } else {
            setUserName('User'); // Fallback if no doc found
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUserName('User'); // Fallback on error
      }
    };

    fetchUserData();
  }, []);
  const handleLogout = () => {
    auth()
      .signOut()
      .catch(error => {
        Alert.alert('Logout Error', error.message);
      });
  };
  
  // Choose Image Function using Image Crop Picker and upload immediately
  const chooseImage = () => {
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        setProfileImage(image.path); // Set the URI of the selected image
        uploadImage(image.path); // Call the upload function directly
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to select image');
      });
  };

  // Upload Image to Cloudinary and Save URL in Firebase Firestore
  const uploadImage = async imageUri => {
    if (!imageUri) {
      Alert.alert('Error', 'Please choose an image first.');
      return;
    }

    setLoading(true); // Set loading to true when the upload starts

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
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

      // Save the Cloudinary URL to Firestore under the user's profile document
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore().collection('users').doc(currentUser.uid).update({
          profileImage: cloudinaryUrl, // Store the image URL in the profileImage field
        });

        // Update profile image URL immediately in state to show updated image
        setProfileImage(cloudinaryUrl);

        Alert.alert(
          'Upload Successful',
          'Your profile picture has been updated!',
        );
      }
    } catch (error) {
      console.error('Upload failed', error);
      Alert.alert('Upload Failed', 'There was an issue uploading the image.');
    } finally {
      setLoading(false); // Set loading to false when upload completes
    }
  };

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      <AppBar title="Profile" navigation={navigation} isProfileScreen={true} />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.profilePictureContainer}>
          <Image
            source={
              profileImage
                ? {uri: profileImage}
                : require('../assets/banner1.jpg')
            }
            style={styles.profilePicture}
          />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={chooseImage}>
            <Icon
              name="camera-alt"
              size={30}
              color={AppConstants.primaryColor}
            />
            <Text
              style={[
                styles.changeImageText,
                {color: AppConstants.primaryColor},
              ]}>
              Change Picture
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('PersonalInformationPage')}>
          <Text style={styles.optionText}>Personal Information</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('FavoritesPage')}>
          <Text style={styles.optionText}>Your Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('TutorialsPage')}>
          <Text style={styles.optionText}>Tutorials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
          <Text style={styles.optionText}>
            
            <Icon
              name="exit-to-app"
              size={25}
              color={AppConstants.primaryColor}
            />
            
          </Text>
        </TouchableOpacity>
        
        {/* <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('LightingSetupPage')}>
          <Text style={styles.optionText}>Lighting Setups</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 90,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: AppConstants.primaryColor,
  },
  changeImageButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeImageText: {
    color: AppConstants.brightColor,
    fontSize: 16,
    marginLeft: 10,
  },
  userInfoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    marginBottom: 10,
  },
  optionButton: {
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: AppConstants.secondaryColor,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppConstants.primaryColor,
    width: '80%',
    alignSelf: 'center',
  },
  optionText: {
    color: AppConstants.primaryColor,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
