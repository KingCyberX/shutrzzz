import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AppConstants} from '../utils/AppConstants';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

export default function SubCategoryScreen({route, navigation}) {
  const {categoryId} = route.params;
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorites, setFavorites] = useState(new Set());

  const currentUser = auth().currentUser;
  const userId = currentUser ? currentUser.uid : null;

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const doc = await firestore()
          .collection('categories')
          .doc(categoryId)
          .get();
        if (doc.exists) {
          setCategory(doc.data());
        } else {
          setCategory(null);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [categoryId]);

  // Listen to user's favorites array field in user document
  useEffect(() => {
    if (!userId) return;

    const userDocRef = firestore().collection('users').doc(userId);

    const unsubscribe = userDocRef.onSnapshot(
      docSnapshot => {
        if (docSnapshot.exists) {
          const favArray = docSnapshot.data().favorites || [];
          setFavorites(new Set(favArray));
        } else {
          setFavorites(new Set());
        }
      },
      error => {
        console.error('Error fetching user favorites:', error);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const openSlideshow = index => {
    setCurrentImageIndex(index);
    setShowGrid(false);
  };

  const backToGrid = () => setShowGrid(true);

  // Toggle favorite in the user's favorites array field
  const toggleFavorite = async imageId => {
    if (!userId) {
      alert('Please login to favorite');
      return;
    }
    if (!imageId || typeof imageId !== 'string') {
      alert('Invalid image identifier for favorites.');
      return;
    }

    const userDocRef = firestore().collection('users').doc(userId);

    try {
      if (favorites.has(imageId)) {
        await userDocRef.update({
          favorites: firestore.FieldValue.arrayRemove(imageId),
        });
      } else {
        await userDocRef.update({
          favorites: firestore.FieldValue.arrayUnion(imageId),
        });
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      alert(
        'Failed to update favorites: ' +
          (error?.message || JSON.stringify(error)),
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

  if (!category) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{color: AppConstants.primaryColor}}>
          No category found.
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* AppBar with back button only */}
      <LinearGradient
        colors={AppConstants.primaryBackgroundGradient}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.appBarContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.appBarBackBtn}>
          <Icon name="arrow-back" size={28} color={AppConstants.brightColor} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>{category.name}</Text>
        <View style={{width: 28, marginRight: 10}} />
      </LinearGradient>

      <LinearGradient
        colors={AppConstants.primaryBackgroundGradient}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.container}>
        {showGrid ? (
          <FlatList
            data={category.images}
            keyExtractor={(item, index) =>
              item.id || item.url || index.toString()
            }
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            renderItem={({item, index}) => {
              const imageId = item.id || item.url; // unique id for favorites
              const isFavorited = favorites.has(imageId);

              return (
                <TouchableOpacity
                  onPress={() => openSlideshow(index)}
                  style={styles.gridItem}>
                  <Image source={{uri: item.url}} style={styles.gridImage} />

                  {/* Heart button */}
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => toggleFavorite(imageId)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Icon
                      name={isFavorited ? 'favorite' : 'favorite-border'}
                      size={26}
                      color={isFavorited ? '#e91e63' : '#fff'}
                    />
                  </TouchableOpacity>

                  <View style={styles.gridTextContainer}>
                    <Text style={styles.imageTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <>
            {/* Slideshow Back Button */}
            <TouchableOpacity
              style={styles.slideshowBackBtn}
              onPress={backToGrid}>
              <Icon name="arrow-back" size={28} color="#fff" />
              <Text style={styles.slideshowBackText}>Back to Grid</Text>
            </TouchableOpacity>

            <ScrollView
              horizontal
              pagingEnabled
              contentOffset={{x: width * currentImageIndex, y: 0}}
              showsHorizontalScrollIndicator={false}
              style={{flex: 1}}>
              {category.images.map((img, i) => (
                <View key={i} style={styles.slideshowContainer}>
                  <Image source={{uri: img.url}} style={styles.modalImage} />
                  <View style={styles.slideshowTextContainer}>
                    <Text style={styles.imageTitle}>{img.title}</Text>
                    <Text style={styles.imageDescription}>
                      {img.description}
                    </Text>
                    <Text style={styles.imageLocation}>{img.location}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},

  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  /* AppBar */
  appBarContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  appBarBackBtn: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: AppConstants.brightColor,
    textAlign: 'center',
  },

  /* Grid */
  gridContainer: {
    padding: 12,
    justifyContent: 'center',
  },
  gridItem: {
    flex: 1 / 2,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#222',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  gridImage: {
    width: '100%',
    height: width / 2 - 18,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    padding: 4,
  },
  gridTextContainer: {
    paddingVertical: 6,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  imageTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
  },

  /* Slideshow */
  slideshowBackBtn: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  slideshowBackText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 6,
  },
  slideshowContainer: {
    width,
    alignItems: 'center',
    padding: 15,
  },
  modalImage: {
    width: width - 40,
    height: width - 40,
    borderRadius: 15,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  slideshowTextContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 12,
    width: width - 40,
  },
  imageDescription: {
    fontSize: 14,
    marginTop: 8,
    color: '#ddd',
    textAlign: 'center',
  },
  imageLocation: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    color: '#bbb',
    textAlign: 'center',
  },
});
