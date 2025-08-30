import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import 'react-native-gesture-handler';

import CensorableText from '../../components/CensorableText';
import { DetectionResult, Segment } from '../../types';
import { process_input } from '../../utils/processInput';
import { buildSegments, computeCensoredText } from '../../utils/textSegmentation';

export default function App() {
  const [input, setInput] = useState<string>('My name is Tan Wei Ming, NRIC S1234567A, phone 91234567, I stay at Clementi Dr #05-77, Singapore 522010');
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<Segment[] | null>(null);
  const [censoredMap, setCensoredMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const censoredOutput = useMemo(() => {
    if (!segments) return '';
    return computeCensoredText(segments, censoredMap);
  }, [segments, censoredMap]);

 const onDetect = async () => {
   setError(null);
   setLoading(true);
   setSegments(null);
   setCensoredMap({});

   try {
     console.log("Sending input to process_input:", input);

     // Call your updated process_input which should hit the AI API
     const jsonStr = await process_input(input);

     console.log("Raw response string:", jsonStr);

     // Parse the JSON string returned
     const parsed: DetectionResult = JSON.parse(jsonStr);

     console.log("Parsed response:", parsed);

     if (!parsed.entities || !parsed.entities.length) {
       console.warn("No entities detected");
     }

     // Build segments using the returned entities
     const segs = buildSegments(input, parsed.entities || []);
     setSegments(segs);

     console.log("Segments built:", segs);
   } catch (e: any) {
     setError(`Failed to process input: ${e?.message ?? String(e)}`);
     console.error("Error in onDetect:", e);
   } finally {
     setLoading(false);
   }
 };





  const onToggle = (segmentKey: string) => {
    setCensoredMap((prev) => ({ ...prev, [segmentKey]: !prev[segmentKey] }));
  };

  const onCopy = async () => {
    const value = segments ? censoredOutput : input;
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const isCensorable = (s: Segment) => {
    const any = s as any;
    // Prefer explicit flags if your buildSegments sets them;
    // otherwise fall back to common shapes for entity segments.
    if (typeof any.censorable === 'boolean') return any.censorable;
    return (
      any.type === 'entity' ||
      !!any.entity ||
      typeof any.tag === 'string' ||
      any.isEntity === true
    );
  };
  
// Treat any non-plain segment as censorable (fallback to entity_group presence)
const isEntity = (s: Segment) =>
  (s as any).kind ? (s as any).kind !== 'plain' : !!(s as any).entity_group;

const onCensorAll = () => {
  if (!segments) return;
  // Build a fresh map with TRUE for every entity key
  const next: Record<string, boolean> = {};
  for (const s of segments) {
    if (isEntity(s)) next[s.key] = true; // true => censored
  }
  setCensoredMap(next);
};

  const onUncensorAll = () => {
    setCensoredMap({});
  };


  const copyDisabled = !input?.length;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.title}>CensorIt</Text>
            <Text style={styles.subtitle}>
              Paste any prompt below. We’ll detect likely personal information (e.g., names, addresses)
              and let you tap to censor them into tags like [name] and [address].
            </Text>

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.label}>Your Prompt</Text>
                <Text style={styles.muted}>{input.length} chars</Text>
              </View>

              <TextInput
                multiline
                value={input}
                onChangeText={setInput}
                placeholder="Paste or type your prompt…"
                style={styles.input}
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#94A3B8"
              />

              <Pressable
                onPress={onDetect}
                disabled={loading || !input.trim()}
                android_ripple={{ color: '#DBEAFE' }}
                style={({ pressed }) => [
                  styles.button,
                  (loading || !input.trim()) && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                {loading ? (
                  <View style={styles.buttonRow}> 
                    <ActivityIndicator />
                    <Text style={styles.buttonText}> Detecting…</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Detect Personal Information</Text>
                )}
              </Pressable>

              {error && <Text style={styles.error}>{error}</Text>}
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Interactive Output</Text>
              <View style={styles.outputBox}>
                {segments ? (
                  <CensorableText
                    segments={segments}
                    censoredMap={censoredMap}
                    onToggle={onToggle}
                  />
                ) : (
                  <Text style={styles.placeholder}>
                    Run detection to see highlighted entities. Tap a highlight to toggle censorship.
                  </Text>
                )}
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  onPress={onCensorAll}
                  disabled={!segments}
                  android_ripple={{ color: '#DBEAFE' }}
                  style={({ pressed }) => [
                    styles.smallButton,
                    (!segments) && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.smallButtonText}>Censor all</Text>
                </Pressable>

                <Pressable
                  onPress={onUncensorAll}
                  disabled={!segments}
                  android_ripple={{ color: '#F1F5F9' }}
                  style={({ pressed }) => [
                    styles.smallButtonAlt,
                    (!segments) && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.smallButtonText}>Uncensor all</Text>
                </Pressable>
              </View>


              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Copy-ready Text</Text>
                <Text style={styles.resultText}>
                  {segments ? censoredOutput : input}
                </Text>
              </View>

              <Pressable
                onPress={onCopy}
                disabled={copyDisabled}
                android_ripple={{ color: '#DCFCE7' }}
                style={({ pressed }) => [
                  styles.copyButton,
                  copyDisabled && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </Pressable>

              {copied && (
                <View style={styles.toast}>
                  <Text style={styles.toastText}>Copied</Text>
                </View>
              )}
            </View>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout
  safe: { paddingTop: 40, flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  container: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },

  // Typography
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 8,
  },
  muted: { color: '#64748B' },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Inputs
  input: {
    minHeight: 120,
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: '#0F172A',
    fontSize: 16,
  },

  // Buttons
  button: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonRow: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },

  copyButton: {
    marginTop: 12,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  copyButtonText: { color: '#FFFFFF', fontWeight: '700' },

  // Feedback & errors
  error: { color: '#DC2626', marginTop: 10 },
  toast: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    backgroundColor: '#0F172A',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  toastText: { color: 'white', fontWeight: '700' },

  // Output areas
  outputBox: {
    minHeight: 100,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  placeholder: { color: '#64748B' },

  resultBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  resultLabel: { color: '#0F172A', fontWeight: '700', marginBottom: 6 },
  resultText: { color: '#111827', fontSize: 16, lineHeight: 24 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
    marginTop: 10,
  },
  smallButton: {
    marginRight: 10,
    backgroundColor: '#0EA5E9', // cyan
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  smallButtonAlt: {
    backgroundColor: '#475569', // slate
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  smallButtonText: { color: '#FFFFFF', fontWeight: '700' },

});
