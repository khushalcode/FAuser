import React from 'react';
import {
  View, Text, FlatList, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Headphones, MessageSquare, Image as ImageIcon, Wifi, X } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { api } from '@/lib/api';
import { subscribeToChatMessages, isSupabaseConfigured } from '@/lib/realtime';
import { pickImage, uploadImage, PickedImage } from '@/lib/storage';
import { useAuthStore } from '@/store/auth';
import type { ChatMessage } from '@/lib/types';
import { formatTime } from '@/utils/format';

export default function ChatScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [live, setLive] = React.useState(false);
  const [pendingImage, setPendingImage] = React.useState<PickedImage | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const listRef = React.useRef<FlatList>(null);

  React.useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      const m = await api.getSupportChat();
      setMessages(m);
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);

      // Subscribe to realtime chat
      if (isSupabaseConfigured) {
        unsub = subscribeToChatMessages('support', (msg) => {
          setMessages((prev) => {
            // Dedup by id+created_at
            if (prev.some((x) => x.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setLive(true);
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
          setTimeout(() => setLive(false), 3000);
        });
      }
    })();
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const onSend = async () => {
    const text = input.trim();
    if (!text && !pendingImage) return;
    setInput('');
    setSending(true);

    try {
      // If there's an image, upload it first
      let attachmentUrl: string | undefined;
      if (pendingImage) {
        setUploading(true);
        const result = await uploadImage(pendingImage, 'chat_attachments', user?.id);
        setUploading(false);
        if (result.success) attachmentUrl = result.url;
        setPendingImage(null);
      }

      // For now we send the text + image URL combined since our API only takes text
      const finalText = attachmentUrl ? `${text}${text ? '\n\n' : ''}[📷 Image] ${attachmentUrl}` : text;
      if (!finalText) return;

      const msg = await api.sendSupportMessage(finalText);
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

      // Auto-reply simulation (only in mock mode; in real mode the support agent
      // responds via the admin panel and the realtime subscription handles it).
      if (!isSupabaseConfigured) {
        setTimeout(async () => {
          const fresh = await api.getSupportChat();
          setMessages(fresh);
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
        }, 1500);
      }
    } catch (e: any) {
      Alert.alert('Send failed', e?.message || 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  const onPickImage = async () => {
    try {
      const picked = await pickImage();
      if (picked) setPendingImage(picked);
    } catch (e: any) {
      Alert.alert('Image picker failed', e?.message || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        {/* Header */}
        <View className="px-5 py-3 flex-row items-center border-b border-line bg-white">
          <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3">
            <ArrowLeft size={18} color={colors.text} />
          </Pressable>
          <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
            <Headphones size={18} color={colors.primary} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-textmain font-semibold text-sm">Food Munch Support</Text>
            <View className="flex-row items-center">
              {isSupabaseConfigured ? (
                <>
                  <Wifi size={9} color={live ? colors.success : colors.textSubtle} />
                  <Text className="text-muted text-[11px] ml-1">
                    {live ? 'Live — syncing' : 'Online • Realtime on'}
                  </Text>
                </>
              ) : (
                <>
                  <View className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: colors.success }} />
                  <Text className="text-muted text-[11px]">Online • Typically replies in 5 min</Text>
                </>
              )}
            </View>
          </View>
          <MessageSquare size={18} color={colors.textMuted} />
        </View>

        {/* Pending image preview */}
        {pendingImage && (
          <View className="px-4 py-2 bg-surface border-b border-line flex-row items-center">
            <Image source={{ uri: pendingImage.uri }} style={{ width: 48, height: 48, borderRadius: 8 }} />
            <Text className="text-muted text-xs ml-3 flex-1" numberOfLines={1}>{pendingImage.name}</Text>
            {uploading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Pressable onPress={() => setPendingImage(null)} className="ml-2">
                <X size={16} color={colors.error} />
              </Pressable>
            )}
          </View>
        )}

        {/* Messages */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => {
              const isMe = item.sender === 'me';
              const isImage = item.text.startsWith('[📷 Image]');
              return (
                <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <View
                    className={`max-w-[78%] rounded-xl2 px-3.5 py-2.5`}
                    style={{
                      backgroundColor: isMe ? colors.primary : '#fff',
                      borderWidth: isMe ? 0 : 1,
                      borderColor: colors.border,
                      borderBottomRightRadius: isMe ? 4 : 14,
                      borderBottomLeftRadius: isMe ? 14 : 4
                    }}
                  >
                    {isImage && (() => {
                      const match = item.text.match(/(http[^\s]+)/);
                      if (match) {
                        return (
                          <View>
                            <Image
                              source={{ uri: match[1] }}
                              style={{ width: 200, height: 200, borderRadius: 8, marginBottom: 4 }}
                              resizeMode="cover"
                            />
                          </View>
                        );
                      }
                      return null;
                    })()}
                    <Text
                      className="text-sm"
                      style={{ color: isMe ? '#fff' : colors.text }}
                    >
                      {isImage ? item.text.replace(/\[📷 Image\]\s*http[^\s]+/, '📷 Photo').trim() : item.text}
                    </Text>
                    <Text
                      className="text-[10px] mt-1"
                      style={{ color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSubtle }}
                    >
                      {formatTime(item.created_at)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input */}
        <View className="flex-row items-center px-4 py-3 border-t border-line bg-white">
          <Pressable
            onPress={onPickImage}
            disabled={sending || uploading}
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: colors.surfaceAlt }}
          >
            <ImageIcon size={16} color={colors.textMuted} />
          </Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            className="flex-1 bg-surface rounded-full px-4 py-2.5 text-sm text-textmain border border-line"
            multiline
          />
          <Pressable
            onPress={onSend}
            disabled={(!input.trim() && !pendingImage) || sending}
            className="w-10 h-10 rounded-full items-center justify-center ml-2"
            style={{ backgroundColor: (input.trim() || pendingImage) && !sending ? colors.primary : colors.border }}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Send size={16} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
