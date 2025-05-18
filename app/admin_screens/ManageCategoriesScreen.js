import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Modal,
  Alert,
  Button,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AppConstants} from '../utils/AppConstants';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios'; // For Cloudinary image uploading
import {Picker} from '@react-native-picker/picker';

const ManageCategoriesScreen = ({navigation}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryThumbnail, setNewCategoryThumbnail] = useState('');
  const [newCategoryBgColor, setNewCategoryBgColor] = useState('#a9d5d3');
  const [newCategoryOrder, setNewCategoryOrder] = useState(1);
  const [newCategoryModalVisible, setNewCategoryModalVisible] = useState(false);

  // Add Images Category Modal states
  const [addImagesCategoryModalVisible, setAddImagesCategoryModalVisible] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [imageLocation, setImageLocation] = useState('');
  const [imageTitle, setImageTitle] = useState('');

  const CLOUDINARY_URL =
    'https://api.cloudinary.com/v1_1/dl608o0ir/image/upload';
  const CLOUDINARY_UPLOAD_PRESET = 'shutrzzz';
  const currentUser = auth().currentUser;
  const userId = currentUser ? currentUser.uid : null;
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEventData(); // Your existing function to fetch updated data
    setRefreshing(false);
  };
  
  // Fetch categories from Firebase
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories')
      .orderBy('order', 'asc')
      .onSnapshot(querySnapshot => {
        const fetchedCategories = [];
        querySnapshot.forEach(doc => {
          fetchedCategories.push({id: doc.id, ...doc.data()});
        });
        setCategories(fetchedCategories);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  // Upload thumbnail image to Cloudinary
  const uploadImageToCloudinary = async image => {
    const formData = new FormData();
    formData.append('file', {
      uri: image.path,
      name: image.filename,
      type: image.mime,
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      console.log('Image uploaded successfully:', response.data.secure_url);
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Image upload failed. Please try again.');
    }
  };

  // Pick image for category thumbnail
  const pickThumbnail = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
    }).then(image => {
      uploadImageToCloudinary(image).then(url => {
        setNewCategoryThumbnail(url);
      });
    });
  };

  // Pick image for add images category
  const pickImageForCategory = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
    }).then(image => {
      uploadImageToCloudinary(image).then(url => {
        setImageUrl(url);
      });
    });
  };

  // Add new category
  const addCategory = () => {
    if (!newCategoryName || !newCategoryDescription || !newCategoryThumbnail) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    firestore()
      .collection('categories')
      .add({
        name: newCategoryName,
        description: newCategoryDescription,
        thumbnailUrl: newCategoryThumbnail,
        bgColor: newCategoryBgColor,
        order: newCategoryOrder,
        images: [null], // Initialize images array with `null`
      })
      .then(() => {
        // Reset the form and close the modal
        setNewCategoryName('');
        setNewCategoryDescription('');
        setNewCategoryThumbnail('');
        setNewCategoryOrder(1);
        setNewCategoryModalVisible(false);
        Alert.alert('Success', 'Category added successfully!');
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  // Add Images Category
  const addImagesCategory = () => {
    if (
      !selectedCategory ||
      !imageUrl ||
      !imageDescription ||
      !imageLocation ||
      !imageTitle
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log('Selected Category: ', selectedCategory);
    console.log('Image URL: ', imageUrl);
    console.log('Description: ', imageDescription);
    console.log('Location: ', imageLocation);
    console.log('Title: ', imageTitle);

    const imageObject = {
      description: imageDescription,
      location: imageLocation,
      title: imageTitle,
      url: imageUrl,
    };

    firestore()
      .collection('categories')
      .doc(selectedCategory)
      .get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          let existingImages = docSnapshot.data().images || [];
          if (existingImages.length === 0 || existingImages[0] === null) {
            existingImages = [imageObject];
          } else {
            existingImages.push(imageObject);
          }

          firestore()
            .collection('categories')
            .doc(selectedCategory)
            .update({
              images: existingImages,
            })
            .then(() => {
              setImageUrl('');
              setImageDescription('');
              setImageLocation('');
              setImageTitle('');
              setAddImagesCategoryModalVisible(false);
              Alert.alert('Success', 'Image added to category!');
            })
            .catch(error => {
              console.error('Error updating category: ', error);
              Alert.alert('Error', 'Failed to update category. ' + error.message);
            });
        } else {
          Alert.alert('Error', 'Category not found!');
        }
      })
      .catch(error => {
        console.error('Error fetching category: ', error);
        Alert.alert('Error', 'Failed to fetch category. ' + error.message);
      });
  };

  const colorOptions = [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
    '#800000',
    '#808000',
    '#008000',
    '#000080',
    '#800080',
    '#008080',
    '#ffa500',
    '#a52a2a',
    '#d2691e',
    '#98fb98',
    '#f0e68c',
    '#ff6347',
    '#ff1493',
    '#2e8b57',
  ];

  const handleColorSelect = color => {
    setNewCategoryBgColor(color);
  };

  // Delete category
  const deleteCategory = categoryId => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this category?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            firestore()
              .collection('categories')
              .doc(categoryId)
              .delete()
              .then(() => {
                Alert.alert('Success', 'Category deleted successfully!');
              })
              .catch(error => {
                console.error('Error deleting category: ', error);
                Alert.alert(
                  'Error',
                  'Failed to delete category. ' + error.message,
                );
              });
          },
        },
      ],
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
   
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back"
              size={28}
              color={AppConstants.primaryColor}
            />
          </TouchableOpacity>

          <Text style={styles.title}>Manage Categories</Text>
        </View>
        <Text style={styles.description}>
          Here you can manage the app categories.
        </Text>

        {/* Add New Category Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setNewCategoryModalVisible(true)}>
            <Text style={styles.addCategoryText}>Add New Category</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addImagesCategoryButton}
            onPress={() => setAddImagesCategoryModalVisible(true)}>
            <Text style={styles.addImagesCategoryText}>
              Add Images Category
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories List */}
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={styles.categoryItem}>
              <Image
                source={{uri: item.thumbnailUrl}}
                style={styles.thumbnail}
              />
              <Text style={styles.categoryTitle}>{item.name}</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('CategoryList', {categoryId: item.id})
                }>
                <Icon
                  name="visibility"
                  size={24}
                  color={AppConstants.primaryColor}
                />
              </TouchableOpacity>
              {/* Delete Button */}
              <TouchableOpacity onPress={() => deleteCategory(item.id)}>
                <Icon name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Add New Category Modal */}
        <Modal
          visible={newCategoryModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setNewCategoryModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Category</Text>

              {/* Labels for Input Fields */}
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Category Name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />

              <Text style={styles.label}>Category Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Category Description"
                value={newCategoryDescription}
                onChangeText={setNewCategoryDescription}
              />

              {/* Thumbnail Image Upload */}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickThumbnail}>
                <Text style={styles.uploadButtonText}>Upload Thumbnail</Text>
              </TouchableOpacity>

              {/* Select Box for Background Color */}
              <Text style={styles.label}>Background Color</Text>
              <Picker
                selectedValue={newCategoryBgColor}
                onValueChange={handleColorSelect}
                style={styles.picker}>
                {colorOptions.map((color, index) => (
                  <Picker.Item
                    label={`Color ${index + 1}`}
                    value={color}
                    key={index}
                  />
                ))}
              </Picker>

              {/* Category Order */}
              <Text style={styles.label}>Category Order</Text>
              <TextInput
                style={styles.input}
                placeholder="Category Order"
                value={String(newCategoryOrder)}
                onChangeText={text => setNewCategoryOrder(parseInt(text))}
                keyboardType="numeric"
              />

              {/* Add and Cancel buttons inline */}
              <View style={styles.buttonRow}>
                <Button
                  style={styles.Rowbutton}
                  title="Add Category"
                  onPress={addCategory}
                  color={AppConstants.primaryColor}
                />
                <Button
                  style={styles.Rowbutton}
                  title="Cancel"
                  onPress={() => setNewCategoryModalVisible(false)}
                  color={AppConstants.primaryColor}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Images Category Modal */}
        <Modal
          visible={addImagesCategoryModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAddImagesCategoryModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add Image Category</Text>

              {/* Select Category */}
              <Text style={styles.label}>Select Category</Text>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={setSelectedCategory}
                style={styles.picker}>
                {categories.map((category, index) => (
                  <Picker.Item
                    label={category.name}
                    value={category.id}
                    key={index}
                  />
                ))}
              </Picker>

              {/* Image Upload */}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickImageForCategory}>
                <Text style={styles.uploadButtonText}>Upload Image</Text>
              </TouchableOpacity>

              {/* Image Description */}
              <Text style={styles.label}>Image Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Image Description"
                value={imageDescription}
                onChangeText={setImageDescription}
              />

              {/* Image Location */}
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Image Location"
                value={imageLocation}
                onChangeText={setImageLocation}
              />

              {/* Image Title */}
              <Text style={styles.label}>Image Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Image Title"
                value={imageTitle}
                onChangeText={setImageTitle}
              />

              {/* Add and Cancel buttons */}
              <View style={styles.buttonRow}>
                <Button
                  title="Add Image Category"
                  onPress={addImagesCategory}
                  color={AppConstants.primaryColor}
                />
                <Button
                  title="Cancel"
                  onPress={() => setAddImagesCategoryModalVisible(false)}
                  color={AppConstants.primaryColor}
                />
              </View>
            </View>
          </View>
        </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row', // Aligns the items horizontally
    alignItems: 'center', // Vertically centers items in the row
    marginBottom: 20, // Space below the header
  },
  backButton: {
    marginRight: 10, // Space between the back button and the title
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  addCategoryButton: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 30,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  addCategoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
  },
  addImagesCategoryButton: {
    backgroundColor: AppConstants.primaryColor,
    padding: 10,
    marginBottom: 30,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  addImagesCategoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppConstants.brightColor,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppConstants.primaryColor,
    flex: 1,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    color: '#000',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: AppConstants.primaryColor,
    marginBottom: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: AppConstants.primaryColor,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: AppConstants.primaryColor,
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  picker: {
    width: '100%',
    height: 50,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: AppConstants.primaryColor,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default ManageCategoriesScreen;
