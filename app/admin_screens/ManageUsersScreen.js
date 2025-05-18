import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {LinearGradient} from 'react-native-linear-gradient';
import {AppConstants} from '../utils/AppConstants'; // Import AppConstants for styling
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons
import auth from '@react-native-firebase/auth'; // Import Firebase Authentication

const ManageUsersScreen = ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUserModalVisible, setNewUserModalVisible] = useState(false); // New user modal visibility
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: true, // Role: true -> User, false -> Admin
    password: '', // Password field for new user
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    let retries = 5; // Number of retries
    let delay = 1000; // Initial delay in ms
    let success = false;

    while (retries > 0 && !success) {
      try {
        const snapshot = await firestore().collection('users').get();
        const usersData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            role: data.role !== undefined ? data.role : true, // Default to true (User) if role is undefined
            profileImage: data.profileImage || null,
          };
        });
        setUsers(usersData);
        success = true;
      } catch (error) {
        console.error('Error fetching users:', error);
        retries -= 1;
        if (retries > 0) {
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }

    if (!success) {
      Alert.alert('Error', 'Failed to fetch users after multiple attempts.');
    }
  };
  
  // View User Information
  const handleViewInfo = user => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  // Suspend Account
  const handleSuspendAccount = userId => {
    Alert.alert(
      'Suspend Account',
      'Are you sure you want to suspend this account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await firestore().collection('users').doc(userId).update({
                isSuspended: true,
              });
              Alert.alert('Success', 'Account suspended successfully');
              fetchUsers();
            } catch (error) {
              console.error('Error suspending account:', error);
              Alert.alert('Error', 'Failed to suspend the account');
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  // Delete User
  const handleDeleteUser = userId => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await firestore().collection('users').doc(userId).delete();
              Alert.alert('Success', 'User deleted successfully');
              fetchUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete the user');
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  // Handle Adding New User
  const handleAddNewUser = async () => {
    const {name, email, role, password} = newUser;
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Create user with Firebase Authentication
      await auth().createUserWithEmailAndPassword(email, password);

      // Add additional user information (name, role) to Firestore
      await firestore().collection('users').add({
        name,
        email,
        role,
        isSuspended: false,
      });

      Alert.alert('Success', 'User added successfully');
      setNewUser({
        name: '',
        email: '',
        password: '', // Reset the password field after saving the user
        role: true, // Default role
      });
      fetchUsers();
      setNewUserModalVisible(false);
    } catch (error) {
      console.error('Error adding user:', error);
      Alert.alert('Error', 'Failed to add user');
    }
  };

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={28} color={AppConstants.primaryColor} />
      </TouchableOpacity>

      <Text style={styles.title}>Manage Users</Text>
      <Text style={styles.description}>
        Here you can manage the users of the app.
      </Text>

      {/* FlatList to display users */}
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.userCard}>
            <View style={styles.imageRow}>
              {/* Display profile image if available */}
              {item.profileImage ? (
                <Image
                  source={{uri: item.profileImage}}
                  style={styles.userImage}
                />
              ) : (
                <View style={styles.noImage}></View>
              )}
              <View style={styles.textAndButtons}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSuspendAccount(item.id)}>
                    <Text style={styles.actionButtonText}>Suspend Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleViewInfo(item)}>
                    <Text>
                      <Icon name="visibility" size={20} color="green" />
                    </Text>
                  </TouchableOpacity>
                  {/* Delete Account Button with FontAwesome icon */}
                  <TouchableOpacity onPress={() => handleDeleteUser(item.id)}>
                    <Icon name="delete" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      {/* Add New User Button */}
      <TouchableOpacity
        style={styles.addNewUserButton} // Custom style for the button
        onPress={() => setNewUserModalVisible(true)}>
        <Text style={styles.addNewUserButtonText}>Add New User</Text>
      </TouchableOpacity>

      {/* Modal for viewing user information */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>User Information</Text>

            <Text style={styles.modalText}>Name: {selectedUser?.name}</Text>
            <Text style={styles.modalText}>Email: {selectedUser?.email}</Text>
            {selectedUser?.profileImage && (
              <Image
                source={{uri: selectedUser.profileImage}}
                style={styles.modalImage}
              />
            )}

            {/* Close Modal Button */}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for adding a new user */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={newUserModalVisible}
        onRequestClose={() => setNewUserModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New User</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={newUser.name}
                onChangeText={text => setNewUser({...newUser, name: text})}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={newUser.email}
                onChangeText={text => setNewUser({...newUser, email: text})}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                secureTextEntry={true} // This will mask the input as a password
                value={newUser.password}
                onChangeText={text => setNewUser({...newUser, password: text})}
              />
            </View>

            {/* Role Selector */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Role:</Text>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  {
                    backgroundColor: newUser.role
                      ? AppConstants.primaryColor
                      : AppConstants.primaryColor,
                  },
                ]} // Green when user is admin, light gray when user is not
                onPress={() => setNewUser({...newUser, role: !newUser.role})}>
                <Text style={styles.roleText}>
                  {newUser.role ? 'Admin' : 'User'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddNewUser}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setNewUserModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
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
    padding: 20,
  },
  addNewUserButton: {
    backgroundColor: AppConstants.primaryColor, // Primary color from AppConstants
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10, // Rounded corners
    marginTop: 20, // Space from previous element
    alignItems: 'center', // Center the text horizontally
    elevation: 3, // Add shadow for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow position
    shadowOpacity: 0.3, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow radius for iOS
  },
  addNewUserButtonText: {
    color: '#fff', // Text color white
    fontSize: 18, // Font size
    fontWeight: '600', // Semi-bold font weight
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  userCard: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  noImage: {
    width: 60,
    height: 60,
    backgroundColor: '#ccc',
    borderRadius: 30,
    marginRight: 15,
  },
  textAndButtons: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppConstants.primaryColor,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
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
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#777',
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  closeModalButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: 'row', // Aligning the text and button inline
    alignItems: 'center', // Vertically center the text with button
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppConstants.primaryColor,
    marginRight: 10, // Space between the label and button
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  roleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // White text color for better visibility on green background
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    width: '45%',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    width: '45%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ManageUsersScreen;
