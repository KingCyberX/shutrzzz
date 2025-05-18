import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const Notification = ({message, type, onClose}) => {
  return (
    <View
      style={[
        styles.notification,
        {backgroundColor: type === 'error' ? 'red' : 'green'},
      ]}>
      <Text style={styles.text}>{message}</Text>
      <Text style={styles.closeText} onPress={onClose}>
        Close
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    borderRadius: 5,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeText: {
    marginTop: 5,
    color: 'white',
    textDecorationLine: 'underline',
  },
});

export default Notification;
