import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppBar from '../components/AppBar';
import {AppConstants} from '../utils/AppConstants';

const {width} = Dimensions.get('window'); // Get screen width

const AdminDashboardScreen = ({navigation}) => {
  const navigateToScreen = screenName => {
    navigation.navigate(screenName);
  };

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      {/* Admin Dashboard AppBar without Profile Button */}
      <AppBar title="Welcome Admin" showProfileButton={false} />

      {/* Dashboard Content */}
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <Text style={styles.welcomeText}>Welcome to the Admin Dashboard</Text>
        <Text style={styles.description}>
          Manage different sections of the app with ease.
        </Text>

        {/* Responsive Grid Layout */}
        <View style={styles.cardsContainer}>
          {[
            {
              title: 'Manage Carousel',
              icon: 'image',
              screen: 'ManageCarouselScreen', 
            },
            {
              title: 'Manage Categories',
              icon: 'category',
              screen: 'ManageCategoriesScreen',
            },
            {
              title: 'Manage Gallery',
              icon: 'photo-library',
              screen: 'ManageGalleryScreen',
            },
            {title: 'Manage Users', icon: 'group', screen: 'ManageUsersScreen'},
            {
              title: 'Manage Events',
              icon: 'event',
              screen: 'ManageEventsScreen',
            },
            {
              title: 'Manage Tutorials',
              icon: 'video-library',
              screen: 'ManageTutorialsScreen',
            },
            // {
            //   title: 'Manage Lighting Setups',
            //   icon: 'lightbulb',
            //   screen: 'ManageLightingSetupsScreen',
            // },
            // {
            //   title: 'Manage To-Do List',
            //   icon: 'check-circle',
            //   screen: 'ManageToDoScreen',
            // },
            // // Demo Upload Card
            // {
            //   title: 'Demo Upload',
            //   icon: 'cloud-upload',
            //   screen: 'DemoUploadScreen', // This will link to your demo screen
            // },
          ].map((card, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigateToScreen(card.screen)}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Icon
                name={card.icon}
                size={40}
                color={AppConstants.primaryColor}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dashboardContent: {
    flexGrow: 1,
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 90,
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
  },
  card: {
    width: width * 0.42,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppConstants.primaryColor,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
