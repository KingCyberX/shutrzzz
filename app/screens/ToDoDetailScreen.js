import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AppConstants} from '../utils/AppConstants';
import {SwipeListView} from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const EQUIPMENT = [
  'Camera',
  'Tripod',
  'Lighting Kit',
  'Microphone',
  'Backdrop',
  'Reflector',
  'Lens',
];

const ToDoDetailScreen = ({route, navigation}) => {
  const {eventId, eventName} = route.params;
  const user = auth().currentUser;

  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !eventId) {
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('events')
      .doc(eventId)
      .collection('notes')
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        snapshot => {
          const notesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNotes(notesData);
          setLoading(false);
        },
        error => {
          console.error('Error fetching notes:', error);
          Alert.alert('Error', 'Failed to load notes.');
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [user, eventId]);

  const addNote = async () => {
    if (!selectedEquipment || !user || !eventId) return;

    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('events')
        .doc(eventId)
        .collection('notes')
        .add({
          text: selectedEquipment,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
      setSelectedEquipment(null);
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note.');
    }
  };

  const deleteNote = async id => {
    if (!user || !eventId) return;

    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('events')
        .doc(eventId)
        .collection('notes')
        .doc(id)
        .delete();

      setSelectedNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note.');
    }
  };

  const toggleNoteSelection = id => {
    setSelectedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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
      style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={AppConstants.primaryColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{eventName}</Text>
        <View style={{width: 28}} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Equipment selector */}
          <View style={styles.equipmentContainer}>
            <Text style={styles.label}>Select Equipment:</Text>
            <FlatList
              horizontal
              data={EQUIPMENT}
              keyExtractor={item => item}
              renderItem={({item}) => {
                const selected = selectedEquipment === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.equipmentItem,
                      selected && styles.equipmentItemSelected,
                    ]}
                    onPress={() => setSelectedEquipment(item)}>
                    <Text
                      style={[
                        styles.equipmentText,
                        selected && styles.equipmentTextSelected,
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              showsHorizontalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.addNoteButton} onPress={addNote}>
              <Text style={styles.addNoteButtonText}>Add to Notes</Text>
            </TouchableOpacity>
          </View>

          {/* Notes list with swipe-to-delete */}
          <SwipeListView
            data={notes}
            keyExtractor={item => item.id}
            renderItem={({item}) => {
              const isSelected = selectedNotes.has(item.id);
              return (
                <TouchableOpacity
                  onPress={() => toggleNoteSelection(item.id)}
                  style={[
                    styles.noteItem,
                    isSelected && styles.noteItemSelected,
                  ]}>
                  <Text style={styles.noteText}>{item.text}</Text>
                </TouchableOpacity>
              );
            }}
            renderHiddenItem={({item}) => (
              <View style={styles.hiddenItem}>
                <TouchableOpacity onPress={() => deleteNote(item.id)}>
                  <Icon name="delete" size={30} color="white" />
                </TouchableOpacity>
              </View>
            )}
            rightOpenValue={-75}
            disableRightSwipe
            contentContainerStyle={{paddingBottom: 20}}
            style={{marginTop: 20}}
            scrollEnabled={false} // Disable internal scroll so ScrollView handles it
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 45,
    paddingBottom: 15,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 40,
  },
  equipmentContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: '500',
    color: AppConstants.primaryColor,
  },
  equipmentItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: AppConstants.primaryColor,
    marginRight: 12,
  },
  equipmentItemSelected: {
    backgroundColor: AppConstants.secondaryColor,
  },
  equipmentText: {
    color: '#ccc',
    fontWeight: '600',
  },
  equipmentTextSelected: {
    color: AppConstants.primaryColor,
  },
  addNoteButton: {
    marginTop: 15,
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  addNoteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noteItem: {
    backgroundColor: AppConstants.secondaryColor,
    padding: 15,
    marginVertical: 8,
    borderRadius: 15,
  },
  noteItemSelected: {
    backgroundColor: AppConstants.primaryColor,
  },
  noteText: {
    color: AppConstants.brightColor,
    fontSize: 16,
    fontWeight: '500',
  },
  hiddenItem: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    marginVertical: 8,
    borderRadius: 15,
  },
});

export default ToDoDetailScreen;
