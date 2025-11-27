import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      await AsyncStorage.setItem('token', res.data.token);
      
      const decoded = jwtDecode(res.data.token);
      await AsyncStorage.setItem('role', decoded.user.role);

      Alert.alert('Sucesso', 'Login realizado!');
      navigation.replace('Dashboard'); 
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Verifique suas credenciais ou conexão.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barbearia App</Text>
      <Text style={styles.subtitle}>Faça seu login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* BOTÃO DE ENTRAR */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>ENTRAR</Text>
      </TouchableOpacity>

      {/* BOTÃO DE CADASTRAR */}
      <TouchableOpacity 
        style={styles.registerButton} 
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, color: '#c5a47e', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#333', color: '#fff', borderRadius: 8, padding: 15, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#c5a47e', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#1a1a1a', fontWeight: 'bold', fontSize: 16 },
  
  registerButton: { marginTop: 20, alignItems: 'center' },
  registerText: { color: '#fff', fontSize: 16, textDecorationLine: 'underline' }
});