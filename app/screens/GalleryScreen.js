import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import {AppConstants} from '../utils/AppConstants';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

const GalleryScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('galleries')
      .onSnapshot(
        querySnapshot => {
          const fetchedGalleries = [];
          querySnapshot.forEach(doc => {
            fetchedGalleries.push({id: doc.id, ...doc.data()});
          });
          setGalleries(fetchedGalleries);
          setLoading(false);
        },
        error => {
          console.error('Error fetching galleries: ', error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, []);

  const filteredGalleries = galleries.filter(gallery =>
    gallery.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  const renderGalleryItem = ({item}) => (
    <TouchableOpacity
      style={styles.galleryItem}
      onPress={() =>
        navigation.navigate('GalleryDetail', {
          galleryId: item.id,
          galleryTitle: item.title,
        })
      }>
      {/* Display image if URL available */}
      {item.imageUrl ? (
        <Image source={{uri: item.imageUrl}} style={styles.galleryImage} />
      ) : (
        <View style={[styles.galleryImage, styles.imagePlaceholder]}>
          <Text style={{color: '#aaa'}}>No Image</Text>
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.galleryTitle}>{item.title}</Text>
        <Text style={styles.galleryDescription}>{item.description}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={AppConstants.primaryColor} />
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
      <TextInput
        style={styles.searchBar}
        placeholder="Search galleries..."
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredGalleries}
        keyExtractor={item => item.id}
        renderItem={renderGalleryItem}
        contentContainerStyle={{paddingBottom: 40}}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 50,
  },
  searchBar: {
    backgroundColor: '#eee',
    borderRadius: 25,
    height: 45,
    paddingHorizontal: 20,
    marginBottom: 15,
    color: '#333',
  },
  galleryItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppConstants.primaryColor,
  },
  galleryDescription: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
});

export default GalleryScreen;
