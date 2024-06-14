import React, { useState, useEffect, useCallback, useFocusEffect } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { db, auth } from './Firebase';
import { collection, query, where, getDocs, doc, deleteDoc} from "firebase/firestore";

const MarkerListScreen = ({ navigation }) => {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchMarkers = async () => {
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
    };
    
    fetchMarkers();
  }, []);

  const handleDeleteMarker = async (id) => {
    try {
        const markerDocRef = doc(db, 'markers', id);
        await deleteDoc(markerDocRef);
        setMarkers(markers.filter(marker => marker.id !== id));
      } catch (error) {
        Alert.alert('Error deleting marker', error.message);
      }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.description}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleDeleteMarker(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={markers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',  
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    flex: 1, 
    textAlign: "start",
  },
  button: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    justifyContent: "center",
  },
  buttonText: {
    color: '#fff',
  },
});

export default MarkerListScreen;
