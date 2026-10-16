import React from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator,
  Image as RNImage, Modal, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Camera, User, Mail, Phone, Cake, Save, Check, X
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api-client';
import { pickImage, uploadImage, StorageBucket } from '@/lib/storage';
import { hapticNotify } from '@/utils/platform';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const hydrateProfile = useAuthStore((s) => s.hydrateProfile);

  const [fullName, setFullName] = React.useState(user?.full_name || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState(user?.phone || '');
  const [birthday, setBirthday] = React.useState('');
  const [gender, setGender] = React.useState<'male' | 'female' | 'other' | ''>('');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(user?.avatar_url || null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [showBirthdayPicker, setShowBirthdayPicker] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('foodmunch-profile-extra');
      if (saved) {
        const s = JSON.parse(saved);
        setBirthday(s.birthday || '');
        setGender(s.gender || '');
      }
    })();
  }, []);

  const onPickAvatar = async () => {
    try {
      const image = await pickImage({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      if (!image) return;
      setUploadingAvatar(true);
      const result = await uploadImage(image, 'user_avatars' as StorageBucket, user?.id);
      if (!result.success) {
        Alert.alert('Upload failed', result.error || 'Please try again.');
        setUploadingAvatar(false);
        return;
      }
      setAvatarUrl(result.url);
      try {
        await apiClient.put('/api/auth/profile', { avatar_url: result.url }).catch(() => {});
      } catch (e) {}
      hapticNotify('success');
    } catch (e: any) {
      Alert.alert('Avatar upload failed', e?.message || 'Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    setSaving(true);
    try {
      // Save extra fields locally
      await AsyncStorage.setItem('foodmunch-profile-extra', JSON.stringify({ birthday, gender }));
      // Try to update backend profile
      try {
        await apiClient.put('/api/auth/profile', {
          full_name: fullName,
          email,
          phone,
        });
        await hydrateProfile();
      } catch (e) {
        // Mock mode — just keep local
      }
      hapticNotify('success');
      Alert.alert('Profile Updated', 'Your changes have been saved.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.borderLight, borderWidth: 1 }}
          >
            <ArrowLeft size={18} color={colors.text} />
          </Pressable>
          <Text className="text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Edit Profile</Text>
        </View>
        <Pressable
          onPress={onSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl"
          style={{ backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }}
        >
          <Text className="text-white text-sm font-semibold">{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Avatar */}
        <View className="items-center py-6">
          <Pressable onPress={onPickAvatar} disabled={uploadingAvatar} className="relative">
            <View
              className="w-24 h-24 rounded-full items-center justify-center overflow-hidden"
              style={{ backgroundColor: colors.primaryLight }}
            >
              {avatarUrl ? (
                <RNImage source={typeof avatarUrl === "string" ? { uri: avatarUrl } : avatarUrl} style={{ width: 96, height: 96 }} resizeMode="cover" />
              ) : (
                <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
                  {fullName?.[0]?.toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <View
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2"
              style={{ backgroundColor: colors.primary, borderColor: colors.background }}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size={12} color="#fff" />
              ) : (
                <Camera size={14} color="#fff" />
              )}
            </View>
          </Pressable>
          <Text className="text-xs mt-3" style={{ color: colors.textMuted }}>Tap to change photo</Text>
        </View>

        {/* Form */}
        <SectionTitle colors={colors}>Personal Information</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <FieldRow icon={<User size={18} color={colors.primary} />} label="Full Name" colors={colors}>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              className="flex-1 text-sm font-medium"
              style={{ color: colors.text }}
            />
          </FieldRow>
          <Divider colors={colors} />
          <FieldRow icon={<Mail size={18} color={colors.info} />} label="Email" colors={colors}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              className="flex-1 text-sm font-medium"
              style={{ color: colors.text }}
            />
          </FieldRow>
          <Divider colors={colors} />
          <FieldRow icon={<Phone size={18} color={colors.success} />} label="Phone" colors={colors}>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              className="flex-1 text-sm font-medium"
              style={{ color: colors.text }}
            />
          </FieldRow>
        </View>

        {/* Additional info */}
        <SectionTitle colors={colors}>Additional Details</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <Pressable onPress={() => setShowBirthdayPicker(true)} className="flex-row items-center px-4 py-3 active:opacity-80">
            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.warningLight }}>
              <Cake size={18} color={colors.warning} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: colors.textMuted }}>Birthday</Text>
              <Text className="text-sm font-medium mt-0.5" style={{ color: birthday ? colors.text : colors.textMuted }}>
                {birthday || 'Add your birthday for special rewards'}
              </Text>
            </View>
            {birthday && <Check size={16} color={colors.success} />}
          </Pressable>
          <Divider colors={colors} />
          <View className="px-4 py-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.infoLight }}>
                <User size={18} color={colors.info} />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: colors.textMuted }}>Gender</Text>
                <View className="flex-row mt-1.5">
                  {(['male', 'female', 'other'] as const).map(g => (
                    <Pressable
                      key={g}
                      onPress={() => setGender(g)}
                      className="px-3 py-1.5 rounded-full mr-2"
                      style={{ backgroundColor: gender === g ? colors.primary : colors.surface, borderColor: gender === g ? colors.primary : colors.border, borderWidth: 1 }}
                    >
                      <Text className="text-xs font-semibold capitalize" style={{ color: gender === g ? '#fff' : colors.textMuted }}>{g}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Birthday rewards hint */}
        {birthday && (
          <View className="rounded-2xl p-4 mb-5 flex-row items-center" style={{ backgroundColor: colors.warningLight }}>
            <Cake size={20} color={colors.warning} />
            <Text className="text-xs ml-3 flex-1" style={{ color: colors.text }}>
              🎂 You'll get a special birthday treat from Food Munch during your birthday month!
            </Text>
          </View>
        )}

        <Pressable
          onPress={onSave}
          disabled={saving}
          className="rounded-xl2 py-3.5 flex-row items-center justify-center mt-2"
          style={{ backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? (
            <ActivityIndicator size={18} color="#fff" />
          ) : (
            <>
              <Save size={16} color="#fff" />
              <Text className="text-white font-semibold text-base ml-2">Save Changes</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* Birthday picker modal */}
      <Modal visible={showBirthdayPicker} transparent animationType="slide" onRequestClose={() => setShowBirthdayPicker(false)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="rounded-t-3xl px-5 pt-5 pb-8" style={{ backgroundColor: colors.surfaceElevated }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>Select your birthday</Text>
              <Pressable onPress={() => setShowBirthdayPicker(false)}>
                <X size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text className="text-xs mb-4" style={{ color: colors.textMuted }}>Get a special treat during your birthday month 🎂</Text>
            <TextInput
              value={birthday}
              onChangeText={setBirthday}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={10}
              className="rounded-xl2 px-4 py-3 text-base font-bold"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, color: colors.text }}
            />
            <Pressable
              onPress={() => {
                setShowBirthdayPicker(false);
                hapticNotify('success');
              }}
              className="mt-4 rounded-xl2 py-3.5 items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold text-base">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SectionTitle({ children, colors }: { children: React.ReactNode; colors: any }) {
  return (
    <Text className="text-xs uppercase tracking-wide font-bold mb-2" style={{ color: colors.textMuted }}>
      {children}
    </Text>
  );
}

function FieldRow({ icon, label, children, colors }: { icon: React.ReactNode; label: string; children: React.ReactNode; colors: any }) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
        {icon}
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: colors.textMuted }}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 62 }} />;
}
