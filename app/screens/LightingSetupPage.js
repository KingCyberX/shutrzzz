// app/screens/LightingSetupPage.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native'; // For navigation
import {AppConstants} from '../utils/AppConstants'; // For app color constants
import AppBar from '../components/AppBar'; // AppBar import for header

const lightingSetups = [
  {
    id: 1,
    title: 'Rembrandt Lighting',
    // image: require('../assets/lighting/lighting1.jpg'), // Ensure this path is correct
    description:
      'A classic lighting setup that creates a triangle of light on the subject’s face.',
  },
  {
    id: 2,
    title: '3-Point Lighting',
    // image: require('../assets/lighting/lighting2.jpg'), // Ensure this path is correct
    description:
      'This setup uses a key light, fill light, and backlight to illuminate the subject from different angles.',
  },
  {
    id: 3,
    title: 'Split Lighting',
    // image: require('../assets/lighting/lighting3.jpg'), // Ensure this path is correct
    description: 'This setup splits the subject’s face into light and shadow.',
  },
  {
    id: 4,
    title: 'Split Lighting',
    // image: require('../assets/lighting/lighting3.jpg'), // Ensure this path is correct
    description: 'This setup splits the subject’s face into light and shadow.',
  },
  // Add more lighting setups with images if needed
];

const LightingSetupPage = () => {
  const navigation = useNavigation();

  const handleItemPress = item => {
    navigation.navigate('LightingSetupDetailPage', {lightingSetup: item});
  };

  return (
    <View style={styles.wrapper}>
      {/* AppBar outside the container */}
      <AppBar title="Lighting Setup" onMenuPress={() => navigation.goBack()} />
      <View style={styles.container}>
        <Text style={styles.title}>Lighting Setup Recommendations</Text>
        <FlatList
          data={lightingSetups}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => handleItemPress(item)} // Navigate to the detail page
            >
              <Image source={item.image} style={styles.image} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
          numColumns={2} // Ensures a 2-column grid
          columnWrapperStyle={styles.columnWrapperStyle} // Add some space between columns
        />
      </View>
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
  itemContainer: {
    flex: 1,
    margin: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppConstants.primaryColor,
    marginTop: 10,
  },
  columnWrapperStyle: {
    justifyContent: 'space-between', // Ensure spacing between columns
  },
});

export default LightingSetupPage;
