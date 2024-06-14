import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { auth } from './Firebase';

const CustomDrawerContent = (props) => {
  const navigation = useNavigation();

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigation.replace('Login');
    }).catch(error => {
      console.error(error);
    });
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerContent}>
        <DrawerItemList {...props} />
        <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
          <Text style={styles.drawerItemText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    padding: 16,
  },
  drawerItem: {
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  drawerItemText: {
    fontSize: 16,
    textAlign: "center",
  },
});
export default CustomDrawerContent;
