// app/screens/VideoGridPage.js
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {AppConstants} from '../utils/AppConstants'; // Import AppConstants for colors
import {useNavigation, useRoute} from '@react-navigation/native';
import AppBar from '../components/AppBar'; // Import AppBar
import Video from 'react-native-video'; // Import react-native-video

const VideoGridPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();

  // Sample videos for the tutorial
  const videos = [
    {
      id: 1,
      title: 'Video 1',
      uri: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
    {
      id: 2,
      title: 'Video 2',
      uri: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
    {
      id: 3,
      title: 'Video 3',
      uri: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
    {
      id: 4,
      title: 'Video 4',
      uri: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
    {
      id: 5,
      title: 'Video 5',
      uri: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
  ];

  // Open the video in a modal
  const openVideo = video => {
    setSelectedVideo(video);
    setModalVisible(true);
  };

  // Close the video modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedVideo(null);
  };

  return (
    <View style={styles.container}>
      {/* AppBar */}
      <AppBar title="Related Videos" onMenuPress={() => navigation.goBack()} />

      <View style={styles.contentContainer}>
        {/* Grid of videos */}
        <FlatList
          data={videos}
          numColumns={2}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.videoItem}
              onPress={() => openVideo(item)} // Open video modal
            >
              <Text style={styles.videoTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
          style={styles.videoGrid}
        />

        {/* Modal for video */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Video
                  source={{uri: selectedVideo?.uri}} // Video URL
                  style={styles.videoPlayer}
                  controls={true} // Show default controls (play, pause, etc.)
                  resizeMode="contain"
                  repeat={false}
                />
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppConstants.primaryColor,
    marginBottom: 20,
  },
  videoGrid: {
    marginTop: 10,
  },
  videoItem: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    width: '45%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppConstants.primaryColor,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: 200,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: AppConstants.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default VideoGridPage;
