import React from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator,
  StyleSheet, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Home, Briefcase, MapPinned, Locate, CheckCircle2, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';
import { colors } from '@/theme/colors';
import { useUserStore } from '@/store/user';
import { hapticNotify } from '@/utils/platform';
import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY =
  (Constants.expoConfig as any)?.extra?.googleMapsApiKey ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  '';

// react-native-maps is a native module — lazy-load with graceful fallback.
let MapView: any = null;
let Marker: any = null;
let Circle: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Circle = maps.Circle;
} catch (e) {
  // Maps not installed (preview without native deps).
}

type Label = 'Home' | 'Work' | 'Other';

const DEFAULT_REGION = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04
};

export default function AddAddressScreen() {
  const router = useRouter();
  const addAddress = useUserStore((s) => s.addAddress);

  const [label, setLabel] = React.useState<Label>('Home');
  const [fullName, setFullName] = React.useState('Aarav Sharma');
  const [phone, setPhone] = React.useState('+91 9800000000');
  const [line1, setLine1] = React.useState('');
  const [line2, setLine2] = React.useState('');
  const [city, setCity] = React.useState('Bangalore');
  const [state, setState] = React.useState('Karnataka');
  const [pincode, setPincode] = React.useState('');
  const [isDefault, setIsDefault] = React.useState(false);
  const [coords, setCoords] = React.useState<{ lat?: number; lng?: number }>({});
  const [locating, setLocating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [geocoding, setGeocoding] = React.useState(false);

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to fetch your current location.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      // Reverse geocode for the address
      const geo = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geo.length > 0) {
        const g = geo[0];
        setLine1(g.street ? `${g.street}${g.name ? ', ' + g.name : ''}` : g.name || '');
        setLine2(g.district || g.subregion || '');
        setCity(g.city || g.region || 'Bangalore');
        setState(g.region || 'Karnataka');
        setPincode(g.postalCode || '');
      }
    } catch (e: any) {
      Alert.alert('Location error', e?.message || 'Could not fetch location. Please enter manually.');
    } finally {
      setLocating(false);
    }
  };

  /** Reverse-geocode when the user drags the map marker. */
  const reverseGeocodeFromCoords = async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geo.length > 0) {
        const g = geo[0];
        setLine1(g.street ? `${g.street}${g.name ? ', ' + g.name : ''}` : g.name || '');
        setLine2(g.district || g.subregion || '');
        setCity(g.city || g.region || 'Bangalore');
        setState(g.region || 'Karnataka');
        setPincode(g.postalCode || '');
      }
    } catch (e: any) {
      // Fallback to Google reverse-geocoding API
      if (GOOGLE_MAPS_API_KEY) {
        try {
          const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`);
          const data = await r.json();
          if (data?.results?.[0]) {
            const comp = data.results[0].address_components || [];
            const get = (t: string) => comp.find((c: any) => c.types.includes(t))?.long_name || '';
            setLine1(data.results[0].formatted_address || '');
            setPincode(get('postal_code') || '');
            setCity(get('locality') || get('administrative_area_level_2') || 'Bangalore');
            setState(get('administrative_area_level_1') || 'Karnataka');
          }
        } catch {}
      }
    } finally {
      setGeocoding(false);
    }
  };

  /** Forward-geocode when the user types a pincode — drop the marker on the map. */
  const forwardGeocodePincode = async (pin: string) => {
    if (pin.length !== 6 || !GOOGLE_MAPS_API_KEY) return;
    try {
      const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${pin}+India&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await r.json();
      if (data?.results?.[0]?.geometry?.location) {
        const loc = data.results[0].geometry.location;
        setCoords({ lat: loc.lat, lng: loc.lng });
      }
    } catch {}
  };

  const onSave = async () => {
    if (!fullName || !phone || !line1 || !city || !pincode) {
      Alert.alert('Missing fields', 'Please fill in name, phone, address line 1, city and pincode.');
      return;
    }
    if (pincode.length !== 6) {
      Alert.alert('Invalid pincode', 'Pincode must be 6 digits.');
      return;
    }
    setSaving(true);
    try {
      await addAddress({
        label,
        full_name: fullName,
        phone,
        line1,
        line2: line2 || undefined,
        city,
        state,
        pincode,
        latitude: coords.lat,
        longitude: coords.lng,
        is_default: isDefault
      });
      hapticNotify('success');
      router.back();
    } catch (e: any) {
      Alert.alert('Failed', e?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3">
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <Text className="text-textmain text-[22px] font-extrabold tracking-tight">Add New Address</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        {/* Map */}
        <View className="rounded-xl2 overflow-hidden border border-line mb-4" style={{ height: 220 }}>
          {MapView ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={
                coords.lat && coords.lng
                  ? { latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }
                  : DEFAULT_REGION
              }
              region={
                coords.lat && coords.lng
                  ? { latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }
                  : undefined
              }
              onPoisClick={() => {}}
              showsUserLocation
              onPress={(e: any) => {
                const c = e?.nativeEvent?.coordinate;
                if (c) {
                  setCoords({ lat: c.latitude, lng: c.longitude });
                  reverseGeocodeFromCoords(c.latitude, c.longitude);
                }
              }}
            >
              {coords.lat && coords.lng && (
                <>
                  <Marker coordinate={{ latitude: coords.lat, longitude: coords.lng }} draggable
                    onDragEnd={(e: any) => {
                      const c = e?.nativeEvent?.coordinate;
                      if (c) {
                        setCoords({ lat: c.latitude, lng: c.longitude });
                        reverseGeocodeFromCoords(c.latitude, c.longitude);
                      }
                    }}
                  >
                    <View style={mapStyles.marker}>
                      <MapPin size={18} color="#fff" />
                    </View>
                  </Marker>
                  <Circle
                    center={{ latitude: coords.lat, longitude: coords.lng }}
                    radius={300}
                    strokeColor={colors.primary}
                    fillColor={colors.primary + '20'}
                  />
                </>
              )}
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.surface }}>
              <MapPin size={36} color={colors.primary} />
              <Text className="text-muted text-xs mt-2">
                {coords.lat ? `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng?.toFixed(4)}` : 'Map available in APK build'}
              </Text>
            </View>
          )}

          {/* Floating "use current location" button */}
          <Pressable
            onPress={useCurrentLocation}
            disabled={locating}
            style={mapStyles.fab}
          >
            {locating ? (
              <ActivityIndicator color="#fff" size={14} />
            ) : (
              <Locate size={16} color="#fff" />
            )}
            <Text className="text-white text-[11px] font-semibold ml-1.5">
              {locating ? 'Locating…' : 'Use current location'}
            </Text>
          </Pressable>

          {/* Geocoding indicator */}
          {geocoding && (
            <View style={mapStyles.geoChip}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="text-muted text-[11px] ml-1.5">Updating address…</Text>
            </View>
          )}
        </View>

        {/* Label */}
        <Text className="text-textmain text-sm font-medium mb-1.5">Save as</Text>
        <View className="flex-row mb-4">
          {(['Home', 'Work', 'Other'] as Label[]).map((l) => {
            const Icon = l === 'Home' ? Home : l === 'Work' ? Briefcase : MapPinned;
            const isActive = label === l;
            return (
              <Pressable
                key={l}
                onPress={() => setLabel(l)}
                className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl mr-2 border"
                style={{
                  backgroundColor: isActive ? colors.primaryLight : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border
                }}
              >
                <Icon size={13} color={isActive ? colors.primary : colors.textMuted} />
                <Text className="ml-1.5 text-xs font-semibold" style={{ color: isActive ? colors.primary : colors.textMuted }}>
                  {l}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Field label="Full Name">
          <TextInput value={fullName} onChangeText={setFullName} placeholder="Recipient name" placeholderTextColor={colors.textMuted} className="flex-1 ml-2.5 text-sm text-textmain" />
        </Field>

        <Field label="Phone Number">
          <TextInput value={phone} onChangeText={setPhone} placeholder="+91 98000 00000" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" className="flex-1 ml-2.5 text-sm text-textmain" />
        </Field>

        <Field label="Address Line 1 (House / Flat)">
          <TextInput value={line1} onChangeText={setLine1} placeholder="Flat 402, Prestige Towers" placeholderTextColor={colors.textMuted} className="flex-1 ml-2.5 text-sm text-textmain" />
        </Field>

        <Field label="Address Line 2 (Street / Area)" optional>
          <TextInput value={line2} onChangeText={setLine2} placeholder="MG Road" placeholderTextColor={colors.textMuted} className="flex-1 ml-2.5 text-sm text-textmain" />
        </Field>

        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Field label="City">
              <TextInput value={city} onChangeText={setCity} placeholder="Bangalore" placeholderTextColor={colors.textMuted} className="flex-1 ml-2.5 text-sm text-textmain" />
            </Field>
          </View>
          <View className="flex-1 ml-2">
            <Field label="State">
              <TextInput value={state} onChangeText={setState} placeholder="Karnataka" placeholderTextColor={colors.textMuted} className="flex-1 ml-2.5 text-sm text-textmain" />
            </Field>
          </View>
        </View>

        <Field label="Pincode">
          <TextInput
            value={pincode}
            onChangeText={(v) => {
              setPincode(v.replace(/[^0-9]/g, '').slice(0, 6));
              if (v.length === 6) forwardGeocodePincode(v);
            }}
            placeholder="560001"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={6}
            className="flex-1 ml-2.5 text-sm text-textmain"
          />
        </Field>

        <Pressable
          onPress={() => setIsDefault(!isDefault)}
          className="flex-row items-center mt-4 mb-6"
        >
          <View
            className="w-5 h-5 rounded items-center justify-center mr-2.5"
            style={{ backgroundColor: isDefault ? colors.primary : 'transparent', borderWidth: 1.5, borderColor: isDefault ? colors.primary : colors.border }}
          >
            {isDefault && <CheckCircle2 size={13} color="#fff" />}
          </View>
          <Text className="text-textmain text-sm">Set as default address</Text>
        </Pressable>

        <Pressable
          onPress={onSave}
          disabled={saving}
          className="rounded-xl2 py-3.5 items-center active:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Save Address</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="text-textmain text-sm font-medium mb-1.5">
        {label} {optional && <Text className="text-muted text-xs">(optional)</Text>}
      </Text>
      <View className="flex-row items-center bg-surface rounded-xl2 px-3.5 py-3 border border-line">
        {children}
      </View>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff'
  },
  fab: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: colors.primary,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  geoChip: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)'
  }
});
