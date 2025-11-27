import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Dashboard({ navigation }) {
  const [role, setRole] = useState('');
  const [view, setView] = useState('agendar');
  const [appointments, setAppointments] = useState([]);
  
  // Dados do Agendamento
  const [barber, setBarber] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Dados do Perfil
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileContact, setProfileContact] = useState('');

  const availableBarbers = ['Lucas', 'Cauan', 'Alison'];

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    const storedRole = await AsyncStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
      
      // Definição da tela inicial por Role
      if (storedRole === 'admin' || storedRole === 'barber') {
        setView('listar');
      } else {
        setView('agendar'); // User começa agendando
        fetchUserProfile();
      }
      
      fetchAppointments(storedRole);
    } else {
      handleLogout();
    }
  };

  const fetchAppointments = async (currentRole) => {
    try {
      let url = '/appointments/my-appointments'; 
      
      if (currentRole === 'admin') url = '/appointments/all';
      if (currentRole === 'barber') url = '/appointments/barber-schedule'; 
      
      const res = await api.get(url);
      setAppointments(res.data);
    } catch (err) {
      console.log(err);
    }
  };


  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setProfileName(res.data.name);
      setProfileEmail(res.data.email);
      setProfileContact(res.data.contact || '');
    } catch (err) { console.log(err); }
  };

  const handleContactChange = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    if (cleaned.length > 7) formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    setProfileContact(formatted);
  };

  const handleUpdateProfile = async () => {
    try {
      await api.put('/auth/update', { name: profileName, contact: profileContact });
      Alert.alert('Sucesso', 'Dados atualizados!');
} catch { 
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (selectedDate.getDay() === 0) {
        Alert.alert('Fechado', 'A barbearia não funciona aos domingos.');
        return; 
      }
      setDate(selectedDate);
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hour = selectedTime.getHours();
      const minute = selectedTime.getMinutes();
      if (hour < 9) { Alert.alert('Fechado', 'Abre às 09:00.'); return; }
      if (hour > 19 || (hour === 19 && minute > 30)) { Alert.alert('Fechado', 'Fecha às 19:30.'); return; }
      setTime(selectedTime);
    }
  };

  const formatDateBackend = (rawDate) => {
    const year = rawDate.getFullYear();
    const month = String(rawDate.getMonth() + 1).padStart(2, '0');
    const day = String(rawDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeBackend = (rawTime) => {
    const hours = String(rawTime.getHours()).padStart(2, '0');
    const minutes = String(rawTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleAgendar = async () => {
    if (!barber) return Alert.alert('Atenção', 'Escolha um barbeiro.');
    const day = date.getDay();
    const hour = time.getHours();
    const minute = time.getMinutes();
    if (day === 0) return Alert.alert('Erro', 'Não agendamos aos domingos.');
    if (hour < 9 || hour > 19 || (hour === 19 && minute > 30)) return Alert.alert('Erro', 'Horário fechado.');

    try {
      const dateString = formatDateBackend(date);
      const timeString = formatTimeBackend(time);
      const appointmentDate = new Date(`${dateString}T${timeString}:00`);
      await api.post('/appointments', { barber, date: appointmentDate });
      Alert.alert('Sucesso', 'Agendamento Confirmado!');
      fetchAppointments(role);
      setView('listar');
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Falha ao agendar.');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Não' },
      { text: 'Sim', onPress: async () => {
          try {
            await api.delete(`/appointments/${id}`);
            fetchAppointments(role);
            } catch { 
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        }
      }
    ]);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      
      {/* LÓGICA DE EXIBIÇÃO DOS DADOS DO CARD */}
      
      {/* 1. BARBEIRO: Se for Admin ou User, mostra o nome do Barbeiro. Se for Barbeiro, esconde. */}
      {role !== 'barber' && (
        <Text style={styles.cardText}><Text style={styles.bold}>Barbeiro:</Text> {item.barber}</Text>
      )}

      {/* 2. CLIENTE: Se for Admin ou Barbeiro, mostra o nome do Cliente e Telefone */}
      {(role === 'admin' || role === 'barber') && (
        <>
          <Text style={styles.cardText}><Text style={styles.bold}>Cliente:</Text> {item.user?.name || '---'}</Text>
          <Text style={styles.cardText}><Text style={styles.bold}>WhatsApp:</Text> {item.user?.contact || '---'}</Text>
        </>
      )}

      <Text style={styles.cardText}>
        <Text style={styles.bold}>Data:</Text> {new Date(item.date).toLocaleString('pt-BR')}
      </Text>
      
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
        <Text style={styles.deleteText}>{role === 'user' ? 'Excluir' : 'Cancelar Cliente'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {role === 'admin' ? 'Administração' : (role === 'barber' ? 'Minha Agenda' : 'Barbearia')}
        </Text>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logoutText}>Sair</Text></TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {/* CLIENTE */}
        {role === 'user' && (
          <>
            <TouchableOpacity onPress={() => setView('agendar')} style={[styles.tab, view === 'agendar' && styles.activeTab]}>
              <Text style={styles.tabText}>Agendar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setView('listar')} style={[styles.tab, view === 'listar' && styles.activeTab]}>
              <Text style={styles.tabText}>Agendamentos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setView('perfil')} style={[styles.tab, view === 'perfil' && styles.activeTab]}>
              <Text style={styles.tabText}>Conta</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ADMIN */}
        {role === 'admin' && (
          <TouchableOpacity onPress={() => setView('listar')} style={[styles.tab, styles.activeTab, { flex: 1 }]}>
            <Text style={styles.tabText}>Agenda Completa (Todos)</Text>
          </TouchableOpacity>
        )}

        {/* BARBEIRO */}
        {role === 'barber' && (
          <TouchableOpacity onPress={() => setView('listar')} style={[styles.tab, styles.activeTab, { flex: 1 }]}>
            <Text style={styles.tabText}>Meus Clientes</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {view === 'agendar' && role === 'user' && (
          <ScrollView>
            <Text style={styles.label}>Escolha o Barbeiro:</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10}}>
              {availableBarbers.map(b => (
                <TouchableOpacity key={b} onPress={() => setBarber(b)} style={[styles.selectBtn, barber === b && styles.activeSelectBtn]}>
                   <Text style={{color: barber === b ? '#1a1a1a' : '#fff'}}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Data:</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.pickerText}>{date.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
            {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} minimumDate={new Date()} />}
            <Text style={styles.label}>Hora:</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.pickerText}>{formatTimeBackend(time)}</Text>
            </TouchableOpacity>
            {showTimePicker && <DateTimePicker value={time} mode="time" is24Hour={true} display="spinner" minuteInterval={5} onChange={onChangeTime} />}
            <TouchableOpacity style={styles.actionBtn} onPress={handleAgendar}>
              <Text style={styles.actionBtnText}>Confirmar Agendamento</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {view === 'listar' && (
          <FlatList 
            data={appointments}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={{color: '#fff', textAlign: 'center'}}>Nenhum agendamento.</Text>}
          />
        )}

        {view === 'perfil' && role === 'user' && (
          <ScrollView>
            <Text style={styles.sectionTitle}>Meus Dados</Text>
            <Text style={styles.label}>Nome:</Text>
            <TextInput style={styles.input} value={profileName} onChangeText={setProfileName} />
            <Text style={styles.label}>Email (Não alterável):</Text>
            <TextInput style={[styles.input, { backgroundColor: '#2a2a2a', color: '#888' }]} value={profileEmail} editable={false} />
            <Text style={styles.label}>Contato:</Text>
            <TextInput style={styles.input} value={profileContact} onChangeText={handleContactChange} keyboardType="numeric" maxLength={15} />
            <TouchableOpacity style={styles.actionBtn} onPress={handleUpdateProfile}>
              <Text style={styles.actionBtnText}>Salvar Alterações</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222' },
  headerTitle: { color: '#c5a47e', fontSize: 20, fontWeight: 'bold' },
  logoutText: { color: '#ff6b6b', fontWeight: 'bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#333' },
  tab: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#c5a47e' },
  tabText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 22, color: '#fff', marginBottom: 20, fontWeight: 'bold' },
  label: { color: '#c5a47e', marginTop: 10, marginBottom: 5 },
  input: { backgroundColor: '#333', color: '#fff', padding: 12, borderRadius: 5, marginBottom: 10 },
  pickerButton: { backgroundColor: '#333', padding: 15, borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: '#444' },
  pickerText: { color: '#fff', fontSize: 16 },
  selectBtn: { padding: 10, backgroundColor: '#444', marginRight: 10, marginBottom: 10, borderRadius: 5 },
  activeSelectBtn: { backgroundColor: '#c5a47e' },
  actionBtn: { backgroundColor: '#c5a47e', padding: 15, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  actionBtnText: { fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#333', padding: 15, borderRadius: 8, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#c5a47e' },
  cardText: { color: '#eee', marginBottom: 5 },
  bold: { fontWeight: 'bold', color: '#c5a47e' },
  deleteBtn: { backgroundColor: '#ff6b6b', padding: 8, borderRadius: 4, marginTop: 10, alignSelf: 'flex-start' },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});