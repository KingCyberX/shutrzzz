import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

const ManageLightingSetupsScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Lighting Setups</Text>
      <Text style={styles.description}>
        Here you can manage the lighting setups.
      </Text>
      {/* Add Lighting Setup Button */}
      <Button
        title="Add New Lighting Setup"
        onPress={() => alert('Add Lighting Setup functionality')}
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

export default ManageLightingSetupsScreen;
