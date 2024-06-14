import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Button, Alert, Text, TouchableOpacity, Modal, TextInput, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { db, auth } from './Firebase'
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

const MapScreen = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [placeType, setPlaceType] = useState('cafe'); 
  const [selectedPlace, setSelectedPlace] = useState(null); 
  const [selectedMyMarker, setSelectedMyMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [newMarker, setNewMarker] = useState(null);
  const [description, setDescription] = useState(''); 

  const fetchMyMarkers = async () => {
    const user = auth.currentUser;
      if (user) {
        try {
            const markersRef = collection(db, 'markers');
            const q = query(markersRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const markersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMarkers(markersData);
          } catch (error) {
            console.error('Error fetching markers:', error);
          }
      }
  }

  useEffect(() => {
    (async () => {
      await fetchMyMarkers();
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);
 
  useFocusEffect(
    useCallback(() => {
      fetchMyMarkers();
    }, [])
  );

  const fetchPlaces = async (type) => {
    if (!location) {
      Alert.alert("Location not available");
      return;
    }
  
    const { latitude, longitude } = location;
  
    try {
      const response = await axios.get(NOMINATIM_BASE_URL, {
        params: {
          q: type,
          format: 'json',
          limit: 1000,
          viewbox: `${longitude-0.05},${latitude+0.05},${longitude+0.05},${latitude-0.05}`,
          bounded: 1
        }
      });
  
      if (response.data && response.data.length > 0) {
        setPlaces(response.data);
      } else {
        Alert.alert(`No ${type}s found.`);
      }
    } catch (error) {
      Alert.alert(`Error fetching ${type}s`, error.message);
    }
  };

  const handlePlaceTypeChange = (type) => {
    setPlaceType(type);
    fetchPlaces(type);
  };

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
  };

  const handleMyMarkerPress = (marker) => {
    setSelectedMyMarker(marker);
  };

  const navigateToLocation = (latitude, longitude) => {
    const appleMapsUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
    Linking.openURL(appleMapsUrl);
  };

  const handleLongPress = (event) => {
    setNewMarker(event.nativeEvent.coordinate);
  };

  const handleAddMarker = async () => {
    const user = auth.currentUser;
    console.log(markers)
    if (user && newMarker) {
    try{
      const markerData = {
        userId: user.uid,
        latitude: newMarker.latitude,
        longitude: newMarker.longitude,
        description
      };
      const docRef = await addDoc(collection(db, 'markers'), markerData)
      setMarkers(prevMarkers => [...prevMarkers, { id: docRef.id, ...markerData }]);
      setNewMarker(null);
      setDescription('');
      console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', error);
  }
    }
  };

  const findUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords);
  };

  const removeCategoryMarkers = () => {
    setPlaces([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <MaterialIcons name="menu" size={28} />
        </TouchableOpacity>
      </View>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onLongPress={handleLongPress}
        >
          {places.map((place) => (
            <Marker
              key={place.place_id}
              coordinate={{
                latitude: parseFloat(place.lat),
                longitude: parseFloat(place.lon),
              }}
              title={place.display_name.split(',')[0]}
              onPress={() => handleMarkerPress(place)}
            />
          ))}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: parseFloat(marker.latitude),
                longitude: parseFloat(marker.longitude),
              }}
              title={marker.description}
              onPress={() => handleMyMarkerPress(marker)}
              pinColor='green'
            />
          ))}
          <Marker
            coordinate={location}
            title="Your Location"
            pinColor="blue"
          />
        </MapView>
      )}

      <TouchableOpacity style={styles.locationButton} onPress={findUserLocation}>
        <MaterialIcons name="my-location" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={removeCategoryMarkers}>
          <Text style={styles.deleteButtonText}>Remove</Text>
          <Text style={styles.deleteButtonText}>markers</Text>
      </TouchableOpacity>

       {/* Category menu buttons */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={() => handlePlaceTypeChange('cafe')}>
          <Text style={styles.menuButtonText}>Cafes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => handlePlaceTypeChange('hospital')}>
          <Text style={styles.menuButtonText}>Hospitals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => handlePlaceTypeChange('supermarket')}>
          <Text style={styles.menuButtonText}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => handlePlaceTypeChange("hotels")}>
          <Text style={styles.menuButtonText}>Hotels</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Place */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedPlace !== null}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedPlace?.display_name.split(',')[0]}</Text>
            <Text>{selectedPlace?.display_name}</Text>
            <Button title="Close" onPress={() => setSelectedPlace(null)} />
            <Button title="Navigate" onPress={() => navigateToLocation(selectedPlace.lat, selectedPlace.lon)} />
          </View>
        </View>
      </Modal>

      {/* Modal for Add New My Marker */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={newMarker !== null}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a new marker</Text>
            <TextInput
              style={styles.inputDescription}
              placeholder="Description"
              placeholderTextColor={"lightgrey"}
              value={description}
              onChangeText={setDescription}
            />
            <Button title="Add Marker" onPress={handleAddMarker} />
            <Button title="Cancel" onPress={() => setNewMarker(null)} />
          </View>
        </View>
      </Modal>

      {/* Modal for My Marker */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedMyMarker !== null}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedMyMarker?.description}</Text>
            <Button title="Close" onPress={() => setSelectedMyMarker(null)} />
            <Button title="Navigate" onPress={() => navigateToLocation(selectedMyMarker.latitude, selectedMyMarker.longitude)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'space-around',
    padding: 10,
  },
  menuButton: {
    padding: 20,
    backgroundColor: '#ddd',
    borderRadius: 5,
    borderColor: 'black', 
    borderWidth: 2,
  },
  menuButtonText: {
    fontSize: 17,
    fontWeight: "bold",
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign:"center",
  },
  inputDescription: {
    width: '100px',
    height: 40,
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'white',
  },
  locationButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 85,
    left: 15,
    backgroundColor: '#fff',
    borderRadius: 30,
    borderColor: 'black', 
    borderWidth: 2,
    padding: 10,
    elevation: 5,
  },
  deleteButtonText:{
    fontSize: 17,
  },
  header: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    elevation: 10,
  },
});

export default MapScreen;
