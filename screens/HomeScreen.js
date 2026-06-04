import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_USER_KEY = 'currentUser';
const USERS_KEY = 'registeredUsers';
const windowWidth = Dimensions.get('window').width;

// Öğretmen Paneli Component
const TeacherDashboard = ({ currentUser, navigation }) => {
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const storedUsers = await AsyncStorage.getItem(USERS_KEY);
        if (storedUsers && currentUser?.teacherCode) {
          const users = JSON.parse(storedUsers);
          const students = users.filter(
            (u) =>
              u.role === 'student' &&
              u.linkedTeacherCode === currentUser.teacherCode
          );
          setLinkedStudents(students);
        }
      } catch (error) {
        console.error('Öğrenciler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [currentUser?.teacherCode]);

  const handleCopyCode = () => {
    if (currentUser?.teacherCode) {
      Alert.alert('✅ Kopyalandı', `Kod "${currentUser.teacherCode}" panoya kopyalandı.`);
    }
  };

  const getStudentInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStudentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.studentCard}
      activeOpacity={0.75}
      onPress={() => {
        Alert.alert(
          item.username,
          `E-posta: ${item.email}\n\nDetaylı bilgi sayfası yakında eklenecek.`
        );
      }}
    >
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={['#6C63FF', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{getStudentInitials(item.username)}</Text>
        </LinearGradient>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.username}</Text>
        <Text style={styles.studentEmail}>{item.email}</Text>
      </View>
      <Text style={styles.studentArrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.brandLogo}>
            <Text style={styles.brandLogoText}>Y</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Öğretmen Paneli</Text>
            <Text style={styles.headerSubtitle}>
              Hoş geldin, {currentUser?.username}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
          }
        >
          <Text style={styles.logoutBtnText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        {/* Code Card */}
        <LinearGradient
          colors={['#FFFFFF', '#FAFBFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statCardTitle}>KATILIM KODUNUZ</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeValue}>{currentUser?.teacherCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
              activeOpacity={0.7}
            >
              <Text style={styles.copyIcon}>📋</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.codeHelper}>
            Öğrencilerin bu kodu ile kayıt olması için paylaş.
          </Text>
        </LinearGradient>

        {/* Students Count Card */}
        <LinearGradient
          colors={['#FFFFFF', '#FAFBFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statCardTitle}>ÖĞRENCİ SAYISI</Text>
          <View style={styles.countContainer}>
            <Text style={styles.countValue}>{linkedStudents.length}</Text>
          </View>
          <Text style={styles.countHelper}>
            {linkedStudents.length === 0
              ? 'Henüz öğrenci kaydı yok'
              : `${linkedStudents.length} öğrenci bağlı`}
          </Text>
        </LinearGradient>
      </View>

      {/* Students List */}
      <View style={styles.studentsSection}>
        <Text style={styles.sectionTitle}>Öğrencileriniz</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : linkedStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyTitle}>Henüz öğrenci yok</Text>
            <Text style={styles.emptyText}>
              Öğrenciler sizin katılım kodunuzu kullanarak kayıt olduğunda burada
              görünecekler.
            </Text>
          </View>
        ) : (
          <FlatList
            data={linkedStudents}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item.email}
            scrollEnabled={false}
            contentContainerStyle={styles.studentList}
          />
        )}
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

// Öğrenci Dashboard Component
const StudentDashboard = ({ currentUser, navigation, scrollRef }) => {
  const [hours, setHours] = useState('');
  const [tyt, setTyt] = useState('');
  const [ayt, setAyt] = useState('');
  const [entries, setEntries] = useState([]);
  const [tasksY, setTasksY] = useState(0);
  const [todayY, setTodayY] = useState(0);

  const handleSave = () => {
    if (!hours && !tyt && !ayt) {
      Alert.alert('Uyarı', 'Lütfen en az bir alan doldurun.');
      return;
    }

    const parseNum = (v) => {
      if (v === '' || v === null || v === undefined) return null;
      const n = parseFloat(String(v).replace(',', '.'));
      return isNaN(n) ? null : n;
    };

    const hrs = parseNum(hours);
    const tytNum = parseNum(tyt);
    const aytNum = parseNum(ayt);

    if (tytNum !== null && (tytNum < 0 || tytNum > 120)) {
      Alert.alert('Hata', 'TYT neti 0-120 arası olmalıdır.');
      return;
    }
    if (aytNum !== null && (aytNum < 0 || aytNum > 80)) {
      Alert.alert('Hata', 'AYT neti 0-80 arası olmalıdır.');
      return;
    }

    const now = new Date();
    const entry = {
      id: Date.now().toString(),
      dateISO: now.toISOString(),
      date: now.toLocaleString(),
      hours: hrs !== null ? String(hrs) : '--',
      tyt: tytNum !== null ? String(tytNum) : '--',
      ayt: aytNum !== null ? String(aytNum) : '--',
    };
    setEntries((p) => [entry, ...p]);
    setHours('');
    setTyt('');
    setAyt('');
  };

  const handleHoursChange = (text) => {
    const normalized = text.replace(',', '.');
    if (/^[0-9]*\.?[0-9]*$/.test(normalized)) {
      setHours(normalized);
    }
  };

  const handleTytChange = (text) => {
    if (/^[0-9]*$/.test(text)) {
      if (text === '') return setTyt('');
      const n = parseInt(text, 10);
      if (n > 120) {
        Alert.alert('Hata', 'TYT neti 120 üstü olamaz.');
        return setTyt('');
      }
      setTyt(String(n));
    }
  };

  const handleAytChange = (text) => {
    if (/^[0-9]*$/.test(text)) {
      if (text === '') return setAyt('');
      const n = parseInt(text, 10);
      if (n > 80) {
        Alert.alert('Hata', 'AYT neti 80 üstü olamaz.');
        return setAyt('');
      }
      setAyt(String(n));
    }
  };

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.headerStudent}>
        <View style={styles.brandBox}>
          <Text style={styles.brandLogo}>Y</Text>
          <Text style={styles.brandText}>YKS Mentor</Text>
        </View>
        <View style={styles.topActions}>
          <Text style={styles.topActionText}>
            Merhaba, {currentUser?.username}
          </Text>
          <TouchableOpacity
            style={styles.logoutButtonStudent}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          >
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting Card */}
      <View style={styles.greetingCard}>
        <Text style={styles.greetingTitle}>
          Merhaba, <Text style={styles.greetingAccent}>{currentUser?.username}</Text> 👋
        </Text>
        <Text style={styles.greetingSubtitle}>
          Günün hedeflerini tamamla, netlerini takip et ve sınava hazırlan!
        </Text>
      </View>

      {/* Tasks Card */}
      <View style={styles.statsCard} onLayout={(e) => setTasksY(e.nativeEvent.layout.y)}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Görevlerim</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>0 Görev</Text>
          </View>
        </View>
        <View style={styles.taskBox}>
          <Text style={styles.taskTitle}>Harika! Tüm görevleri tamamladın.</Text>
          <Text style={styles.taskSubtitle}>Şu an için atanan yeni bir görev yok.</Text>
        </View>
      </View>

      {/* Today's Metrics Card */}
      <View style={styles.statsCard} onLayout={(e) => setTodayY(e.nativeEvent.layout.y)}>
        <Text style={styles.statsTitle}>Bugün Neler Yaptın?</Text>
        <Text style={styles.statsCaption}>
          Çalışma süreni ve çözdüğün deneme netlerini buraya girerek gelişimini grafiğe
          yansıt.
        </Text>
        <View style={styles.metricRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>⏱ Çalışma Saati</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 4.5"
              value={hours}
              onChangeText={handleHoursChange}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>🎯 TYT Net</Text>
            <TextInput
              style={styles.input}
              placeholder="Maks: 120"
              value={tyt}
              onChangeText={handleTytChange}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>🚀 AYT Net</Text>
            <TextInput
              style={styles.input}
              placeholder="Maks: 80"
              value={ayt}
              onChangeText={handleAytChange}
              keyboardType="numeric"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Bugünkü Verileri Kaydet</Text>
        </TouchableOpacity>
      </View>

      {/* Chart Card */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Gelişim Grafiği</Text>
        {entries.length === 0 ? (
          <Text style={styles.chartSubtitle}>
            Henüz performans verisi yok. Üstteki formdan ilk verinizi girin!
          </Text>
        ) : (
          (() => {
            const labels = entries
              .slice()
              .reverse()
              .map((e) => (e.dateISO ? new Date(e.dateISO) : new Date(e.date)).toLocaleDateString());

            const parseNum = (v) => {
              const n = parseFloat(String(v).replace(',', '.'));
              return isNaN(n) ? 0 : n;
            };

            const hoursData = entries.slice().reverse().map((e) => parseNum(e.hours));
            const tytData = entries.slice().reverse().map((e) => parseNum(e.tyt));
            const aytData = entries.slice().reverse().map((e) => parseNum(e.ayt));

            const chartWidth = Math.max(windowWidth * 0.8, 320);
            const chartConfig = {
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(67,56,202,${opacity})`,
              labelColor: () => '#6B7280',
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#4338CA' },
            };

            return (
              <>
                <Text style={[styles.chartSubtitle, { marginTop: 6 }]}>Çalışma Saati</Text>
                <LineChart
                  data={{ labels, datasets: [{ data: hoursData }] }}
                  width={chartWidth}
                  height={150}
                  chartConfig={chartConfig}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 12 }}
                />

                <Text style={styles.chartSubtitle}>TYT Net</Text>
                <LineChart
                  data={{ labels, datasets: [{ data: tytData }] }}
                  width={chartWidth}
                  height={150}
                  chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(16,185,129,${o})` }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 12 }}
                />

                <Text style={styles.chartSubtitle}>AYT Net</Text>
                <LineChart
                  data={{ labels, datasets: [{ data: aytData }] }}
                  width={chartWidth}
                  height={150}
                  chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(234,88,12,${o})` }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 12 }}
                />
              </>
            );
          })()
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

export default function HomeScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setLoading(true);
        const storedCurrentUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (storedCurrentUser) {
          setCurrentUser(JSON.parse(storedCurrentUser));
        }
      } catch (error) {
        console.error('Current user yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();

    const unsubscribe = navigation.addListener('focus', loadCurrentUser);
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.centerText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.centerText}>Lütfen giriş yapın.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          >
            <Text style={styles.backButtonText}>Giriş Sayfasına Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Teacher Dashboard
  if (currentUser.role === 'teacher') {
    return (
      <LinearGradient
        colors={['#EEF2FF', '#F5F3FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <TeacherDashboard currentUser={currentUser} navigation={navigation} />

          {/* Fixed Bottom Navigation */}
          <View style={styles.fixedBottom}>
            <TouchableOpacity
              style={styles.bottomNavBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Tasks')}
            >
              <Text style={styles.bottomNavBtnText}>Görevlerim</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomNavBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Performance')}
            >
              <Text style={styles.bottomNavBtnText}>Performans</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomNavBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Meetings')}
            >
              <Text style={styles.bottomNavBtnText}>Görüşmeler</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Student Dashboard
  return (
    <SafeAreaView style={styles.containerStudent}>
      <StudentDashboard currentUser={currentUser} navigation={navigation} scrollRef={scrollRef} />

      {/* Fixed Bottom Navigation for Student */}
      <View style={styles.fixedBottomStudent}>
        <TouchableOpacity
          style={styles.bottomBtn}
          activeOpacity={0.85}
          onPress={() => {
            if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: true });
          }}
        >
          <Text style={styles.bottomBtnText}>Görevlerim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBtn}
          activeOpacity={0.85}
          onPress={() => {
            if (scrollRef.current) scrollRef.current.scrollTo({ y: 200, animated: true });
          }}
        >
          <Text style={styles.bottomBtnText}>Performans</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Meetings')}
        >
          <Text style={styles.bottomBtnText}>Görüşmeler</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  containerStudent: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  // Teacher Dashboard Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  statCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6C63FF',
    letterSpacing: 2,
    flex: 1,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyIcon: {
    fontSize: 20,
  },
  codeHelper: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  countContainer: {
    marginBottom: 10,
  },
  countValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#A855F7',
  },
  countHelper: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  studentsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  studentList: {
    paddingBottom: 8,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  studentEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },
  studentArrow: {
    fontSize: 18,
    color: '#D1D5DB',
    marginLeft: 10,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  bottomSpacer: {
    height: 20,
  },
  fixedBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  bottomNavBtn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavBtnText: {
    color: '#6C63FF',
    fontWeight: '700',
    fontSize: 13,
  },
  // Student Dashboard Styles
  headerStudent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#3730A3',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    fontSize: 18,
    fontWeight: '800',
    marginRight: 10,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  topActionText: {
    color: '#374151',
    fontSize: 14,
    marginRight: 14,
  },
  logoutButtonStudent: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  logoutText: {
    color: '#111827',
    fontWeight: '600',
  },
  greetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    elevation: 6,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  greetingAccent: {
    color: '#6D28D9',
  },
  greetingSubtitle: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 5,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  badgeText: {
    color: '#4338CA',
    fontWeight: '700',
    fontSize: 12,
  },
  taskBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#FAFBFF',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  taskSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  statsCaption: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  metricBox: {
    flex: 1,
    minWidth: windowWidth > 720 ? '30%' : '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFF',
    padding: 14,
    marginBottom: 12,
  },
  metricLabel: {
    color: '#4B5563',
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    borderRadius: 18,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 5,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  fixedBottomStudent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  bottomBtn: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bottomBtnText: {
    color: '#4338CA',
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  centerText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6C63FF',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
