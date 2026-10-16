import React from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, Alert, Linking, LayoutAnimation, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Search, ChevronDown, ChevronUp, MessageSquare, Phone, Mail,
  HelpCircle, Package, CreditCard, MapPin, Gift, Shield, Truck, RefreshCcw
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  // Orders
  { id: '1', category: 'Orders', question: 'How can I track my order?',
    answer: 'Once your order is confirmed, go to the Orders tab and tap on your active order. You\'ll see a live map with the delivery partner\'s location and real-time status updates (Confirmed → Preparing → Picked Up → On the Way → Delivered). You can also call or chat with your delivery partner directly from the order screen.' },
  { id: '2', category: 'Orders', question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel an order before it is picked up by the delivery partner. Go to the order detail screen and tap "Cancel Order". If the order has already been picked up, please contact support immediately. Refunds for cancelled orders are processed to your original payment method within 5-7 business days, or instantly to your Food Munch wallet.' },
  { id: '3', category: 'Orders', question: 'How do I reorder a previous order?',
    answer: 'Go to the Orders tab, switch to "Past" orders, find the order you want to repeat, and tap the "Reorder" button. All items will be added to your cart. If items from a different store are already in your cart, you\'ll be asked to clear the cart first.' },
  { id: '4', category: 'Orders', question: 'What if an item is missing or incorrect?',
    answer: 'We\'re sorry! Please go to the order detail screen, tap "Report an Issue" and select the affected items. You can request a refund or replacement. Most issues are resolved within 2 hours. You can also chat with support 24/7.' },

  // Delivery
  { id: '5', category: 'Delivery', question: 'What are your delivery hours?',
    answer: 'Food Munch delivers from 6 AM to 11 PM, 7 days a week. Grocery orders placed before 10 PM are delivered the same day. Some stores may have different operating hours — you\'ll see the delivery time for each store on its page.' },
  { id: '6', category: 'Delivery', question: 'Is delivery free?',
    answer: 'Delivery is ₹30 for orders below ₹499. Orders above ₹499 get FREE delivery. Food Munch Gold members get free delivery on all orders. Look for the "FREE DELIVERY" ribbon on store cards.' },
  { id: '7', category: 'Delivery', question: 'Do you deliver to my area?',
    answer: 'We currently serve 14+ cities across India. Enter your pincode on the home screen to check serviceability. We\'re expanding fast — if we\'re not in your area yet, we\'ll notify you when we launch.' },
  { id: '8', category: 'Delivery', question: 'Can I schedule a delivery for later?',
    answer: 'Yes! At checkout, choose "Schedule for Later" and pick a time slot. Scheduled delivery is available in 1-hour slots from 7 AM to 10 PM, up to 7 days in advance.' },

  // Payments
  { id: '9', category: 'Payments', question: 'What payment methods do you accept?',
    answer: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking, Food Munch Wallet, and Cash on Delivery. Online payments are secured by Razorpay.' },
  { id: '10', category: 'Payments', question: 'How do refunds work?',
    answer: 'Refunds are processed instantly to your Food Munch wallet. If you prefer a refund to your original payment method, it takes 5-7 business days for cards/UPI and 7-10 days for net banking. You can choose your preferred refund method while raising the request.' },
  { id: '11', category: 'Payments', question: 'Is it safe to save my card?',
    answer: 'Yes. Card details are tokenized and stored securely by our PCI-DSS compliant payment partner Razorpay. Food Munch never stores your full card number or CVV. You can manage or delete saved cards anytime from the privacy settings.' },

  // Account
  { id: '12', category: 'Account', question: 'How do I change my delivery address?',
    answer: 'Go to Profile → Saved Addresses. You can add a new address, edit existing ones, set a default, or delete an address. You can also choose a different address at checkout time.' },
  { id: '13', category: 'Account', question: 'How do I delete my account?',
    answer: 'Go to Profile → Privacy & Security → Delete Account. For your safety, account deletion is handled by our support team. Please email privacy@foodmunch.app from your registered email. Your data will be permanently removed within 30 days.' },
  { id: '14', category: 'Account', question: 'How do Refer & Earn rewards work?',
    answer: 'Share your referral code with friends. When they sign up and place their first order (min ₹199), you both get ₹100 — your friend gets ₹100 off, and you get ₹100 in your wallet. Go to Profile → Refer & Earn to see your referrals and earnings.' },

  // Rewards
  { id: '15', category: 'Rewards', question: 'What is Food Munch Gold?',
    answer: 'Food Munch Gold is our loyalty program with 3 tiers: Silver, Gold, and Platinum. Earn points on every order (1 point per ₹10 spent). Gold members get free delivery, exclusive offers, priority support, and birthday rewards. Track your tier progress on the Profile screen.' },
  { id: '16', category: 'Rewards', question: 'How do I use my wallet balance?',
    answer: 'Your wallet balance can be used at checkout. Select "Wallet" as the payment method. If your wallet balance is insufficient, you can combine it with another payment method. Wallet cashback from offers is credited within 24 hours of order delivery.' },
];

const CATEGORIES = ['All', 'Orders', 'Delivery', 'Payments', 'Account', 'Rewards'];

export default function HelpFAQScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return FAQS.filter(f => {
      const matchCat = activeCategory === 'All' || f.category === activeCategory;
      const matchSearch = !search ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.borderLight, borderWidth: 1 }}
        >
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <Text className="text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Hero */}
        <View className="rounded-2xl p-4 mb-5 flex-row items-center" style={{ backgroundColor: colors.primaryLight }}>
          <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <HelpCircle size={20} color="#fff" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-sm font-bold" style={{ color: colors.text }}>How can we help you?</Text>
            <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>Search our FAQ or contact support 24/7</Text>
          </View>
        </View>

        {/* Contact options */}
        <View className="flex-row mb-5">
          <Pressable
            onPress={() => router.push('/chat')}
            className="flex-1 rounded-xl p-3 items-center mr-2"
            style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: colors.primaryLight }}>
              <MessageSquare size={18} color={colors.primary} />
            </View>
            <Text className="text-xs font-semibold" style={{ color: colors.text }}>Live Chat</Text>
            <Text className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>24/7 support</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('tel:18001234567')}
            className="flex-1 rounded-xl p-3 items-center mx-1"
            style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: colors.successLight }}>
              <Phone size={18} color={colors.success} />
            </View>
            <Text className="text-xs font-semibold" style={{ color: colors.text }}>Call Us</Text>
            <Text className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>1800-123-4567</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('mailto:support@foodmunch.app')}
            className="flex-1 rounded-xl p-3 items-center ml-2"
            style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: colors.infoLight }}>
              <Mail size={18} color={colors.info} />
            </View>
            <Text className="text-xs font-semibold" style={{ color: colors.text }}>Email</Text>
            <Text className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>Reply in 24h</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View className="flex-row items-center rounded-xl2 px-3.5 py-2.5 mb-4" style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for help..."
            placeholderTextColor={colors.textMuted}
            className="flex-1 ml-2 text-sm"
            style={{ color: colors.text }}
          />
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ paddingRight: 10 }}>
          {CATEGORIES.map(c => (
            <Pressable
              key={c}
              onPress={() => setActiveCategory(c)}
              className="px-4 py-2 rounded-full mr-2"
              style={{ backgroundColor: activeCategory === c ? colors.primary : colors.surface, borderColor: activeCategory === c ? colors.primary : colors.border, borderWidth: 1 }}
            >
              <Text className="text-xs font-semibold" style={{ color: activeCategory === c ? '#fff' : colors.textMuted }}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* FAQ list */}
        <SectionTitle colors={colors}>Frequently Asked Questions</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          {filtered.length === 0 ? (
            <View className="items-center py-8 px-4">
              <HelpCircle size={32} color={colors.textMuted} />
              <Text className="text-sm font-semibold mt-2" style={{ color: colors.text }}>No results found</Text>
              <Text className="text-xs mt-1 text-center" style={{ color: colors.textMuted }}>Try a different search or contact support.</Text>
            </View>
          ) : (
            filtered.map((f, idx) => (
              <View key={f.id}>
                {idx > 0 && <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 16 }} />}
                <Pressable onPress={() => toggleItem(f.id)} className="px-4 py-3 active:opacity-80">
                  <View className="flex-row items-center">
                    <Text className="flex-1 text-sm font-medium" style={{ color: colors.text }}>{f.question}</Text>
                    {expandedId === f.id ? (
                      <ChevronUp size={16} color={colors.textMuted} />
                    ) : (
                      <ChevronDown size={16} color={colors.textMuted} />
                    )}
                  </View>
                  {expandedId === f.id && (
                    <Text className="text-xs leading-5 mt-2" style={{ color: colors.textMuted }}>
                      {f.answer}
                    </Text>
                  )}
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* Quick links */}
        <SectionTitle colors={colors}>Quick Links</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <QuickLink icon={<Truck size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Track an Order" onPress={() => router.push('/(tabs)/orders')} colors={colors} />
          <Divider colors={colors} />
          <QuickLink icon={<RefreshCcw size={18} color={colors.info} />} iconBg={colors.infoLight} title="Request a Refund" onPress={() => router.push('/(tabs)/orders')} colors={colors} />
          <Divider colors={colors} />
          <QuickLink icon={<CreditCard size={18} color={colors.warning} />} iconBg={colors.warningLight} title="Payment Issues" onPress={() => router.push('/wallet')} colors={colors} />
          <Divider colors={colors} />
          <QuickLink icon={<MapPin size={18} color={colors.error} />} iconBg={colors.errorLight} title="Address Problems" onPress={() => router.push('/address')} colors={colors} />
          <Divider colors={colors} />
          <QuickLink icon={<Shield size={18} color={colors.textMuted} />} iconBg={colors.surfaceAlt} title="Report a Safety Issue" onPress={() => router.push('/chat')} colors={colors} />
        </View>

        <Text className="text-center text-[11px] mt-2" style={{ color: colors.textMuted }}>
          Still need help?{' '}
          <Text onPress={() => router.push('/chat')} style={{ color: colors.primary, fontWeight: '600' }}>Chat with us</Text>
          {'\n'}Avg response time: under 2 minutes
        </Text>
      </ScrollView>
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

function QuickLink({ icon, iconBg, title, onPress, colors }: { icon: React.ReactNode; iconBg: string; title: string; onPress: () => void; colors: any }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3 active:opacity-80">
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <Text className="flex-1 ml-3 text-sm font-medium" style={{ color: colors.text }}>{title}</Text>
      <ChevronDown size={14} color={colors.textSubtle} style={{ transform: [{ rotate: '-90deg' }] }} />
    </Pressable>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 62 }} />;
}
