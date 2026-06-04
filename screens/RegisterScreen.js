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

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Focus states
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);

  // Error states
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const USERS_KEY = 'registeredUsers';

  const normalizeEmail = (val) => val.trim().toLowerCase();

  const validateUsername = (val) => {
    if (!val.trim()) {
      setUsernameError('Kullanıcı adı gereklidir.');
      return false;
    }
    if (val.trim().length < 3) {
      setUsernameError('Kullanıcı adı en az 3 karakter olmalıdır.');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(val.trim())) {
      setUsernameError('Sadece harf, rakam ve alt çizgi kullanılabilir.');
      return false;
    }
    setUsernameError('');
    return true;
  };

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

  const handleRegister = async () => {
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid) return;

    setLoading(true);
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const normalizedEmail = normalizeEmail(email);

      const existingUser = users.find((user) => user.email === normalizedEmail);
      if (existingUser) {
        setLoading(false);
        Alert.alert(
          'Kayıt Hatası',
          'Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta kullanın.'
        );
        return;
      }

      const newUser = {
        username: username.trim(),
        email: normalizedEmail,
        password,
        role,
        teacherCode: teacherCode.trim() || null,
      };

      await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
      setLoading(false);

      const roleText = role === 'student' ? 'Öğrenci' : 'Öğretmen';
      Alert.alert(
        '🎉 Kayıt Başarılı!',
        `Hoş geldin ${username}! ${roleText} hesabın oluşturuldu.`,
        [
          {
            text: 'Giriş Yap',
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Hata',
        'Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.'
      );
      console.error(error);
    }
  };

  const gradientColors =
    role === 'student'
      ? ['#EEF2FF', '#F5F0FF', '#EDE9FE']
      : ['#FDF4FF', '#FAF0FF', '#F3E8FF'];

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
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
              {/* Top gradient bar */}
              <LinearGradient
                colors={
                  role === 'student'
                    ? ['#6C63FF', '#A855F7']
                    : ['#A855F7', '#EC4899']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardTopBar}
              />

              {/* Header */}
              <View style={styles.header}>
                <Text
                  style={[
                    styles.title,
                    role === 'teacher' && styles.titleTeacher,
                  ]}
                >
                  Aramıza Katıl
                </Text>
                <Text style={styles.subtitle}>
                  YKS hedeflerine ulaşmak için ilk adımı at.
                </Text>
              </View>

              {/* Role Toggle */}
              <View style={styles.toggleContainer}>
                <View style={styles.toggleWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      role === 'student' && styles.toggleBtnActive,
                    ]}
                    onPress={() => setRole('student')}
                    activeOpacity={0.8}
                  >
                    {role === 'student' && (
                      <LinearGradient
                        colors={['#EEF2FF', '#E0E7FF']}
                        style={StyleSheet.absoluteFill}
                        borderRadius={10}
                      />
                    )}
                    <Text style={styles.toggleEmoji}>🧑‍🎓</Text>
                    <Text
                      style={[
                        styles.toggleText,
                        role === 'student' && styles.toggleTextActive,
                      ]}
                    >
                      Öğrenci
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      role === 'teacher' && styles.toggleBtnActiveTeacher,
                    ]}
                    onPress={() => setRole('teacher')}
                    activeOpacity={0.8}
                  >
                    {role === 'teacher' && (
                      <LinearGradient
                        colors={['#FDF4FF', '#FAE8FF']}
                        style={StyleSheet.absoluteFill}
                        borderRadius={10}
                      />
                    )}
                    <Text style={styles.toggleEmoji}>👩‍🏫</Text>
                    <Text
                      style={[
                        styles.toggleText,
                        role === 'teacher' && styles.toggleTextActiveTeacher,
                      ]}
                    >
                      Öğretmen
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Kullanıcı Adı */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Kullanıcı Adı</Text>
                <TextInput
                  style={[
                    styles.input,
                    usernameFocused && styles.inputFocused,
                    usernameError ? styles.inputError : null,
                  ]}
                  placeholder="ornek_kullanici"
                  placeholderTextColor="#C4C4C4"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (usernameError) validateUsername(text);
                  }}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => {
                    setUsernameFocused(false);
                    validateUsername(username);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {usernameError ? (
                  <Text style={styles.errorText}>⚠ {usernameError}</Text>
                ) : null}
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
                    placeholder="En az 6 karakter"
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
                    returnKeyType="next"
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

                {/* Password strength bar */}
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            width: `${Math.min((password.length / 12) * 100, 100)}%`,
                            backgroundColor:
                              password.length < 6
                                ? '#EF4444'
                                : password.length < 9
                                ? '#F59E0B'
                                : '#10B981',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.strengthLabel}>
                      {password.length < 6
                        ? 'Zayıf'
                        : password.length < 9
                        ? 'Orta'
                        : 'Güçlü'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Teacher Code (conditional) */}
              {role === 'teacher' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Öğretmen Katılım Kodu{' '}
                    <Text style={styles.optional}>(isteğe bağlı)</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      codeFocused && styles.inputFocused,
                    ]}
                    placeholder="Örn: a1b2c3d4"
                    placeholderTextColor="#C4C4C4"
                    value={teacherCode}
                    onChangeText={setTeacherCode}
                    onFocus={() => setCodeFocused(true)}
                    onBlur={() => setCodeFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </View>
              )}

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.registerBtn, loading && styles.btnDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={
                      role === 'student'
                        ? ['#6C63FF', '#A855F7']
                        : ['#A855F7', '#EC4899']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.registerBtnGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.registerBtnText}>Kayıt Ol</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginLinkText}>Zaten hesabım var</Text>
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
    shadowColor: '#A855F7',
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
    paddingTop: 28,
    paddingBottom: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#6C63FF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  titleTeacher: {
    color: '#A855F7',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Role Toggle
  toggleContainer: {
    paddingHorizontal: 28,
    marginTop: 20,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    overflow: 'hidden',
  },
  toggleBtnActive: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  toggleBtnActiveTeacher: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  toggleEmoji: {
    fontSize: 18,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  toggleTextActive: {
    color: '#4F46E5',
  },
  toggleTextActiveTeacher: {
    color: '#9333EA',
  },

  // Fields
  fieldGroup: {
    paddingHorizontal: 28,
    marginTop: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  optional: {
    fontWeight: '400',
    color: '#9CA3AF',
    fontSize: 13,
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
    borderColor: '#A855F7',
    backgroundColor: '#FDFAFF',
    shadowColor: '#A855F7',
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

  // Password strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    width: 36,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  registerBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    flex: 1,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  registerBtnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginLink: {
    paddingVertical: 10,
  },
  loginLinkText: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '600',
  },
});
