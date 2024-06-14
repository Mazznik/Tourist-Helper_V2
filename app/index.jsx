import 'react-native-gesture-handler';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from './MapScreen';
import Login from './Login';
import Register from './Register';
import MyMarkerListScreen from './MyMarkerListScreen'
import CustomDrawerContent from './CustomDrawerContent';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Map" component={MapScreen} options={{ headerShown: false }}/>
      <Drawer.Screen name="My Markers" component={MyMarkerListScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
      <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
            <Stack.Screen name="MapScreen" component={DrawerNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
  );
}