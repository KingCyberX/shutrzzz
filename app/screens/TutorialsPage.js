// app/screens/TutorialsPage.js
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AppBar from '../components/AppBar';
import {AppConstants} from '../utils/AppConstants'; 
import {useNavigation} from '@react-navigation/native';

const TutorialsPage = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  // Example tutorials
  const tutorials = [
    {id: 1, title: 'Photography Basics', category: 'Camera Settings'},
    {id: 2, title: 'Lighting Techniques', category: 'Lighting'},
    {id: 3, title: 'Post-processing Tips', category: 'Post-Processing'},
    {id: 4, title: 'Lens Selection Guide', category: 'Camera Settings'},
    {id: 5, title: 'Portrait Photography', category: 'Lighting'},
  ];

  // Filter tutorials based on search query
  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.screenContainer}>
      {/* AppBar with back button */}
      <AppBar title="Tutorials" onMenuPress={() => navigation.goBack()} />

      {/* Main content below AppBar */}
      <View style={styles.container}>
        {/* Search bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search Tutorials"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* List of Tutorials */}
        <FlatList
          data={filteredTutorials}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.tutorialItem}
              onPress={() =>
                navigation.navigate('VideoGridPage', {tutorialId: item.id})
              } // Navigate to video grid
            >
              <Text style={styles.tutorialTitle}>{item.title}</Text>
              <Text style={styles.tutorialCategory}>{item.category}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
          style={styles.tutorialList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Make sure the screen has a background color
  },
  container: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  tutorialList: {
    marginTop: 10,
  },
  tutorialItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  tutorialTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppConstants.primaryColor,
  },
  tutorialCategory: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
});

export default TutorialsPage;
