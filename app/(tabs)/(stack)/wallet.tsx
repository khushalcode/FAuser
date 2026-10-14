import React from 'react';
import {
  View, Text, FlatList, Pressable, TextInput, Alert, ActivityIndicator, Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, Gift } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { useUserStore } from '@/store/user';
import type { WalletTransaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { hapticNotify } from '@/utils/platform';

export default function WalletScreen() {
  const router = useRouter();
  const balance = useUserStore((s) => s.walletBalance);
  const transactions = useUserStore((s) => s.walletTransactions);
  const addMoney = useUserStore((s) => s.addMoney);
  const loadWallet = useUserStore((s) => s.loadWallet);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [amount, setAmount] = React.useState('');

  React.useEffect(() => {
    (async () => {
      await loadWallet();
      setLoading(false);
    })();
  }, []);

  const onAddMoney = async () => {
    const amt = parseInt(amount, 10);
    if (!amt || amt < 50) {
      Alert.alert('Invalid amount', 'Minimum top-up is ₹50.');
      return;
    }
    await addMoney(amt);
    hapticNotify('success');
    setShowAdd(false);
    setAmount('');
    Alert.alert('Success', `₹${amt} added to your wallet.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3">
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <Text className="text-textmain text-[22px] font-extrabold tracking-tight">My Wallet</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Balance card */}
        <View className="px-5">
          <View
            className="rounded-2xl p-5"
            style={{ backgroundColor: colors.primary, elevation: 6, shadowColor: '#12B76A', shadowOpacity: 0.3, shadowRadius: 12 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <Wallet size={18} color="#fff" />
                </View>
                <Text className="text-white/85 text-xs ml-2">Available Balance</Text>
              </View>
              <TrendingUp size={16} color="rgba(255,255,255,0.8)" />
            </View>
            <Text className="text-white text-3xl font-bold mt-3">{formatCurrency(balance)}</Text>
            <Text className="text-white/70 text-xs mt-1">Food Munch Wallet • Aarav Sharma</Text>

            <View className="flex-row mt-4">
              <Pressable
                onPress={() => setShowAdd(true)}
                className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl mr-2"
                style={{ backgroundColor: '#fff' }}
              >
                <Plus size={14} color={colors.primary} />
                <Text className="text-primary font-semibold text-sm ml-1.5">Add Money</Text>
              </Pressable>
              <Pressable
                className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Gift size={14} color="#fff" />
                <Text className="text-white font-semibold text-sm ml-1.5">Refer & Earn</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Quick add chips */}
        <View className="px-5 mt-4 flex-row justify-between">
          {[100, 200, 500, 1000].map((a) => (
            <Pressable
              key={a}
              onPress={() => { setAmount(String(a)); setShowAdd(true); }}
              className="flex-1 py-2.5 rounded-xl items-center mr-2 border border-line"
              style={{ backgroundColor: '#fff' }}
            >
              <Text className="text-textmain text-xs font-semibold">+{formatCurrency(a, false)}</Text>
            </Pressable>
          ))}
        </View>

        {/* Transactions */}
        <View className="px-5 mt-6">
          <Text className="text-textmain text-sm font-bold mb-3">Transaction History</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : transactions.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-3xl">📊</Text>
              <Text className="text-textmain font-semibold text-sm mt-2">No transactions yet</Text>
              <Text className="text-muted text-xs">Add money to start using your wallet.</Text>
            </View>
          ) : (
            <View className="bg-white rounded-xl2 border border-line overflow-hidden">
              {transactions.map((tx, idx) => {
                const isCredit = tx.type === 'credit';
                return (
                  <View key={tx.id}>
                    {idx > 0 && <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 60 }} />}
                    <View className="flex-row items-center px-3.5 py-3">
                      <View
                        className="w-9 h-9 rounded-xl items-center justify-center"
                        style={{ backgroundColor: isCredit ? colors.successLight : colors.errorLight }}
                      >
                        {isCredit ? <ArrowDownLeft size={16} color={colors.success} /> : <ArrowUpRight size={16} color={colors.error} />}
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-textmain text-sm font-medium" numberOfLines={1}>{tx.description}</Text>
                        <Text className="text-muted text-[11px] mt-0.5">{formatDate(tx.created_at, true)}</Text>
                      </View>
                      <Text
                        className="text-sm font-bold"
                        style={{ color: isCredit ? colors.success : colors.error }}
                      >
                        {isCredit ? '+' : '−'} {formatCurrency(tx.amount)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add money modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
            <View className="w-10 h-1 rounded-full self-center mb-4" style={{ backgroundColor: colors.border }} />
            <Text className="text-textmain text-lg font-bold">Add Money to Wallet</Text>
            <Text className="text-muted text-xs mt-1">Top-up your wallet to pay for orders faster.</Text>

            <View className="mt-4 flex-row items-center bg-surface rounded-xl2 px-3.5 py-3 border border-line">
              <Text className="text-textmain text-lg font-bold">₹</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                autoFocus
                className="flex-1 ml-2 text-textmain text-lg font-bold"
              />
            </View>

            <View className="flex-row mt-3 justify-between">
              {[100, 200, 500, 1000].map((a) => (
                <Pressable
                  key={a}
                  onPress={() => setAmount(String(a))}
                  className="py-2 px-3 rounded-md border border-line"
                >
                  <Text className="text-textmain text-xs font-semibold">+{a}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={onAddMoney}
              className="mt-5 rounded-xl2 py-3.5 items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold text-base">Add Money</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowAdd(false)}
              className="mt-2 py-2 items-center"
            >
              <Text className="text-muted text-sm">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
