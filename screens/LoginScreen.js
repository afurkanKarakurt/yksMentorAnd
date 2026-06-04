import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENT_USER_KEY = 'currentUser';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');

  const USERS_KEY = 'registeredUsers';

  const normalizeEmail = (val) => val.trim().toLowerCase();

  const validateEmail = (val) => {
    if (!val.trim()) {
      setEmailError('E-posta adresi gereklidir.');
      return false;
    }
    if (!EMAIL_REGEX.test(val.trim())) {
      setEmailError('Geçerli bir e-posta adresi giriniz.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val) => {
    if (!val) {
      setPasswordError('Şifre gereklidir.');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const normalizedEmail = normalizeEmail(email);

      if (users.length === 0) {
        setLoading(false);
        Alert.alert(
          'Kayıt Bulunamadı',
          'Önce kayıt olmanız gerekiyor. Lütfen yeni bir hesap oluşturun.'
        );
        return;
      }

      const matchedUser = users.find(
        (user) =>
          user.email === normalizedEmail &&
          user.password === password &&
          user.role === role
      );

      if (!matchedUser) {
        setLoading(false);
        Alert.alert(
          'Giriş Hatası',
          'E-posta, şifre veya rol bilgisi yanlış. Lütfen bilgilerinizi kontrol edin.'
        );
        return;
      }

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matchedUser));
      setLoading(false);
      Alert.alert(
        '✅ Giriş Başarılı',
        `Hoş geldin! ${role === 'student' ? 'Öğrenci' : 'Öğretmen'} hesabı ile giriş yapıldı.`,
        [
          {
            text: 'Tamam',
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] }),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Hata',
        'Giriş sırasında bir sorun oluştu. Lütfen tekrar deneyin.'
      );
      console.error(error);
    }
  };

  return (
    <LinearGradient
      colors={['#EEF2FF', '#F5F0FF', '#EDE9FE']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Card */}
            <View style={styles.card}>
              {/* Top border accent */}
              <LinearGradient
                colors={['#6C63FF', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardTopBar}
              />

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Giriş Yap</Text>
                <Text style={styles.subtitle}>
                  YKS yolculuğunda kaldığın yerden devam et!
                </Text>
              </View>

              {/* Rol seçimi */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Giriş Türü</Text>
                <View style={styles.roleButtonRow}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      styles.roleButtonLeft,
                      role === 'student' && styles.roleButtonActive,
                    ]}
                    onPress={() => setRole('student')}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'student' && styles.roleButtonTextActive,
                      ]}
                    >
                      Öğrenci
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'teacher' && styles.roleButtonActive,
                    ]}
                    onPress={() => setRole('teacher')}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'teacher' && styles.roleButtonTextActive,
                      ]}
                    >
                      Öğretmen
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* E-posta */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>E-posta</Text>
                <TextInput
                  style={[
                    styles.input,
                    emailFocused && styles.inputFocused,
                    emailError ? styles.inputError : null,
                  ]}
                  placeholder="ornek@ogrenci.com"
                  placeholderTextColor="#C4C4C4"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => {
                    setEmailFocused(false);
                    validateEmail(email);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {emailError ? (
                  <Text style={styles.errorText}>⚠ {emailError}</Text>
                ) : null}
              </View>

              {/* Şifre */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Şifre</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      passwordFocused && styles.inputFocused,
                      passwordError ? styles.inputError : null,
                    ]}
                    placeholder="••••••••"
                    placeholderTextColor="#C4C4C4"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) validatePassword(text);
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => {
                      setPasswordFocused(false);
                      validatePassword(password);
                    }}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeIcon}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>⚠ {passwordError}</Text>
                ) : null}
              </View>

              {/* Forgot password */}
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() =>
                  Alert.alert(
                    'Şifre Sıfırlama',
                    'E-posta adresinize şifre sıfırlama bağlantısı gönderilecek.',
                    [{ text: 'Tamam' }]
                  )
                }
              >
                <Text style={styles.forgotText}>Şifremi unuttum</Text>
              </TouchableOpacity>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#6C63FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginBtnGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.loginBtnText}>Giriş Yap</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.registerLinkText}>Yeni hesap oluştur</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTopBar: {
    height: 4,
    width: '100%',
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#6C63FF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  fieldGroup: {
    paddingHorizontal: 28,
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },
  inputFocused: {
    borderColor: '#6C63FF',
    backgroundColor: '#FAFAFF',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 28,
    marginTop: 10,
  },
  forgotText: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  loginBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    flex: 1,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  registerLink: {
    paddingVertical: 10,
  },
  registerLinkText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  roleButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  roleButtonLeft: {
    marginRight: 10,
  },
  roleButtonActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
});
