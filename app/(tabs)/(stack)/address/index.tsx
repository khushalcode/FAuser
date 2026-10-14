import React from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Plus, Home, Briefcase, MapPinned, Trash2, Edit3 } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { useUserStore } from '@/store/user';
import type { CustomerAddress } from '@/lib/types';
import { truncate } from '@/utils/format';

export default function AddressListScreen() {
  const router = useRouter();
  const addresses = useUserStore((s) => s.addresses);
  const selectedAddressId = useUserStore((s) => s.selectedAddressId);
  const setSelectedAddress = useUserStore((s) => s.setSelectedAddress);
  const deleteAddress = useUserStore((s) => s.deleteAddress);
  const loadAddresses = useUserStore((s) => s.loadAddresses);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      await loadAddresses();
      setLoading(false);
    })();
  }, []);

  const onDelete = (addr: CustomerAddress) => {
    Alert.alert('Delete address?', `Remove "${addr.label}" — ${addr.line1}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAddress(addr.id) }
    ]);
  };

  const iconFor = (label: string) => {
    if (label === 'Home') return <Home size={18} color={colors.primary} />;
    if (label === 'Work') return <Briefcase size={18} color={colors.info} />;
    return <MapPinned size={18} color={colors.warning} />;
  };
  const bgFor = (label: string) => {
    if (label === 'Home') return colors.primaryLight;
    if (label === 'Work') return colors.infoLight;
    return colors.warningLight;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3">
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <Text className="text-textmain text-[22px] font-extrabold tracking-tight">Saved Addresses</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedAddressId;
            return (
              <Pressable
                onPress={() => { setSelectedAddress(item.id); router.back(); }}
                className="bg-white rounded-xl2 border p-4 active:opacity-80"
                style={{ borderColor: isSelected ? colors.primary : colors.border, borderWidth: isSelected ? 1.5 : 1 }}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: bgFor(item.label) }}>
                    {iconFor(item.label)}
                  </View>
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center">
                      <Text className="text-textmain font-semibold text-sm">{item.label}</Text>
                      {item.is_default && (
                        <View className="ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.primaryLight }}>
                          <Text className="text-primary text-[9px] font-bold uppercase">Default</Text>
                        </View>
                      )}
                      {isSelected && (
                        <View className="ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.primary }}>
                          <Text className="text-white text-[9px] font-bold uppercase">Selected</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-muted text-xs mt-0.5" numberOfLines={2}>
                      {item.line1}, {item.line2 ? item.line2 + ', ' : ''}{item.city} - {item.pincode}
                    </Text>
                    <Text className="text-muted text-[11px] mt-0.5">{item.full_name} • {item.phone}</Text>
                  </View>
                </View>
                <View className="flex-row justify-end mt-3">
                  <Pressable className="flex-row items-center px-3 py-1.5 rounded-md mr-2 border border-line">
                    <Edit3 size={12} color={colors.textMuted} />
                    <Text className="text-muted text-xs ml-1">Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => onDelete(item)} className="flex-row items-center px-3 py-1.5 rounded-md border" style={{ borderColor: colors.errorLight }}>
                    <Trash2 size={12} color={colors.error} />
                    <Text className="text-error text-xs ml-1">Delete</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: colors.surfaceAlt }}>
                <MapPin size={36} color={colors.textMuted} />
              </View>
              <Text className="text-textmain font-bold text-sm mt-3">No saved addresses</Text>
              <Text className="text-muted text-xs mt-1">Add your first delivery address to get started.</Text>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => router.push('/address/add')}
        className="absolute bottom-5 right-5 w-14 h-14 rounded-full items-center justify-center active:opacity-80"
        style={{ backgroundColor: colors.primary, elevation: 6, shadowColor: '#12B76A', shadowOpacity: 0.3, shadowRadius: 10 }}
      >
        <Plus size={24} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}
