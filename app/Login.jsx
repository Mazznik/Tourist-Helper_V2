import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ImageBackground, Alert, Text, TouchableOpacity} from 'react-native';
import { auth } from './Firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("User logged in successfully.")
        navigation.replace('MapScreen')
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert("Invalid email/password.")
      });
  };

  return (
    <ImageBackground source={require('./background.jpg')} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.title}>Tourist Helper</Text>
        </View>
        <View style={styles.middle}>
          <TextInput
            placeholder='Email'
            placeholderTextColor={"lightgrey"}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={"lightgrey"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        <TouchableOpacity style={styles.button_login} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        </View>
        <View style={styles.bottom}>
          <Button
            title="Don't have an account? Sign Up"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  top: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    fontStyle:"italic",
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'white',
  },
  bottom: {
    marginBottom: 30,
  },
  button_login: {
    width: '50%',
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#007BFF',
    borderRadius: 5,
    backgroundColor: 'lightgrey',
    marginTop: 12,
    alignSelf: 'center'
  },
  buttonText: {
    color: '#007BFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Login;
