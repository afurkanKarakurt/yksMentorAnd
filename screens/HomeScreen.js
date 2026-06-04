import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU_ITEMS = ['Hızlı Erişim', 'Görevlerim', 'Performans', 'Görüşmeler'];
const windowWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const [hours, setHours] = useState('');
  const [tyt, setTyt] = useState('');
  const [ayt, setAyt] = useState('');
  const [entries, setEntries] = useState([]);
  const scrollRef = useRef(null);
  const [tasksY, setTasksY] = useState(0);
  const [todayY, setTodayY] = useState(0);

  const handleSave = () => {
    // basic validation
    if (!hours && !tyt && !ayt) {
      Alert.alert('Uyarı', 'Lütfen en az bir alan doldurun.');
      return;
    }

    // validate numeric formats and ranges
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

  // input handlers that only accept allowed characters and enforce max limits
  const handleHoursChange = (text) => {
    // allow digits and one optional dot
    const normalized = text.replace(',', '.');
    if (/^[0-9]*\.?[0-9]*$/.test(normalized)) {
      setHours(normalized);
    }
  };

  const handleTytChange = (text) => {
    // allow only digits
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
    <SafeAreaView style={styles.screen}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.wrapper}>
        <View style={styles.topBar}>
          <View style={styles.brandBox}>
            <Text style={styles.brandLogo}>Y</Text>
            <Text style={styles.brandText}>YKS Mentor</Text>
          </View>
          <View style={styles.topActions}>
            <Text style={styles.topActionText}>Merhaba, test</Text>
            <Text style={styles.topActionText}>Dashboard</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
            >
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bodyRow}>
          <View style={styles.sidebar} />

          <View style={styles.mainArea}>
            <View style={styles.greetingCard}>
              <Text style={styles.greetingTitle}>Merhaba, <Text style={styles.greetingAccent}>test</Text> 👋</Text>
              <Text style={styles.greetingSubtitle}>
                Günün hedeflerini tamamla, netlerini takip et ve sınava hazırlan!
              </Text>
            </View>

            <View style={styles.statsRow}>
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

              <View style={styles.statsCard} onLayout={(e) => setTodayY(e.nativeEvent.layout.y)}>
                <Text style={styles.statsTitle}>Bugün Neler Yaptın?</Text>
                <Text style={styles.statsCaption}>
                  Çalışma süreni ve çözdüğün deneme netlerini buraya girerek gelişimini grafiğe yansıt.
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
            </View>
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

            {/* footer buttons removed from content; fixed bottom bar added below */}
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedBottom} pointerEvents="box-none">
        <View style={styles.fixedInner}>
          <TouchableOpacity
            style={styles.bottomBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (scrollRef.current) scrollRef.current.scrollTo({ y: tasksY - 20, animated: true });
            }}
          >
            <Text style={styles.bottomBtnText}>Görevlerim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (scrollRef.current) scrollRef.current.scrollTo({ y: todayY - 20, animated: true });
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  wrapper: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  topBar: {
    flexDirection: windowWidth > 720 ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  logoutButton: {
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
  bodyRow: {
    flexDirection: windowWidth > 920 ? 'row' : 'column',
  },
  sidebar: {
    width: windowWidth > 920 ? 240 : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 5,
    marginBottom: windowWidth > 920 ? 0 : 16,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 18,
  },
  sidebarItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#F8FAFF',
  },
  sidebarItemText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '600',
  },
  mainArea: {
    flex: 1,
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
  statsRow: {
    flexDirection: windowWidth > 720 ? 'row' : 'column',
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 5,
    marginBottom: 16,
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
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  entryRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  entryDate: { color: '#6B7280', fontSize: 12, marginBottom: 4 },
  entryText: { color: '#111827', fontWeight: '600' },
  footerButtons: {
    flexDirection: windowWidth > 720 ? 'row' : 'column',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  footerBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: windowWidth > 720 ? 12 : 0,
    marginBottom: windowWidth > 720 ? 0 : 12,
  },
  footerBtnText: { color: '#4338CA', fontWeight: '700' },
  fixedBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'center',
  },
  fixedInner: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '94%',
    justifyContent: 'space-between',
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
  bottomBtnText: { color: '#4338CA', fontWeight: '700' },
  metricLabel: {
    color: '#4B5563',
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
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
});
