import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For tab icons
import {AppConstants} from '../utils/AppConstants'; // Import app constants for colors

// Import new screens
import HomeLandingScreen from '../screens/HomeLandingScreen'; // Updated Home screen
import ProfileScreen from '../screens/ProfileScreen';
import EventsScreen from '../screens/EventsScreen';
import GalleryScreen from '../screens/GalleryScreen'; // Import Gallery screen
import ToDoScreen from '../screens/ToDoScreen'; // Import ToDo screen

const Tab = createBottomTabNavigator();

const BottomNav = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: AppConstants.primaryColor, // Active tab color
        tabBarInactiveTintColor: 'white', // Inactive tab color
        tabBarStyle: {
          position: 'absolute',
          bottom: 15,
          left: 20,
          right: 20,
          borderRadius: 50,
          backgroundColor: AppConstants.primaryColor, // Dark background for the tab bar
          paddingBottom: 0, // Adjust bottom padding for a floating effect
          justifyContent: 'center', // Center the content horizontally
          alignItems: 'center', // Center the content vertically
          shadowColor: 'transparent', // Make sure shadow is transparent
          borderWidth: 0, // Ensure there's no border
          elevation: 1, // Remove the elevation to avoid shadow or line effects
          borderTopColor: 'transparent', // Set the top border color to white
          borderBottomColor: 'transparent', // Set bottom border color as transparent
          overflow: 'hidden', // Ensures that any content spilling outside the border is hidden (fixes unwanted lines)
          height: 80,
        },

        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          display: 'none', // Hide the labels (only show icons)
        },
        tabBarItemStyle: {
          transition: 'all 0.3s ease-in-out', // Add smooth transition effect
          justifyContent: 'center', // Ensure the items are vertically centered
          alignItems: 'center', // Ensure the items are horizontally centered
          width: 'auto', // Ensure the items adjust based on content
        },
      }}>
      {/* Home - Center Tab */}
      <Tab.Screen
        name="Home"
        component={HomeLandingScreen} // Use HomeLandingScreen instead of HomeScreen
        options={{
          headerShown: false,
          tabBarIcon: ({color, focused}) => {
            const scale = focused ? 1.2 : 1; // Animation scale when the tab is focused
            return (
              <View
                style={[
                  styles.iconContainer,
                  {transform: [{scale}]}, // Apply scale animation
                  color === AppConstants.primaryColor &&
                    styles.iconContainerActive,
                ]}>
                <Icon name="home" size={30} color={color} />
              </View>
            );
          },
        }}
      />

      {/* Events - Right Tab */}
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({color, focused}) => {
            const scale = focused ? 1.2 : 1; // Animation scale when the tab is focused
            return (
              <View
                style={[
                  styles.iconContainer,
                  {transform: [{scale}]}, // Apply scale animation
                  color === AppConstants.primaryColor &&
                    styles.iconContainerActive,
                ]}>
                <Icon name="event" size={30} color={color} />
              </View>
            );
          },
        }}
      />

      {/* Gallery - Add Gallery Screen */}
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({color, focused}) => {
            const scale = focused ? 1.2 : 1; // Animation scale when the tab is focused
            return (
              <View
                style={[
                  styles.iconContainer,
                  {transform: [{scale}]}, // Apply scale animation
                  color === AppConstants.primaryColor &&
                    styles.iconContainerActive,
                ]}>
                <Icon name="photo-library" size={30} color={color} />
              </View>
            );
          },
        }}
      />

      {/* To-Do - New Tab */}
      <Tab.Screen
        name="ToDo"
        component={ToDoScreen} // Use ToDoScreen here
        options={{
          headerShown: false,
          tabBarIcon: ({color, focused}) => {
            const scale = focused ? 1.2 : 1; // Animation scale when the tab is focused
            return (
              <View
                style={[
                  styles.iconContainer,
                  {transform: [{scale}]}, // Apply scale animation
                  color === AppConstants.primaryColor &&
                    styles.iconContainerActive,
                ]}>
                <Icon name="check-circle" size={30} color={color} />
              </View>
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    padding: 2, // Add padding to make icons look more centered
    borderRadius: 50, // Circular background for icons
    justifyContent: 'center', // Center the icon in the container
    alignItems: 'center', // Align the icon in the middle
  },
  iconContainerActive: {
    backgroundColor: AppConstants.secondaryColor, // Active background color (purple)
    borderColor: AppConstants.primaryColor, // Border color for active state
  },
});

export default BottomNav;
