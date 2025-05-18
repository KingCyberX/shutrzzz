import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

const ManageToDoScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage To-Do List</Text>
      <Text style={styles.description}>
        Here you can manage the To-Do List for the app.
      </Text>
      {/* Add To-Do Button */}
      <Button
        title="Add New To-Do"
        onPress={() => alert('Add To-Do functionality')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default ManageToDoScreen;
