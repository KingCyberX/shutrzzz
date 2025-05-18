import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

const ManageTutorialsScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Tutorials</Text>
      <Text style={styles.description}>
        Here you can manage the tutorials of the app.
      </Text>
      {/* Add Tutorial Button */}
      <Button
        title="Add New Tutorial"
        onPress={() => alert('Add Tutorial functionality')}
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

export default ManageTutorialsScreen;
