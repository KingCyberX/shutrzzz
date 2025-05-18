import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppBar from '../components/AppBar';
import {AppConstants} from '../utils/AppConstants';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const PersonalInformationPage = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Modal state for change password
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          Alert.alert('Error', 'User not logged in');
          navigation.goBack();
          return;
        }
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const data = userDoc.data();
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setCity(data.city || '');
          setCountry(data.country || '');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigation]);

  const handleUpdate = async () => {
    if (!name) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    setUpdating(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not logged in');
        return;
      }
      await firestore().collection('users').doc(currentUser.uid).update({
        name,
        phone,
        address,
        city,
        country,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Information updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update information');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      Alert.alert('Validation', 'Please fill in all fields');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert(
        'Validation',
        'New password and confirm password do not match',
      );
      return;
    }

    setChangingPass(true);
    const user = auth().currentUser;
    const credential = auth.EmailAuthProvider.credential(user.email, oldPass);

    try {
      // Reauthenticate user with old password
      await user.reauthenticateWithCredential(credential);

      // Update password
      await user.updatePassword(newPass);

      Alert.alert('Success', 'Password changed successfully');
      setModalVisible(false);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer]}>
        <ActivityIndicator size="large" color={AppConstants.primaryColor} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={AppConstants.primaryBackgroundGradient}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.linearGradient}>
      <AppBar
        title="Your Personal Information"
        navigation={navigation}
        isProfileScreen={true}
      />

      <TouchableOpacity
        style={styles.changePasswordTopButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.changePasswordTopButtonText}>Change Password</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Personal Information</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />

        <TextInput
          style={[styles.input, styles.disabledInput]}
          placeholder="Email"
          value={email}
          editable={false}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Country"
          value={country}
          onChangeText={setCountry}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.updateButton, {marginBottom: 50}]}
          onPress={handleUpdate}
          disabled={updating}>
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Information</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Old Password"
              secureTextEntry
              value={oldPass}
              onChangeText={setOldPass}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmPass}
              onChangeText={setConfirmPass}
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: '#aaa'}]}
                onPress={() => setModalVisible(false)}
                disabled={changingPass}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {backgroundColor: AppConstants.primaryColor},
                ]}
                onPress={handleChangePassword}
                disabled={changingPass}>
                {changingPass ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Change</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#e0e0e0',
  },
  updateButton: {
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 25,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  changePasswordTopButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  changePasswordTopButtonText: {
    color: AppConstants.primaryColor,
    fontWeight: '600',
    fontSize: 16,
    textDecorationLine: 'underline',
  },

  // Modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PersonalInformationPage;
