import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // import linear gradient
import Icon from 'react-native-vector-icons/FontAwesome';
import {AppConstants} from '../utils/AppConstants';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const FavoritesPage = ({navigation}) => {
  const [favorites, setFavorites] = useState([]);
  const [liked, setLiked] = useState({});
  const [loading, setLoading] = useState(true);

  const currentUser = auth().currentUser;
  const userId = currentUser ? currentUser.uid : null;

  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const userDocRef = firestore().collection('users').doc(userId);

    const unsubscribe = userDocRef.onSnapshot(
      doc => {
        if (doc.exists) {
          const favArray = doc.data().favorites || [];
          setFavorites(favArray);

          const initialLiked = {};
          favArray.forEach(url => {
            initialLiked[url] = true;
          });
          setLiked(initialLiked);
        } else {
          setFavorites([]);
          setLiked({});
        }
        setLoading(false);
      },
      error => {
        console.error('Error fetching favorites:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const toggleLike = url => {
    setLiked(prev => {
      const newLiked = {...prev};
      newLiked[url] = !newLiked[url];

      if (userId) {
        const userDocRef = firestore().collection('users').doc(userId);

        if (newLiked[url] === false) {
          userDocRef
            .update({
              favorites: firestore.FieldValue.arrayRemove(url),
            })
            .catch(error => {
              console.error('Error removing favorite:', error);
            });
        } else {
          userDocRef
            .update({
              favorites: firestore.FieldValue.arrayUnion(url),
            })
            .catch(error => {
              console.error('Error adding favorite:', error);
            });
        }
      }

      return newLiked;
    });
  };

  const renderRow = data => {
    const rows = [];
    for (let i = 0; i < data.length; i += 2) {
      rows.push(data.slice(i, i + 2));
    }

    return rows.map((row, index) => (
      <View style={styles.row} key={index}>
        {row.map((imageUrl, idx) => (
          <View style={styles.favoriteBox} key={idx}>
            <Image
              source={{uri: imageUrl}}
              style={styles.favoriteImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.heartIconContainer}
              onPress={() => toggleLike(imageUrl)}
              activeOpacity={0.7}>
              <Icon
                name={liked[imageUrl] ? 'heart' : 'heart-o'}
                size={24}
                color={liked[imageUrl] ? 'red' : 'white'}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    ));
  };
  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.gradient}>
      {/* Simple Back Button */}
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={20} color= {AppConstants.primaryColor} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={AppConstants.primaryColor}
            style={{marginTop: 50}}
          />
        ) : favorites.length === 0 ? (
          <Text style={styles.noFavoritesText}>No favorites found.</Text>
        ) : (
          renderRow(favorites)
        )}
      </ScrollView>
    </LinearGradient>
  );
  
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 30, // safe area padding, adjust if needed
    paddingBottom: 15,
  },
  backText: {
    color: AppConstants.primaryColor,
    fontSize: 18,
    marginLeft: 8,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  favoriteBox: {
    backgroundColor: '#fff',
    padding: 0,
    width: '48%',
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  favoriteImage: {
    width: '100%',
    height: 150,
  },
  heartIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 15,
    padding: 5,
  },
  noFavoritesText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: 'white', // white text on gradient background
  },
});

export default FavoritesPage;
