import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TextInput,
  ImageBackground,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AppConstants} from '../utils/AppConstants';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // Import Firebase Authentication

const {width} = Dimensions.get('window');
const OPEN_WEATHER_API_KEY = '0d82ae05ef3d8cb7ca590c3211c33f75'; // Replace with your OpenWeather API key

export default function HomeLandingScreen({navigation}) {
  const [carouselImages, setCarouselImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [city, setCity] = useState('');
  const [userCity, setUserCity] = useState(''); // for user input city
  const [dayImageUrl, setDayImageUrl] = useState('');
  const [nightImageUrl, setNightImageUrl] = useState('');

  // Modal visibility state
  const [modalVisible, setModalVisible] = useState(false);

  // Firebase user ID (fetch the logged-in user's ID)
  const [userId, setUserId] = useState(null);

  // Fetch the authenticated user
  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUserId(user.uid); // Set user ID from Firebase Authentication
    } else {
      console.log('No user is logged in');
    }
  }, []);

  // Fetch carousel images and categories from Firestore
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        const snapshot = await firestore().collection('carouselImages').get();
        const images = snapshot.docs.map(doc => ({
          id: doc.id,
          url: doc.data().url,
          title: doc.data().title || '',
        }));
        setCarouselImages(images);
      } catch (error) {
        console.error('Error fetching carousel images:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const snapshot = await firestore()
          .collection('categories')
          .orderBy('order', 'asc')
          .get();
        const cats = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          bgColor: doc.data().bgColor,
          thumbnailUrl: doc.data().thumbnailUrl,
          description: doc.data().description,
          order: doc.data().order,
        }));
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    // Fetch weather images from Firestore
    const fetchWeatherImages = async () => {
      try {
        const snapshot = await firestore().collection('weatherImages').get();
        if (!snapshot.empty) {
          const images = snapshot.docs.map(doc => ({
            dayImageUrl: doc.data().dayImageUrl,
            nightImageUrl: doc.data().nightImageUrl,
          }));
          if (images.length > 0) {
            setDayImageUrl(images[0].dayImageUrl);
            setNightImageUrl(images[0].nightImageUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching weather images:', error);
      }
    };

    // Fetch user city from Firestore
    const fetchUserCity = async () => {
      if (!userId) return;

      try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userCityFromDb = userDoc.data().city;
          if (userCityFromDb) {
            setCity(userCityFromDb); // Set city from Firestore if it exists
          } else {
            setCity(''); // City is null or undefined, prompt user to choose city
          }
        }
      } catch (error) {
        console.error('Error fetching user city:', error);
      }
    };

    Promise.all([
      fetchCarouselImages(),
      fetchCategories(),
      fetchWeatherImages(),
      fetchUserCity(),
    ]).finally(() => setLoading(false));
  }, [userId]);

  // Fetch weather data from OpenWeatherMap API when city changes
  useEffect(() => {
    if (!city) return;

    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPEN_WEATHER_API_KEY}&units=metric`,
        );
        const data = await response.json();

        console.log('Fetched weather data:', data); // Log to verify the structure

        if (data.cod === 200) {
          setWeather({
            temp: data.main.temp, // The current temperature in Celsius
            description: data.weather[0].description, // Weather description
            icon: data.weather[0].icon, // Icon code for weather
            city: data.name, // City name
            sunrise: data.sys.sunrise, // Sunrise timestamp
            sunset: data.sys.sunset, // Sunset timestamp
            timezone: data.timezone, // Timezone offset in seconds
          });
        } else {
          console.error('Error fetching weather:', data.message);
          setWeather(null);
        }
      } catch (error) {
        console.error('Fetch weather error:', error);
        setWeather(null);
      }
      setWeatherLoading(false);
    };

    fetchWeather();
  }, [city]);

  // Handle user city change via input field
  const handleCityChange = async () => {
    if (!userCity.trim()) {
      alert('Please enter a valid city');
      return;
    }
    setCity(userCity); // Update city based on user input
    setModalVisible(false); // Close the modal after setting the city

    // Store city in Firestore for the user
    if (userId) {
      try {
        await firestore().collection('users').doc(userId).set(
          {city: userCity},
          {merge: true}, // Merge to avoid overwriting other user data
        );
        console.log('City updated in Firestore');
      } catch (error) {
        console.error('Error saving city to Firestore:', error);
      }
    }

    setUserCity(''); // Clear input after setting city
  };

  const getBackgroundImage = () => {
    if (weather && weather.icon) {
      const currentHour = new Date().getHours();
      const sunriseHour = new Date(weather.sunrise * 1000).getHours();
      const sunsetHour = new Date(weather.sunset * 1000).getHours();

      // If it is daytime (from sunrise to sunset), use the day image
      if (currentHour >= sunriseHour && currentHour < sunsetHour) {
        return dayImageUrl; // Return the day image URL
      } else {
        return nightImageUrl; // Return the night image URL
      }
    }
    return nightImageUrl; // Default to night image
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppConstants.primaryColor} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={[styles.container]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Weather display */}
        <ImageBackground
          source={{uri: getBackgroundImage()}}
          style={styles.weatherContainer}
          imageStyle={{borderRadius: 15, opacity: 0.4}}>
          {weatherLoading ? (
            <ActivityIndicator size="small" color={AppConstants.primaryColor} />
          ) : weather ? (
            <View style={styles.weatherInfo}>
              <View style={styles.weatherLeft}>
                <Text style={styles.weatherCity}>{weather.city}</Text>
                <Text style={styles.weatherTemp}>
                  {Math.round(weather.temp)}°C {/* Displaying temperature */}
                </Text>
                <Text style={styles.weatherDesc}>{weather.description}</Text>
                {/* Display weather description */}
                <Text style={styles.weatherTime}>
                  Time: {new Date().toLocaleTimeString()}
                  {/* Displaying device's local time */}
                </Text>
                <Text style={styles.weatherTime}>
                  Sunrise:
                  {new Date(weather.sunrise * 1000).toLocaleTimeString()} |
                  Sunset: {new Date(weather.sunset * 1000).toLocaleTimeString()}
                  {/* Display sunrise and sunset times */}
                </Text>
              </View>
              <View style={styles.weatherRight}>
                <Image
                  style={styles.weatherIcon}
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.icon}@4x.png`, 
                  }}
                />
                <TouchableOpacity
                  style={styles.cityInputContainer}
                  onPress={() => setModalVisible(true)}>
                  <Text style={styles.cityButtonText}>
                    {city ? `Change City: ${city}` : 'Choose your city'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.weatherError}>Weather data not available</Text>
          )}
        </ImageBackground>

        {/* Modal for city input */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)} 
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Enter City</Text>
              <TextInput
                style={styles.cityInput}
                placeholder="Enter City"
                value={userCity}
                onChangeText={setUserCity}
              />
              <TouchableOpacity
                style={styles.cityButton}
                onPress={handleCityChange}>
                <Text style={styles.cityButtonText}>Set City</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* City button to open modal */}

        {/* Carousel */}
        <View style={styles.carouselWrapper}>
          <FlatList
            data={carouselImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <View style={styles.carouselCard}>
                <Image
                  source={{uri: item.url}}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              </View>
            )}
          />
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>

        {/* Categories */}
        {categories.map(cat => (
          <View key={cat.id}>
            <TouchableOpacity
              style={[styles.categoryCard, {backgroundColor: cat.bgColor}]}
              onPress={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SubCategoryScreen', {categoryId: cat.id})
                }
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={styles.arrow}>{'>'}</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {selectedCategory === cat.id && (
              <View
                style={[
                  styles.detailContainer,
                  {backgroundColor: cat.bgColor},
                ]}>
                <Image
                  source={{uri: cat.thumbnailUrl}}
                  style={styles.categoryImage}
                />
                <Text style={styles.description}>{cat.description}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollViewContent: {paddingBottom: 90},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  weatherContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    overflow: 'hidden', // important for borderRadius to clip image
  },
  weatherTime: {
    fontSize: 14, // Adjust the font size
    color: AppConstants.brightColor,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  weatherInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  weatherLeft: {
    flex: 1,
    alignItems: 'flex-start', // Align left side content
  },
  weatherRight: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherCity: {
    fontSize: 25,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    textAlign: 'center',
  },
  weatherTemp: {
    fontSize: 30,
    fontWeight: '700',
    color: AppConstants.primaryColor,
    marginBottom: 10,
    textAlign: 'center',
  },
  weatherDesc: {
    fontSize: 16,
    fontStyle: 'italic',
    color: AppConstants.primaryColor,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginVertical: 15,
  },

  weatherError: {
    color: AppConstants.primaryColor,
    fontSize: 16,
    fontStyle: 'italic',
  },

  cityInputContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityInput: {
    height: 40,
    width: width - 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
  },
  cityButton: {
    backgroundColor: AppConstants.primaryColor,
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  cityButtonText: {
    color: AppConstants.brightColor,
    fontSize: 16,
    fontWeight: 700,
  },

  carouselWrapper: {marginTop: 10},
  carouselCard: {
    width: width - 30,
    height: 200,
    marginHorizontal: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  carouselImage: {width: '100%', height: '100%'},

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    marginLeft: 20,
    color: AppConstants.primaryColor,
  },

  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryName: {fontSize: 18, fontWeight: '600', color: '#000'},
  arrow: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  detailContainer: {
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  categoryImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  description: {
    fontSize: 16,
    marginTop: 12,
    color: '#333',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: AppConstants.brightColor,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cityInput: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 15, // Adds gap between input and button
  },
  cityButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 8, // Reduced vertical padding for smaller button
    paddingHorizontal: 15,
    borderRadius: 25,
    width: 100, // Set a fixed width for a smaller button
    alignSelf: 'center', // Centers the button horizontally
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
    borderRadius: 25,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppConstants.primaryColor, // You can change the color based on preference
  },
});
