import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppConstants} from '../utils/AppConstants';
import LinearGradient from 'react-native-linear-gradient';

const CategoryListScreen = ({route, navigation}) => {
  const {categoryId} = route.params;
  const [category, setCategory] = useState(null);

  useEffect(() => {
    // Fetch category details using the categoryId
    const unsubscribe = firestore()
      .collection('categories')
      .doc(categoryId)
      .onSnapshot(docSnapshot => {
        if (docSnapshot.exists) {
          setCategory(docSnapshot.data());
        } else {
          console.log('No such category!');
        }
      });

    return () => unsubscribe();
  }, [categoryId]);

  if (!category) {
    return <Text>Loading...</Text>;
  }

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      {/* Back Button and Title in the same line */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={AppConstants.primaryColor} />
        </TouchableOpacity>
        <Text style={styles.title}>{category.name}</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Display Images */}
        {category.images && category.images.length > 0 ? (
          category.images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <View style={styles.imageTextContainer}>
                <Text style={styles.imageTitle}>{image.title}</Text>
                <Text style={styles.imageDescription}>{image.description}</Text>
              </View>
              <Image source={{uri: image.url}} style={styles.image} />
            </View>
          ))
        ) : (
          <Text style={styles.text}>No images available</Text>
        )}

        {/* Category Description */}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 30, // More space at the top for the header
  },
  header: {
    flexDirection: 'row', // Align back button and title in a row
    alignItems: 'center', // Align vertically in the center
    marginBottom: 20, // Space between header and content
  },
  backButton: {
    marginRight: 10, // Space between back button and title
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    flex: 1, // Ensures title takes up the remaining space
  },
  imageContainer: {
    marginVertical: 15,
  },
  imageTextContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.29)', // Semi-transparent background
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppConstants.primaryColor, // White color to make the text stand out
  },
  imageDescription: {
    fontSize: 16,
    color: '#ddd', // Slightly lighter color for description
  },
  image: {
    width: '100%',
    height: 250, // Adjusted height for better visuals
    resizeMode: 'cover',
    borderRadius: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: AppConstants.primaryColor,
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  scrollContent: {
    paddingBottom: 20, // Adds bottom padding to avoid content sticking to the bottom
  },
});

export default CategoryListScreen;
