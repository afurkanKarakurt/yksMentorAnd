import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TYT_SUBJECTS = [
  { key: 'turkce', label: 'Türkçe' },
  { key: 'sosyal', label: 'Sosyal' },
  { key: 'matematik', label: 'Matematik' },
  { key: 'fen', label: 'Fen' },
];

const AYT_SUBJECTS = [
  { key: 'matematik', label: 'Matematik' },
  { key: 'fen', label: 'Fen' },
  { key: 'edebiyat', label: 'Edebiyat / Sosyal-1' },
  { key: 'sosyal', label: 'Sosyal-2' },
];

const parseValue = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  const cleaned = String(value).replace(',', '.');
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const calculateNet = (correct, wrong) => {
  const net = parseValue(correct) - parseValue(wrong) / 4;
  return net > 0 ? Number(net.toFixed(2)) : 0;
};

export default function NetCalculatorScreen({ navigation }) {
  const [tytInputs, setTytInputs] = useState({
    turkce: '',
    sosyal: '',
    matematik: '',
    fen: '',
  });
  const [aytInputs, setAytInputs] = useState({
    matematik: '',
    fen: '',
    edebiyat: '',
    sosyal: '',
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('currentUser');
        if (raw) {
          setCurrentUser(JSON.parse(raw));
        }
      } catch (error) {
        console.error('Kullanıcı yüklenemedi:', error);
      }
    };
    loadUser();
  }, []);

  const updateInput = (section, key, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (section === 'tyt') {
      setTytInputs((prev) => ({ ...prev, [key]: numericValue }));
    } else {
      setAytInputs((prev) => ({ ...prev, [key]: numericValue }));
    }
  };

  const tytNetleri = TYT_SUBJECTS.map((subject) => ({
    ...subject,
    net: calculateNet(tytInputs[subject.key], tytInputs[subject.key + 'Wrong'] || 0),
  }));

  const aytNetleri = AYT_SUBJECTS.map((subject) => ({
    ...subject,
    net: calculateNet(aytInputs[subject.key], aytInputs[subject.key + 'Wrong'] || 0),
  }));

  const totalTytNet = tytNetleri.reduce((sum, item) => sum + item.net, 0).toFixed(2);
  const totalAytNet = aytNetleri.reduce((sum, item) => sum + item.net, 0).toFixed(2);

  const saveToLog = async () => {
    try {
      const record = {
        id: Date.now().toString(),
        dateISO: new Date().toISOString(),
        date: new Date().toLocaleDateString('tr-TR'),
        studentEmail: currentUser?.email || null,
        totalTytNet: Number(totalTytNet),
        totalAytNet: Number(totalAytNet),
        tytDetails: {
          turkce: calculateNet(tytInputs.turkce, tytInputs.turkceWrong || 0),
          sosyal: calculateNet(tytInputs.sosyal, tytInputs.sosyalWrong || 0),
          matematik: calculateNet(tytInputs.matematik, tytInputs.matematikWrong || 0),
          fen: calculateNet(tytInputs.fen, tytInputs.fenWrong || 0),
        },
        aytDetails: {
          matematik: calculateNet(aytInputs.matematik, aytInputs.matematikWrong || 0),
          fen: calculateNet(aytInputs.fen, aytInputs.fenWrong || 0),
          edebiyat: calculateNet(aytInputs.edebiyat, aytInputs.edebiyatWrong || 0),
          sosyal: calculateNet(aytInputs.sosyal, aytInputs.sosyalWrong || 0),
        },
      };

      const raw = await AsyncStorage.getItem('studentPerformances');
      const list = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem('studentPerformances', JSON.stringify([record, ...list]));
      Alert.alert('Başarılı', 'Netler günlüğe kaydedildi.');
      navigation.goBack();
    } catch (error) {
      console.error('Netler kaydedilemedi:', error);
      Alert.alert('Hata', 'Netler kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  const renderSubjectRow = (subject, section) => {
    const inputs = section === 'tyt' ? tytInputs : aytInputs;
    const wrongKey = `${subject.key}Wrong`;
    const netValue = calculateNet(inputs[subject.key], inputs[wrongKey] || 0);

    return (
      <View key={subject.key} style={styles.subjectRow}>
        <Text style={styles.subjectName}>{subject.label}</Text>
        <View style={styles.subjectInputs}>
          <View style={styles.smallInputBox}>
            <Text style={styles.smallLabel}>Doğru</Text>
            <TextInput
              style={styles.smallInput}
              placeholder="0"
              value={String(inputs[subject.key] || '')}
              onChangeText={(text) => updateInput(section, subject.key, text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.smallInputBox}>
            <Text style={styles.smallLabel}>Yanlış</Text>
            <TextInput
              style={styles.smallInput}
              placeholder="0"
              value={String(inputs[wrongKey] || '')}
              onChangeText={(text) => updateInput(section, wrongKey, text)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <Text style={styles.subjectNet}>{netValue.toFixed(2)} Net</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Net Hesaplama</Text>
          <Text style={styles.headerSubtitle}>
            TYT ve AYT dersleri için doğru / yanlış girişleri yap, netlerini anında gör ve toplamları kaydet.
          </Text>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Toplam TYT Neti</Text>
          <Text style={styles.totalValue}>{totalTytNet}</Text>
          <Text style={styles.totalLabel}>Toplam AYT Neti</Text>
          <Text style={styles.totalValue}>{totalAytNet}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>TYT Netleri</Text>
          {TYT_SUBJECTS.map((subject) => renderSubjectRow(subject, 'tyt'))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>AYT Netleri</Text>
          {AYT_SUBJECTS.map((subject) => renderSubjectRow(subject, 'ayt'))}
        </View>

        <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={saveToLog}>
          <LinearGradient colors={['#6C63FF', '#4338CA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveGradient}>
            <Text style={styles.saveText}>Netleri Günlüğe Kaydet</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  totalCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  totalLabel: {
    color: '#4338CA',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  totalValue: {
    color: '#111827',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  subjectRow: {
    marginBottom: 18,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  subjectInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  smallInputBox: {
    flex: 1,
  },
  smallLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  smallInput: {
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  subjectNet: {
    color: '#6D28D9',
    fontWeight: '800',
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
