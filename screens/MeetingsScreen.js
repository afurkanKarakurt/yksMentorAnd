import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_USER_KEY = 'currentUser';
const USERS_KEY = 'registeredUsers';

export default function MeetingsScreen() {
  const [currentUser, setCurrentUser] = useState(null);
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCurrentUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
        const storedUsers = await AsyncStorage.getItem(USERS_KEY);
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        const parsedCurrentUser = storedCurrentUser
          ? JSON.parse(storedCurrentUser)
          : null;

        setCurrentUser(parsedCurrentUser);
        if (parsedCurrentUser) {
          if (parsedCurrentUser.role === 'teacher') {
            const students = users.filter(
              (user) =>
                user.role === 'student' &&
                user.linkedTeacherCode === parsedCurrentUser.teacherCode
            );
            setLinkedUsers(students);
          } else if (parsedCurrentUser.role === 'student') {
            const teachers = users.filter(
              (user) =>
                user.role === 'teacher' &&
                user.teacherCode === parsedCurrentUser.linkedTeacherCode
            );
            setLinkedUsers(teachers);
          }
        }
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.userName}>{item.username}</Text>
      <Text style={styles.userRole}>{item.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      {item.teacherCode ? (
        <Text style={styles.userMeta}>Kod: {item.teacherCode}</Text>
      ) : null}
    </View>
  );

  const title = currentUser?.role === 'teacher' ? 'Öğrencilerim' : 'Öğretmenlerim';
  const subtitle =
    currentUser?.role === 'teacher'
      ? 'Bağlı öğrencilerin burada listelenir.'
      : 'Öğretmen kodunla bağlı öğretmenlerin burada görünür.';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 24 }} />
        ) : currentUser ? (
          linkedUsers.length > 0 ? (
            <FlatList
              data={linkedUsers}
              keyExtractor={(item) => item.email}
              renderItem={renderUserItem}
              contentContainerStyle={styles.list}
            />
          ) : (
            <Text style={styles.emptyText}>
              {currentUser.role === 'teacher'
                ? 'Henüz bağlı öğrencin yok. Öğrenciler kodunu kullanarak kaydolduğunda burada görünecek.'
                : 'Henüz bir öğretmen ile bağlantın yok. Kayıt sırasında doğru öğretmen kodunu girdiğinden emin ol.'}
            </Text>
          )
        ) : (
          <Text style={styles.emptyText}>Lütfen giriş yapın.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FC' },
  content: {
    padding: 24,
    flex: 1,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { color: '#6B7280', marginBottom: 20 },
  list: {
    paddingBottom: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 3,
  },
  userName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  userRole: { fontSize: 14, color: '#6C63FF', marginTop: 4 },
  userEmail: { color: '#4B5563', marginTop: 8 },
  userMeta: { color: '#6B7280', marginTop: 4, fontSize: 13 },
  emptyText: { color: '#6B7280', marginTop: 24, fontSize: 16, lineHeight: 24 },
});
