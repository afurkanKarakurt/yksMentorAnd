import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

export default function ChatBot() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    { id: '1', text: 'Merhaba! Ben YKS Asistanıyım. YKS, rehberlik ve ders çalışma taktikleri ile ilgili sorular sorabilirsin.', sender: 'bot' },
  ]);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userText = inputText;
    const newUserMessage = { id: Date.now().toString(), text: userText, sender: 'user' };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Emülatör için 10.0.2.2, iOS için localhost. Gerçek telefon için null yerine IP yazın (örn: 'http://192.168.1.34:3000')
     // Android emülatörün bilgisayara bağlanması için gereken kesin köprü adresi
      const PROXY_URL = 'http://10.0.2.2:3000';
      const resp = await fetch(`${PROXY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (!resp.ok) throw new Error(`Proxy error ${resp.status}`);
      const json = await resp.json();
      const responseText = json.reply || 'Üzgünüm, sunucudan okunamayan bir cevap geldi.';

      const botResponse = { id: (Date.now() + 1).toString(), text: responseText, sender: 'bot' };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Proxy/AI Hatası:', error);
      const errorMsg = { id: Date.now().toString(), text: 'Üzgünüm, bir bağlantı hatası oluştu. Lütfen tekrar deneyin.', sender: 'bot' };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
      <Text style={[styles.messageText, item.sender === 'user' ? styles.userMessageText : styles.botMessageText]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonIcon}>💬</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.chatBox}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>YKS Asistanı</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Kapat ✖</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
            />

            {loading && <ActivityIndicator size="small" color="#007bff" style={{ marginBottom: 10 }} />}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Sorunuzu yazın..."
                  value={inputText}
                  onChangeText={setInputText}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
                  <Text style={styles.sendButtonText}>Gönder</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#007bff', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
  buttonIcon: { fontSize: 28, color: 'white' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  chatBox: { backgroundColor: 'white', height: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#007bff', alignItems: 'center' },
  chatTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  closeButton: { color: 'white', fontSize: 16 },
  messageBubble: { padding: 12, borderRadius: 10, marginVertical: 5, maxWidth: '80%' },
  userMessage: { backgroundColor: '#007bff', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  botMessage: { backgroundColor: '#e5e5ea', alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
  messageText: { fontSize: 16 },
  userMessageText: { color: 'white' },
  botMessageText: { color: 'black' },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#ddd', backgroundColor: 'white' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, height: 40, backgroundColor: '#f9f9f9' },
  sendButton: { marginLeft: 10, backgroundColor: '#007bff', paddingHorizontal: 15, justifyContent: 'center', borderRadius: 20 },
  sendButtonText: { color: 'white', fontWeight: 'bold' },
});