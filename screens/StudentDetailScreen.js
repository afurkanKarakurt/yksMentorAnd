import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

export default function StudentDetailScreen({ route, navigation }) {
  const { student } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const rawTasks = await AsyncStorage.getItem('assignedTasks');
        const rawMeets = await AsyncStorage.getItem('meetings');
        const rawPerf = await AsyncStorage.getItem('performanceEntries');
        const t = rawTasks ? JSON.parse(rawTasks) : [];
        const m = rawMeets ? JSON.parse(rawMeets) : [];
        const p = rawPerf ? JSON.parse(rawPerf) : [];
        const myTasks = t.filter((x) => x.studentEmail === student.email);
        const myMeets = m.filter((x) => x.studentEmail === student.email);
        const myPerf = p.filter((x) => x.studentEmail === student.email);
        setTasks(myTasks);
        setMeetings(myMeets);
        setEntries(myPerf);
      } catch (error) {
        console.error('Detay yüklenemedi', error);
      } finally {
        setLoading(false);
      }
    };

    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [student?.email, navigation]);

  if (!student) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><Text>Öğrenci bulunamadı.</Text></View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6C63FF" />
      </SafeAreaView>
    );
  }

  const renderTask = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      {item.due ? <Text style={styles.smallMuted}>Son: {item.due}</Text> : null}
      <Text style={styles.smallMuted}>Atayan: {item.teacherEmail}</Text>
    </View>
  );

  const renderMeet = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.date}</Text>
      {item.note ? <Text style={styles.smallMuted}>{item.note}</Text> : null}
      <Text style={styles.smallMuted}>Atayan: {item.teacherEmail}</Text>
    </View>
  );

  const chartConfigBase = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(67,56,202,${opacity})`,
    labelColor: () => '#6B7280',
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#4338CA' },
  };

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

  const chartWidth = Math.max(windowWidth * 0.9, 320);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.title}>{student.username}</Text>
          <Text style={styles.sub}>ID: {student.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atanan Görevler</Text>
          {tasks.length === 0 ? <Text style={styles.empty}>Henüz görev yok.</Text> : <FlatList data={tasks} keyExtractor={(i) => i.id} renderItem={renderTask} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görüşmeler</Text>
          {meetings.length === 0 ? (
            <Text style={styles.empty}>Henüz görüşme yok.</Text>
          ) : (
            <FlatList
              data={meetings}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.itemTitle}>{item.date}</Text>
                  {item.note ? <Text style={styles.smallMuted}>{item.note}</Text> : null}
                  {item.link ? (
                    <TouchableOpacity onPress={async () => { try { const ok = await Linking.canOpenURL(item.link); if (ok) Linking.openURL(item.link); else Alert.alert('Geçersiz link'); } catch(e){ Alert.alert('Link açılamadı'); } }}>
                      <Text style={[styles.smallMuted, { color: '#2563EB', marginTop: 6 }]}>Görüşme Linki: {item.link}</Text>
                    </TouchableOpacity>
                  ) : null}
                  <Text style={styles.smallMuted}>Atayan: {item.teacherEmail}</Text>
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performans Grafiği</Text>
          {entries.length === 0 ? (
            <Text style={styles.empty}>Performans verisi yok.</Text>
          ) : (
            <>
              <Text style={styles.smallMuted}>Çalışma Saati</Text>
              <LineChart data={{ labels, datasets: [{ data: hoursData }] }} width={chartWidth} height={140} chartConfig={chartConfigBase} bezier style={styles.chart} />

              <Text style={[styles.smallMuted, { marginTop: 8 }]}>TYT Net</Text>
              <LineChart data={{ labels, datasets: [{ data: tytData }] }} width={chartWidth} height={140} chartConfig={{ ...chartConfigBase, color: (o = 1) => `rgba(16,185,129,${o})` }} bezier style={styles.chart} />

              <Text style={[styles.smallMuted, { marginTop: 8 }]}>AYT Net</Text>
              <LineChart data={{ labels, datasets: [{ data: aytData }] }} width={chartWidth} height={140} chartConfig={{ ...chartConfigBase, color: (o = 1) => `rgba(234,88,12,${o})` }} bezier style={styles.chart} />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#EEF2FF', backgroundColor: '#FFFFFF' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  sub: { color: '#6B7280', marginTop: 6 },
  section: { padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 8 },
  empty: { color: '#6B7280' },
  item: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 10 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  smallMuted: { color: '#6B7280', marginTop: 6 },
  chart: { borderRadius: 12, marginVertical: 8 },
});
