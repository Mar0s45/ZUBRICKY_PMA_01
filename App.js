import { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, SafeAreaView, StatusBar as RNStatusBar,
  Animated, PanResponder, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// -----------------------------------------------------------------------------
// Vozíčkov – všetkých 9 obrazoviek v jednom App.js
// Interný router cez useState. Prototyp na SDK 57 bez extra závislostí
// okrem @expo/vector-icons (v Expo scaffolde už je).
// -----------------------------------------------------------------------------

const C = {
  primary: '#4A6CF7', primaryDark: '#3B57D6', primaryTint: '#EEF2FF',
  bg: '#F5F6FA', card: '#FFFFFF',
  text: '#0F172A', textMuted: '#64748B', textLight: '#94A3B8',
  border: '#EEF1F6', borderInput: '#E2E8F0',
  success: '#DCFCE7', successText: '#166534',
  danger: '#DC2626', dangerBg: '#FEE2E2', dangerText: '#991B1B',
  neutral: '#F1F5F9', neutralText: '#475569',
};

const MOCK_VOZIKY = [
  { id: 'A-01', nazov: 'Vozík A-01', s: 46, v: 92, h: 108, stav: 'volny' },
  { id: 'A-02', nazov: 'Vozík A-02', s: 42, v: 90, h: 105, stav: 'rezervovany' },
  { id: 'B-03', nazov: 'Vozík B-03 (detský)', s: 34, v: 78, h: 90, stav: 'volny' },
  { id: 'B-04', nazov: 'Vozík B-04 (bariatrický)', s: 56, v: 96, h: 118, stav: 'volny' },
  { id: 'C-05', nazov: 'Vozík C-05', s: 44, v: 88, h: 100, stav: 'rezervovany' },
];

const MOCK_REZERVACIE = [
  { vozik: 'Vozík A-01', pacient: 'Ján Šimko', izba: 'izba 214', kedy: 'Rezervované dnes o 09:12', stav: 'aktivna' },
  { vozik: 'Vozík B-04 (bariatrický)', pacient: 'Mária Halásová', izba: 'izba 202', kedy: 'Rezervované včera o 14:30', stav: 'aktivna' },
  { vozik: 'Vozík C-06', pacient: 'Pavol Ďurica', izba: null, kedy: 'Uvoľnené 19. sep', stav: 'uvolnene' },
];

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [params, setParams] = useState({});
  const [voziky, setVoziky] = useState(MOCK_VOZIKY);

  const go = (name, p = {}) => { setParams(p); setScreen(name); };

  const nav = { go, params, voziky, setVoziky };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="dark" />
      {screen === 'welcome' && <Welcome nav={nav} />}
      {screen === 'prihlasenie' && <Prihlasenie nav={nav} />}
      {screen === 'registracia' && <Registracia nav={nav} />}
      {screen === 'zoznam' && <Zoznam nav={nav} />}
      {screen === 'detail' && <Detail nav={nav} />}
      {screen === 'profil' && <Profil nav={nav} />}
      {screen === 'admin-zoznam' && <AdminZoznam nav={nav} />}
      {screen === 'admin-pridat' && <AdminPridat nav={nav} />}
      {/* modal-like layer */}
      {screen === 'rezervacia' && <Rezervacia nav={nav} />}
    </View>
  );
}

