import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import api from './api';

export default function Register({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');


  const handleContactChange = (text) => {
    let cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);

    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    }
    if (cleaned.length > 7) {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }

    setContact(formatted);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !contact) {
      return Alert.alert('Erro', 'Preencha todos os campos.');
    }
    const rawNums = contact.replace(/\D/g, '');
    if (rawNums.length < 10) return Alert.alert('Erro', 'Número de telefone inválido.');

    try {
      await api.post('/auth/register', { name, email, password, contact });
      Alert.alert('Sucesso', 'Conta criada! Faça login agora.');
      navigation.goBack(); 
    } catch (err) {
      console.log(err);
      const msg = err.response?.data?.msg || 'Erro ao cadastrar';
      Alert.alert('Erro', msg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Celular (DDD + Número)"
          placeholderTextColor="#888"
          value={contact}
          onChangeText={handleContactChange}
          keyboardType="numeric"
          maxLength={15} //
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>CADASTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Já tem conta? Voltar para Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#1a1a1a' },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, color: '#c5a47e', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#333', color: '#fff', borderRadius: 8, padding: 15, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#c5a47e', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#1a1a1a', fontWeight: 'bold', fontSize: 16 },
  linkButton: { alignItems: 'center', padding: 10 },
  linkText: { color: '#c5a47e', fontSize: 16 }
});