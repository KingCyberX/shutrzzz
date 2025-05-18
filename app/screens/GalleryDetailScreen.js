import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppConstants} from '../utils/AppConstants';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // <-- import auth

const {width} = Dimensions.get('window');

const GalleryDetailScreen = ({route, navigation}) => {
  const {galleryId, galleryTitle} = route.params;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const currentUser = auth().currentUser;
  const userId = currentUser ? currentUser.uid : null;

  // Fetch gallery images
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('galleryImages')
      .where('galleryId', '==', galleryId)
      .onSnapshot(
        querySnapshot => {
          const fetchedImages = [];
          querySnapshot.forEach(doc => {
            fetchedImages.push({id: doc.id, ...doc.data()});
          });
          setImages(fetchedImages);
          setLoading(false);
        },
        error => {
          console.error('Error fetching gallery images: ', error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [galleryId]);

  // Fetch user's favorites for this gallery images on mount
  // Fetch user's favorites (image URLs) on mount
  useEffect(() => {
    if (!userId) return;

    const userDocRef = firestore().collection('users').doc(userId);

    userDocRef
      .get()
      .then(doc => {
        if (doc.exists) {
          const userFavorites = doc.data().favorites || [];
          // Create favorites map for quick lookup (using imageUrl as key)
          const favMap = {};
          userFavorites.forEach(favUrl => {
            favMap[favUrl] = true;
          });
          setFavorites(favMap);
        }
      })
      .catch(error => {
        console.error('Error fetching user favorites:', error);
      });
  }, [userId]);

  const toggleFavorite = imageUrl => {
    if (!userId) {
      console.warn('User not logged in');
      return;
    }
    const userDocRef = firestore().collection('users').doc(userId);

    setFavorites(prev => {
      const updated = {...prev};
      if (updated[imageUrl]) {
        // Currently favorited, remove the imageUrl
        updated[imageUrl] = false;
        userDocRef
          .update({
            favorites: firestore.FieldValue.arrayRemove(imageUrl),
          })
          .catch(console.error);
      } else {
        // Not favorited, add the imageUrl
        updated[imageUrl] = true;
        userDocRef
          .update({
            favorites: firestore.FieldValue.arrayUnion(imageUrl),
          })
          .catch(console.error);
      }
      return updated;
    });
  };

  const openModal = image => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const renderImageItem = ({item}) => (
    <TouchableOpacity
      style={styles.imageItem}
      onPress={() => openModal(item)}
      activeOpacity={0.8}>
      {item.imageUrl ? (
        <Image source={{uri: item.imageUrl}} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{color: '#aaa'}}>No Image</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.favButton}
        onPress={() => toggleFavorite(item.imageUrl)}
        activeOpacity={0.7}>
        <Icon
          name={favorites[item.imageUrl] ? 'favorite' : 'favorite-border'}
          size={28}
          color={favorites[item.imageUrl] ? 'red' : AppConstants.primaryColor}
        />
      </TouchableOpacity>

      <Text style={styles.imageTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={AppConstants.primaryBackgroundGradient}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color={AppConstants.primaryColor} />
      </LinearGradient>
    );
  }

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

      <Text style={styles.header}>{galleryTitle}</Text>

      {/* Carousel under title */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carouselContainer}
        contentContainerStyle={{paddingHorizontal: 10}}>
        {images.map(image => (
          <TouchableOpacity
            key={image.id}
            onPress={() => openModal(image)}
            activeOpacity={0.8}
            style={styles.carouselImageWrapper}>
            {image.imageUrl ? (
              <Image
                source={{uri: image.imageUrl}}
                style={styles.carouselImage}
              />
            ) : (
              <View style={[styles.carouselImage, styles.imagePlaceholder]}>
                <Text style={{color: '#aaa'}}>No Image</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid list below carousel */}
      <FlatList
        data={images}
        renderItem={renderImageItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={{paddingBottom: 40}}
      />

      {/* Modal for image detail */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedImage?.imageUrl ? (
              <Image
                source={{uri: selectedImage.imageUrl}}
                style={styles.modalImage}
              />
            ) : (
              <View style={[styles.modalImage, styles.imagePlaceholder]}>
                <Text>No Image</Text>
              </View>
            )}
            <Text style={styles.modalTitle}>{selectedImage?.title}</Text>
            <Text style={styles.modalDescription}>
              {selectedImage?.description}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
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
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 5,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: AppConstants.primaryColor,
    marginBottom: 15,
    textAlign: 'center',
  },
  carouselContainer: {
    marginBottom: 15,
  },
  carouselImageWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  carouselImage: {
    width: 160,
    height: 120,
    borderRadius: 12,
  },
  imageItem: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: width / 2 - 24,
    height: width / 2 - 24,
    borderRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 4,
  },
  imageTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: AppConstants.primaryColor,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 15,
    color: AppConstants.primaryColor,
  },
  modalDescription: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
  
export default GalleryDetailScreen;
