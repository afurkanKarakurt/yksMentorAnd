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
import { TouchableOpacity, Linking, Alert } from 'react-native';

const CURRENT_USER_KEY = 'currentUser';
const USERS_KEY = 'registeredUsers';

export default function MeetingsScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCurrentUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
        const storedUsers = await AsyncStorage.getItem(USERS_KEY);
        const rawTasks = await AsyncStorage.getItem('assignedTasks');
        const rawMeetings = await AsyncStorage.getItem('meetings');
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
            // teacher view: show meetings/tasks assigned by this teacher
            const tasks = rawTasks ? JSON.parse(rawTasks) : [];
            const meets = rawMeetings ? JSON.parse(rawMeetings) : [];
            const myTasks = tasks.filter((t) => t.teacherEmail === parsedCurrentUser.email);
            const myMeets = meets.filter((m) => m.teacherEmail === parsedCurrentUser.email);
            setAssignedTasks(myTasks);
            setMeetings(myMeets);
          } else if (parsedCurrentUser.role === 'student') {
            const teachers = users.filter(
              (user) =>
                user.role === 'teacher' &&
                user.teacherCode === parsedCurrentUser.linkedTeacherCode
            );
            setLinkedUsers(teachers);
            // student view: load tasks & meetings assigned to this student
            const tasks = rawTasks ? JSON.parse(rawTasks) : [];
            const meets = rawMeetings ? JSON.parse(rawMeetings) : [];
            const myTasks = tasks.filter((t) => t.studentEmail === parsedCurrentUser.email);
            const myMeets = meets.filter((m) => m.studentEmail === parsedCurrentUser.email);
            setAssignedTasks(myTasks);
            setMeetings(myMeets);
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
    <TouchableOpacity
      style={styles.userCard}
      activeOpacity={0.85}
      onPress={() => {
        if (currentUser?.role === 'teacher' && item.role === 'student') {
          navigation.navigate('StudentDetail', { student: item });
        }
      }}
    >
      <Text style={styles.userName}>{item.username}</Text>
      <Text style={styles.userRole}>{item.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      {item.teacherCode ? (
        <Text style={styles.userMeta}>Kod: {item.teacherCode}</Text>
      ) : null}
    </TouchableOpacity>
  );

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.smallMuted}>Atayan: {item.teacherEmail}</Text>
        {item.due ? <Text style={styles.smallMuted}>Son: {item.due}</Text> : null}
      </View>
    </View>
  );

  const renderMeetingItem = ({ item }) => (
    <View style={styles.taskItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{item.date}</Text>
        {item.note ? <Text style={styles.smallMuted}>{item.note}</Text> : <Text style={styles.smallMuted}>Not yok</Text>}
        {item.link ? (
          <TouchableOpacity onPress={async () => { try { const ok = await Linking.canOpenURL(item.link); if (ok) Linking.openURL(item.link); else Alert.alert('Geçersiz link'); } catch (e) { Alert.alert('Link açılamadı'); } }}>
            <Text style={[styles.smallMuted, { color: '#2563EB', marginTop: 6 }]}>Link: {item.link}</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.smallMuted}>Atayan: {item.teacherEmail}</Text>
      </View>
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
          <>
            {/* Linked users */}
            {linkedUsers.length > 0 ? (
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
            )}

            {/* If student, show assigned tasks and meetings */}
            {currentUser.role === 'student' && (
              <>
                <Text style={[styles.title, { marginTop: 8 }]}>Atanan Görevler</Text>
                {assignedTasks.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz görev atanmamış.</Text>
                ) : (
                  <FlatList data={assignedTasks} keyExtractor={(i) => i.id} renderItem={renderTaskItem} />
                )}

                <Text style={[styles.title, { marginTop: 12 }]}>Görüşmeler</Text>
                {meetings.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz görüşme planlanmamış.</Text>
                ) : (
                  <FlatList data={meetings} keyExtractor={(i) => i.id} renderItem={renderMeetingItem} />
                )}
              </>
            )}
          </>
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
  taskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  taskTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  smallMuted: { fontSize: 12, color: '#6B7280', marginTop: 6 },
});
