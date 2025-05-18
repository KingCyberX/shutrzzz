// app/screens/LightingSetupDetailPage.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {AppConstants} from '../utils/AppConstants'; // For app color constants
import AppBar from '../components/AppBar'; // Import the AppBar component

const LightingSetupDetailPage = ({route, navigation}) => {
  const {lightingSetup} = route.params;

  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);

  const images = [
    // Add more images as needed
    // {id: 1, uri: require('../assets/lighting/lighting1.jpg')},
    // {id: 2, uri: require('../assets/lighting/lighting2.jpg')},
    // {id: 3, uri: require('../assets/lighting/lighting3.jpg')},
  ];

  const openModal = image => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <View style={styles.wrapper}>
      {/* AppBar outside the container */}
      <AppBar title="Lighting Setup" onMenuPress={() => navigation.goBack()} />

      {/* Main content inside the container */}
      <View style={styles.container}>
        <Text style={styles.title}>{lightingSetup.title}</Text>
        <Text style={styles.description}>{lightingSetup.description}</Text>

        {/* Grid of images */}
        <FlatList
          data={images}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.imageItem}
              onPress={() => openModal(item.uri)} // Open the modal for image
            >
              <Image source={item.uri} style={styles.image} />
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
        />
      </View>

      {/* Modal for showing larger image */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Image source={selectedImage} style={styles.modalImage} />
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  imageItem: {
    width: '45%',
    margin: 5,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LightingSetupDetailPage;