// -----------------------------------------------------------------------------
// 1. Welcome
// -----------------------------------------------------------------------------
function Welcome({ nav }) {
  return (
    <View style={[s.root, { backgroundColor: C.primary, paddingHorizontal: 28 }]}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 40 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <View style={s.wLogo}>
            <MaterialCommunityIcons name="wheelchair-accessibility" size={72} color="#fff" />
          </View>
          <Text style={s.wTitle}>Vozíčkov</Text>
          <Text style={s.wSub}>Rezervácia invalidných vozíkov pre fyzioterapeutov</Text>
        </View>
        <View style={{ gap: 12 }}>
          <Pressable onPress={() => nav.go('prihlasenie')} style={s.wBtnPrimary}>
            <Text style={s.wBtnPrimaryText}>Prihlásiť sa</Text>
          </Pressable>
          <Pressable onPress={() => nav.go('registracia')} style={s.wBtnOutline}>
            <Text style={s.wBtnOutlineText}>Registrovať sa</Text>
          </Pressable>
          <Pressable onPress={() => nav.go('admin-zoznam')} style={{ alignItems: 'center', paddingVertical: 6 }}>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500' }}>Prihlásiť ako admin</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// 2. Prihlásenie
// -----------------------------------------------------------------------------
function Prihlasenie({ nav }) {
  const [email, setEmail] = useState('anna.kovacova@rehab.sk');
  const [heslo, setHeslo] = useState('demoheslo');
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 28 }}>
        <BackButton onPress={() => nav.go('welcome')} />
        <Text style={s.h1}>Vitaj späť</Text>
        <Text style={s.h1Sub}>Prihlás sa do svojho účtu</Text>
        <View style={{ marginTop: 36, gap: 16 }}>
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Heslo" value={heslo} onChangeText={setHeslo} secureTextEntry />
          <Text style={{ textAlign: 'right', color: C.primary, fontSize: 13, fontWeight: '500' }}>Zabudnuté heslo?</Text>
        </View>
        <Pressable onPress={() => nav.go('zoznam')} style={[s.btnPrimary, { marginTop: 28 }]}>
          <Text style={s.btnPrimaryText}>Prihlásiť</Text>
        </Pressable>
        <View style={s.footer}>
          <Text style={{ fontSize: 14, color: C.textMuted }}>Nemáš účet? </Text>
          <Pressable onPress={() => nav.go('registracia')}>
            <Text style={{ fontSize: 14, color: C.primary, fontWeight: '600' }}>Zaregistruj sa</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// -----------------------------------------------------------------------------
// 3. Registrácia
// -----------------------------------------------------------------------------
function Registracia({ nav }) {
  const [f, setF] = useState({ meno: 'Anna', priezvisko: 'Kováčová', email: 'anna.kovacova@rehab.sk', heslo: '', heslo2: '' });
  const set = (k) => (v) => setF({ ...f, [k]: v });
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 24, flexGrow: 1 }}>
          <BackButton onPress={() => nav.go('welcome')} />
          <Text style={s.h1}>Vytvor si účet</Text>
          <Text style={s.h1Sub}>Pridaj sa k tímu fyzioterapeutov</Text>
          <View style={{ marginTop: 24, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Field flex label="Meno" value={f.meno} onChangeText={set('meno')} />
              <Field flex label="Priezvisko" value={f.priezvisko} onChangeText={set('priezvisko')} />
            </View>
            <Field label="Email" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Heslo" value={f.heslo} onChangeText={set('heslo')} secureTextEntry placeholder="Zvoľ heslo" />
            <Field label="Potvrdenie hesla" value={f.heslo2} onChangeText={set('heslo2')} secureTextEntry placeholder="Zopakuj heslo" />
          </View>
          <Pressable onPress={() => nav.go('zoznam')} style={[s.btnPrimary, { marginTop: 24 }]}>
            <Text style={s.btnPrimaryText}>Registrovať sa</Text>
          </Pressable>
          <View style={[s.footer, { paddingTop: 24 }]}>
            <Text style={{ fontSize: 13, color: C.textMuted }}>Už máš účet? </Text>
            <Pressable onPress={() => nav.go('prihlasenie')}>
              <Text style={{ fontSize: 13, color: C.primary, fontWeight: '600' }}>Prihlás sa</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// -----------------------------------------------------------------------------
// 4. Zoznam vozíkov
// -----------------------------------------------------------------------------
const FILTRE = ['Všetky', 'Voľné', 'Šírka', 'Výška'];

function Zoznam({ nav }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('Všetky');
  const list = nav.voziky.filter((w) => {
    if (filter === 'Voľné' && w.stav !== 'volny') return false;
    if (q && !w.nazov.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={{ fontSize: 13, color: C.textMuted }}>Dobrý deň,</Text>
            <Text style={s.headerTitle}>Vozíky na oddelení</Text>
          </View>
          <View style={s.bell}>
            <Feather name="bell" size={20} color={C.primary} />
          </View>
        </View>
        <View style={s.search}>
          <Feather name="search" size={18} color={C.textLight} />
          <TextInput value={q} onChangeText={setQ} placeholder="Hľadať vozík…" placeholderTextColor={C.textLight} style={s.searchInput} />
          <View style={{ width: 1, height: 20, backgroundColor: C.borderInput }} />
          <Feather name="sliders" size={18} color={C.primary} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
          {FILTRE.map((f) => {
            const on = f === filter;
            return (
              <Pressable key={f} onPress={() => setFilter(f)} style={[s.chip, on && { backgroundColor: C.primary, borderColor: C.primary }]}>
                <Text style={[s.chipText, on && { color: '#fff', fontWeight: '600' }]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 10 }}>
        {list.map((w) => (
          <Pressable key={w.id} onPress={() => nav.go('detail', { id: w.id })} style={s.card}>
            <View style={s.cardIcon}>
              <MaterialCommunityIcons name="wheelchair-accessibility" size={30} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{w.nazov}</Text>
              <Text style={s.cardDim}>Š {w.s} × V {w.v} × H {w.h} cm</Text>
            </View>
            <View style={[s.badge, { backgroundColor: w.stav === 'volny' ? C.success : C.dangerBg }]}>
              <Text style={[s.badgeText, { color: w.stav === 'volny' ? C.successText : C.dangerText }]}>
                {w.stav === 'volny' ? 'Voľný' : 'Rezervovaný'}
              </Text>
            </View>
          </Pressable>
        ))}
        {list.length === 0 && (
          <Text style={{ textAlign: 'center', color: C.textMuted, paddingVertical: 40 }}>Žiadny vozík nezodpovedá filtru.</Text>
        )}
      </ScrollView>
      <BottomNav active="home" nav={nav} />
    </View>
  );
}

// -----------------------------------------------------------------------------
// 5. Detail vozíka
// -----------------------------------------------------------------------------
const KOMENTARE = [
  { autor: 'M. Novák', kedy: 'pred 2 dňami', text: 'Ľavá brzda mierne vôľa, inak OK.' },
  { autor: 'J. Horváth', kedy: '1. sep', text: 'Vyčistený, plnené kolieska.' },
];

function Detail({ nav }) {
  const id = nav.params.id ?? 'A-01';
  const vozik = nav.voziky.find((w) => w.id === id) ?? nav.voziky[0];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.hero}>
        <SafeAreaView style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 8 }}>
          <Pressable onPress={() => nav.go('zoznam')} style={s.iconBtn}>
            <Feather name="chevron-left" size={18} color={C.text} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable style={s.iconBtn}>
            <Feather name="heart" size={18} color={C.text} />
          </Pressable>
        </SafeAreaView>
        <View style={s.heroIcon}>
          <MaterialCommunityIcons name="wheelchair-accessibility" size={160} color={C.primary} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={s.detailTitle}>{vozik.nazov}</Text>
            <Text style={s.detailSub}>Štandardný, oceľový rám</Text>
          </View>
          <View style={[s.badge, { backgroundColor: vozik.stav === 'volny' ? C.success : C.dangerBg }]}>
            <Text style={[s.badgeText, { color: vozik.stav === 'volny' ? C.successText : C.dangerText }]}>
              {vozik.stav === 'volny' ? 'Voľný' : 'Rezervovaný'}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <DimCard label="Šírka" value={`${vozik.s} cm`} />
          <DimCard label="Výška" value={`${vozik.v} cm`} />
          <DimCard label="Hĺbka" value={`${vozik.h} cm`} />
        </View>
        <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 20, color: C.text }}>Komentáre kolegov</Text>
        <View style={{ gap: 8, marginTop: 10 }}>
          {KOMENTARE.map((k, i) => (
            <View key={i} style={s.commentCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.text }}>{k.autor}</Text>
                <Text style={{ fontSize: 12, color: C.textLight }}>{k.kedy}</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#334155', marginTop: 4 }}>{k.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <SafeAreaView style={s.cta}>
        <Pressable onPress={() => nav.go('rezervacia', { id })} style={s.btnPrimary}>
          <Text style={s.btnPrimaryText}>Rezervovať</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function DimCard({ label, value }) {
  return (
    <View style={s.dimCard}>
      <Text style={{ fontSize: 11, color: C.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 17, fontWeight: '700', color: C.text, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

// -----------------------------------------------------------------------------
// 6. Vytvorenie rezervácie (bottom-sheet nad Detailom)
// -----------------------------------------------------------------------------
function Rezervacia({ nav }) {
  const id = nav.params.id ?? 'A-01';
  const [pMeno, setPMeno] = useState('Ján');
  const [pPriezvisko, setPPriezvisko] = useState('Šimko');
  const oddelenie = 'Neurorehabilitácia B · izba 214';
  const submit = () => {
    // TODO: POST na backend – označ vozík ako rezervovaný
    nav.setVoziky((xs) => xs.map((w) => (w.id === id ? { ...w, stav: 'rezervovany' } : w)));
    nav.go('zoznam');
  };
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Pressable onPress={() => nav.go('detail', { id })} style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(15,23,42,0.55)' }]} />
      <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <SafeAreaView style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={s.sheetIcon}>
              <MaterialCommunityIcons name="wheelchair-accessibility" size={22} color={C.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.text }}>Nová rezervácia</Text>
              <Text style={{ fontSize: 12, color: C.textMuted }}>Vozík {id} · dnes</Text>
            </View>
          </View>
          <View style={{ marginTop: 22, gap: 12 }}>
            <Field label="Meno pacienta" value={pMeno} onChangeText={setPMeno} />
            <Field label="Priezvisko pacienta" value={pPriezvisko} onChangeText={setPPriezvisko} />
            <View>
              <Text style={s.fieldLabel}>Lôžkové oddelenie</Text>
              <Pressable style={s.select}>
                <Text style={{ fontSize: 14, color: C.text }}>{oddelenie}</Text>
                <Feather name="chevron-down" size={16} color={C.textLight} />
              </Pressable>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
            <Pressable onPress={() => nav.go('detail', { id })} style={[s.btnCancel, { flex: 1 }]}>
              <Text style={s.btnCancelText}>Zrušiť</Text>
            </Pressable>
            <Pressable onPress={submit} style={[s.btnPrimary, { flex: 2 }]}>
              <Text style={s.btnPrimaryText}>Rezervovať</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// 7. Profil fyzioterapeuta
// -----------------------------------------------------------------------------
function Profil({ nav }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={[s.header, { paddingBottom: 22 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={s.headerTitle}>Môj profil</Text>
          <Pressable onPress={() => nav.go('welcome')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="log-out" size={16} color={C.danger} />
            <Text style={{ color: C.danger, fontSize: 13, fontWeight: '600' }}>Odhlásiť</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20 }}>
          <View style={s.avatar}><Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>AK</Text></View>
          <View>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.text }}>Anna Kováčová</Text>
            <Text style={{ fontSize: 13, color: C.textMuted }}>Fyzioterapeut · Rehab. odd. B</Text>
          </View>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.text }}>Moje rezervácie</Text>
          <Text style={{ fontSize: 12, color: C.primary, fontWeight: '500' }}>
            {MOCK_REZERVACIE.filter((r) => r.stav === 'aktivna').length} aktívne
          </Text>
        </View>
        <View style={{ gap: 10, marginTop: 12 }}>
          {MOCK_REZERVACIE.map((r, i) => (
            <View key={i} style={s.card}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{r.vozik}</Text>
                  <View style={[s.badgeSm, r.stav === 'aktivna' ? { backgroundColor: C.success } : { backgroundColor: C.neutral }]}>
                    <Text style={[s.badgeSmText, { color: r.stav === 'aktivna' ? C.successText : C.neutralText }]}>
                      {r.stav === 'aktivna' ? 'Aktívna' : 'Uvoľnené'}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                  Pacient: {r.pacient}{r.izba ? ` · ${r.izba}` : ''}
                </Text>
                <Text style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{r.kedy}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomNav active="profile" nav={nav} />
    </View>
  );
}

// -----------------------------------------------------------------------------
// 8. Admin – zoznam vozíkov (swipe-to-delete)
// -----------------------------------------------------------------------------
function AdminZoznam({ nav }) {
  const remove = (id) =>
    Alert.alert('Zmazať vozík?', 'Táto akcia sa nedá vrátiť späť.', [
      { text: 'Zrušiť', style: 'cancel' },
      { text: 'Zmazať', style: 'destructive', onPress: () => nav.setVoziky((xs) => xs.filter((w) => w.id !== id)) },
    ]);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={[s.header, { paddingBottom: 14 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={s.tag}>ADMIN</Text>
            <Text style={s.headerTitle}>Správa vozíkov</Text>
          </View>
          <Pressable onPress={() => nav.go('welcome')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="log-out" size={16} color={C.danger} />
            <Text style={{ color: C.danger, fontSize: 13, fontWeight: '600' }}>Odhlásiť</Text>
          </Pressable>
        </View>
        <Text style={{ fontSize: 12, color: C.textLight, marginTop: 8 }}>Potiahni kartu doľava pre zmazanie</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 10 }}>
        {nav.voziky.map((w) => (
          <SwipeRow key={w.id} onDelete={() => remove(w.id)}>
            <View style={s.card}>
              <View style={[s.cardIcon, { width: 48, height: 48, borderRadius: 10 }]}>
                <MaterialCommunityIcons name="wheelchair-accessibility" size={26} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{w.nazov}</Text>
                <Text style={s.cardDim}>{w.s} × {w.v} × {w.h} cm</Text>
              </View>
              <Feather name="chevron-right" size={16} color={C.borderInput} />
            </View>
          </SwipeRow>
        ))}
      </ScrollView>
      <AdminBottomNav active="wheelchairs" nav={nav} />
    </View>
  );
}

function SwipeRow({ children, onDelete }) {
  const tx = useRef(new Animated.Value(0)).current;
  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => { if (g.dx < 0) tx.setValue(Math.max(g.dx, -100)); },
      onPanResponderRelease: (_, g) => {
        Animated.timing(tx, { toValue: g.dx < -60 ? -80 : 0, duration: 160, useNativeDriver: true }).start();
      },
    })
  ).current;
  return (
    <View>
      <Pressable onPress={onDelete} style={s.deleteBg}>
        <Feather name="trash-2" size={20} color="#fff" />
      </Pressable>
      <Animated.View style={{ transform: [{ translateX: tx }] }} {...responder.panHandlers}>{children}</Animated.View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// 9. Admin – pridať vozík
// -----------------------------------------------------------------------------
function AdminPridat({ nav }) {
  const [f, setF] = useState({ nazov: '', s: '', v: '', h: '', pozn: '' });
  const set = (k) => (v) => setF({ ...f, [k]: v });
  const submit = () => {
    if (f.nazov && f.s && f.v && f.h) {
      nav.setVoziky((xs) => [...xs, { id: f.nazov, nazov: f.nazov, s: +f.s, v: +f.v, h: +f.h, stav: 'volny' }]);
    }
    nav.go('admin-zoznam');
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={[s.header, { paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        <Pressable onPress={() => nav.go('admin-zoznam')} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: C.neutral, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="chevron-left" size={18} color={C.text} />
        </Pressable>
        <View>
          <Text style={s.tag}>ADMIN</Text>
          <Text style={{ fontSize: 19, fontWeight: '700', color: C.text }}>Pridať vozík</Text>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Pressable style={s.photo}>
          <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: C.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="camera" size={26} color={C.primary} />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: C.textMuted }}>Pridaj fotku vozíka</Text>
        </Pressable>
        <View style={{ marginTop: 20, gap: 12 }}>
          <Field label="Názov" value={f.nazov} onChangeText={set('nazov')} placeholder="napr. Vozík C-07" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Field flex label="Šírka (cm)" value={f.s} onChangeText={set('s')} placeholder="46" keyboardType="number-pad" />
            <Field flex label="Výška (cm)" value={f.v} onChangeText={set('v')} placeholder="92" keyboardType="number-pad" />
            <Field flex label="Hĺbka (cm)" value={f.h} onChangeText={set('h')} placeholder="108" keyboardType="number-pad" />
          </View>
          <Field label="Poznámka (voliteľné)" value={f.pozn} onChangeText={set('pozn')} placeholder="napr. bariatrický, detský…" />
        </View>
      </ScrollView>
      <SafeAreaView style={s.cta}>
        <Pressable onPress={submit} style={s.btnPrimary}>
          <Text style={s.btnPrimaryText}>Pridať vozík</Text>
        </Pressable>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// -----------------------------------------------------------------------------
// Zdieľané komponenty
// -----------------------------------------------------------------------------
function Field({ label, flex, ...rest }) {
  return (
    <View style={flex ? { flex: 1 } : null}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput style={s.input} placeholderTextColor={C.textLight} {...rest} />
    </View>
  );
}

function BackButton({ onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 24 }}>
      <Feather name="chevron-left" size={18} color={C.textMuted} />
      <Text style={{ color: C.textMuted, fontSize: 14, fontWeight: '500' }}>Späť</Text>
    </Pressable>
  );
}

function BottomNav({ active, nav }) {
  const items = [
    { key: 'search', label: 'Hľadanie', icon: 'search', to: 'zoznam' },
    { key: 'home', label: 'Domov', icon: 'home', to: 'zoznam' },
    { key: 'profile', label: 'Profil', icon: 'user', to: 'profil' },
  ];
  return (
    <SafeAreaView style={s.tabbar}>
      {items.map((it) => {
        const on = it.key === active;
        return (
          <Pressable key={it.key} onPress={() => nav.go(it.to)} style={{ alignItems: 'center', gap: 3, minWidth: 60 }}>
            <Feather name={it.icon} size={22} color={on ? C.primary : C.textLight} />
            <Text style={{ fontSize: 11, color: on ? C.primary : C.textLight, fontWeight: on ? '600' : '500' }}>{it.label}</Text>
          </Pressable>
        );
      })}
    </SafeAreaView>
  );
}

function AdminBottomNav({ nav }) {
  return (
    <SafeAreaView style={s.tabbar}>
      <Pressable onPress={() => nav.go('zoznam')} style={{ alignItems: 'center', gap: 3, minWidth: 60 }}>
        <Feather name="user" size={22} color={C.textLight} />
        <Text style={{ fontSize: 11, color: C.textLight }}>Fyzio</Text>
      </Pressable>
      <Pressable onPress={() => nav.go('admin-pridat')} style={{ alignItems: 'center', gap: 3, minWidth: 60 }}>
        <View style={{ width: 44, height: 32, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: -3 }}>
          <Feather name="plus" size={20} color="#fff" />
        </View>
        <Text style={{ fontSize: 11, color: C.primary, fontWeight: '600' }}>Pridať vozík</Text>
      </Pressable>
      <View style={{ alignItems: 'center', gap: 3, minWidth: 60 }}>
        <Feather name="grid" size={22} color={C.primary} />
        <Text style={{ fontSize: 11, color: C.primary, fontWeight: '600' }}>Vozíky</Text>
      </View>
    </SafeAreaView>
  );
}

// -----------------------------------------------------------------------------
// Štýly
// -----------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { flex: 1, paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },

  // Welcome
  wLogo: {
    width: 120, height: 120, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  wTitle: { color: '#fff', fontSize: 38, fontWeight: '800', letterSpacing: -0.5 },
  wSub: { color: 'rgba(255,255,255,0.85)', fontSize: 15, textAlign: 'center', maxWidth: 260, lineHeight: 22 },
  wBtnPrimary: {
    backgroundColor: '#fff', paddingVertical: 16, borderRadius: 14, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  wBtnPrimaryText: { color: C.primary, fontSize: 16, fontWeight: '600' },
  wBtnOutline: {
    backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 16, borderRadius: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  wBtnOutlineText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Headings
  h1: { fontSize: 30, fontWeight: '700', color: C.text, letterSpacing: -0.5 },
  h1Sub: { fontSize: 15, color: C.textMuted, marginTop: 6 },

  // Form
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#334155', marginBottom: 4 },
  input: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.borderInput,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text,
  },

  // Buttons
  btnPrimary: {
    backgroundColor: C.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center',
    shadowColor: C.primary, shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnCancel: { backgroundColor: C.neutral, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnCancelText: { color: C.neutralText, fontSize: 15, fontWeight: '600' },

  // Header (Zoznam / Profil / Admin)
  header: { backgroundColor: C.card, paddingHorizontal: 20, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  bell: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.primaryTint, alignItems: 'center', justifyContent: 'center' },
  tag: { fontSize: 12, color: C.primary, fontWeight: '600', letterSpacing: 0.5 },

  // Search
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },

  // Chip
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.borderInput },
  chipText: { fontSize: 12, fontWeight: '500', color: '#334155' },

  // Card
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border,
  },
  cardIcon: { width: 56, height: 56, borderRadius: 12, backgroundColor: C.primaryTint, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  cardDim: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeSmText: { fontSize: 10, fontWeight: '600' },

  // Detail hero
  hero: { height: 280, backgroundColor: '#DDE4FE' },
  heroIcon: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: -1 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  detailTitle: { fontSize: 22, fontWeight: '700', color: C.text },
  detailSub: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  dimCard: { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  commentCard: { backgroundColor: C.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border },
  cta: {
    position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border,
  },

  // Bottom nav
  tabbar: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, paddingHorizontal: 20,
  },

  // Rezervácia sheet
  sheet: {
    backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24,
  },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: C.borderInput, alignSelf: 'center', marginBottom: 18 },
  sheetIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryTint, alignItems: 'center', justifyContent: 'center' },
  select: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.borderInput,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },

  // Profil
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },

  // Footer link
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingBottom: 16 },

  // Admin
  photo: {
    height: 150, backgroundColor: C.card, borderRadius: 16, borderWidth: 2, borderColor: C.borderInput,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  deleteBg: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
    backgroundColor: C.danger, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
});
