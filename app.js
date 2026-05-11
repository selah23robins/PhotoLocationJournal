import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';

import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [region, setRegion] = useState(null);
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get location automatically when app starts
  useEffect(() => {
    getLocation();
  }, []);

  // Ask for location permission and get GPS coordinates
  const getLocation = async () => {
    setError('');
    setLoading(true);

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    // Handle denied permission
    if (status !== 'granted') {
      setError(
        'Location permission denied. Please enable it in settings.'
      );
      setLoading(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (e) {
      setError('Could not get location.');
    }

    setLoading(false);
  };

  // Open photo library
  const pickImage = async () => {
    setError('');

    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Handle denied permission
    if (status !== 'granted') {
      setError(
        'Photo library permission denied.'
      );
      return;
    }

    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

      // User canceled image picker
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (e) {
      setError('Could not open image picker.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Photo Location Journal
      </Text>

      {/* Loading state */}
      {loading && (
        <ActivityIndicator size="large" />
      )}

      {/* Error state */}
      {error !== '' && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Get Current Location"
          onPress={getLocation}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Choose Photo"
          onPress={pickImage}
        />
      </View>

      {/* Show map if location exists */}
      {region && (
        <MapView
          style={styles.map}
          region={region}
        >
          <Marker coordinate={region} />
        </MapView>
      )}

      {/* Show image if selected */}
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    alignItems: 'center',
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
  },

  map: {
    width: 350,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },

  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },

  buttonContainer: {
    marginVertical: 10,
    width: 250,
  },

  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
