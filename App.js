import React, {useState, useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider as PaperProvider} from 'react-native-paper';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import '@react-native-firebase/app'; // Initialize Firebase

// Import screens
import SplashScreen from './app/screens/SplashScreen';
import LoginScreen from './app/screens/LoginScreen';
import SignupScreen from './app/screens/SignupScreen';
import HomeScreen from './app/screens/HomeScreen';
import DashboardScreen from './app/screens/DashboardScreen';
import FavoritesPage from './app/screens/FavoritesPage';
import PersonalInformationPage from './app/screens/PersonalInformationPage';
import EventDetailPage from './app/screens/EventDetailPage';
import TutorialsPage from './app/screens/TutorialsPage';
import VideoGridPage from './app/screens/VideoGridPage';
import LightingSetupPage from './app/screens/LightingSetupPage';
import LightingSetupDetailPage from './app/screens/LightingSetupDetailPage';
import ProfileScreen from './app/screens/ProfileScreen';
import AdminDashboardScreen from './app/admin_screens/AdminDashboardScreen';
import ManageCategoriesScreen from './app/admin_screens/ManageCategoriesScreen';
import ManageGalleryScreen from './app/admin_screens/ManageGalleryScreen';
import ManageUsersScreen from './app/admin_screens/ManageUsersScreen';
import ManageEventsScreen from './app/admin_screens/ManageEventsScreen';
import ManageTutorialsScreen from './app/admin_screens/ManageTutorialsScreen';
import ManageLightingSetupsScreen from './app/admin_screens/ManageLightingSetupsScreen';
import ManageToDoScreen from './app/admin_screens/ManageToDoScreen';
import SubCategoryScreen from './app/screens/SubCategoryScreen';
import ToDoDetailScreen from './app/screens/ToDoDetailScreen';
import GalleryDetailScreen from './app/screens/GalleryDetailScreen';
import DemoUploadScreen from './app/admin_screens/DemoUploadScreen';
import ManageCarouselScreen from './app/admin_screens/ManageCarouselScreen';
import EventDetailAdminScreen from './app/admin_screens/EventDetailAdminScreen';
import CategoryListScreen from './app/admin_screens/CategoryListScreen';
import AdminGalleryImages from './app/admin_screens/AdminGalleryImages';

const Stack = createStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // boolean true=user, false=admin

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async currentUser => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .get();
          if (userDoc.exists) {
            setRole(userDoc.data().role);
          } else {
            setRole(null);
          }
        } catch (e) {
          console.error('Error fetching user role:', e);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setInitializing(false);
    });

    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing || (user && role === null)) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {user ? (
            // Logged in
            role === true ? (
              <>
                <Stack.Screen
                  name="DashboardScreen"
                  component={DashboardScreen}
                />
                <Stack.Screen name="FavoritesPage" component={FavoritesPage} />
                <Stack.Screen
                  name="PersonalInformationPage"
                  component={PersonalInformationPage}
                />
                <Stack.Screen
                  name="EventDetailPage"
                  component={EventDetailPage}
                />
                <Stack.Screen name="TutorialsPage" component={TutorialsPage} />
                <Stack.Screen name="VideoGridPage" component={VideoGridPage} />
                <Stack.Screen
                  name="LightingSetupPage"
                  component={LightingSetupPage}
                />
                <Stack.Screen
                  name="LightingSetupDetailPage"
                  component={LightingSetupDetailPage}
                />
                <Stack.Screen
                  name="SubCategoryScreen"
                  component={SubCategoryScreen}
                />
                <Stack.Screen
                  name="ToDoDetailScreen"
                  component={ToDoDetailScreen}
                />
                <Stack.Screen
                  name="GalleryDetail"
                  component={GalleryDetailScreen}
                />

                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
              </>
            ) : (
              <>
                <Stack.Screen
                  name="AdminDashboardScreen"
                  component={AdminDashboardScreen}
                />
                <Stack.Screen
                  name="ManageCategoriesScreen"
                  component={ManageCategoriesScreen}
                />

                <Stack.Screen
                  name="ManageGalleryScreen"
                  component={ManageGalleryScreen}
                />
                <Stack.Screen
                  name="ManageUsersScreen"
                  component={ManageUsersScreen}
                />
                <Stack.Screen
                  name="ManageEventsScreen"
                  component={ManageEventsScreen}
                />
                <Stack.Screen
                  name="ManageTutorialsScreen"
                  component={ManageTutorialsScreen}
                />
                <Stack.Screen
                  name="ManageLightingSetupsScreen"
                  component={ManageLightingSetupsScreen}
                />
                <Stack.Screen
                  name="ManageToDoScreen"
                  component={ManageToDoScreen}
                />
                <Stack.Screen
                  name="DemoUploadScreen"
                  component={DemoUploadScreen}
                />
                <Stack.Screen
                  name="ManageCarouselScreen"
                  component={ManageCarouselScreen}
                />
                <Stack.Screen
                  name="EventDetailAdminScreen"
                  component={EventDetailAdminScreen}
                />
                <Stack.Screen
                  name="CategoryList"
                  component={CategoryListScreen}
                />
                <Stack.Screen
                  name="AdminGalleryImages"
                  component={AdminGalleryImages}
                />
              </>
            )
          ) : (
            // Not logged in
            <>
              <Stack.Screen name="SplashScreen" component={SplashScreen} />
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="SignupScreen" component={SignupScreen} />
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
