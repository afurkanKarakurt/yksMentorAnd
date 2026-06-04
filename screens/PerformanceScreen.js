import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

export default function PerformanceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Performans</Text>
        <Text style={styles.subtitle}>Burada performans detayları gösterilecek.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FC' },
  content: {
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { color: '#6B7280' },
});
