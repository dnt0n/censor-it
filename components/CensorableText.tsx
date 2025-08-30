import { Platform, StyleSheet, Text } from 'react-native';
import { Segment } from '../types';

type Props = {
  segments: Segment[];
  censoredMap: Record<string, boolean>;
  onToggle: (segmentKey: string) => void;
};

const LABEL_MAP: Record<string, string> = {
  PERSON: 'name',
  ORG: 'org',
  ORGANIZATION: 'org',
  GPE: 'place',
  LOCATION: 'location',
  ADDRESS: 'address',
  EMAIL: 'email',
  PHONE: 'phone',
  PHONE_NUMBER: 'phone',
  DATE: 'date',
  ID: 'id',
  CREDIT_CARD: 'card',
  IP: 'ip',
};

export default function CensorableText({ segments, censoredMap, onToggle }: Props) {
  return (
    <Text style={styles.containerText} selectable>
      {segments.map((seg) => {
        if (seg.kind === 'plain') {
          return (
            <Text key={seg.key} style={styles.plainText}>
              {seg.text}
            </Text>
          );
        }

        const isCensored = !!censoredMap[seg.key];
        const label = (LABEL_MAP[seg.entity_group] ?? seg.entity_group).toLowerCase();

        return (
          <Text
            key={seg.key}
            onPress={() => onToggle(seg.key)}
            accessibilityRole="button"
            accessibilityHint={
              isCensored ? 'Reveals the original text' : 'Censors this text'
            }
            accessibilityLabel={
              isCensored ? `Censored ${label}. Double tap to reveal.` : `Detected ${label}. Double tap to censor.`
            }
            style={[
              styles.entityTextBase,
              isCensored ? styles.entityCensored : styles.entityHighlighted,
            ]}
          >
            {isCensored ? `[${label}]` : seg.text}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  containerText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#0F172A', // slate-900 for light backgrounds
  },
  plainText: {
    // inherit container styling
  },

  // Base chip style so entities feel tappable and consistent
  entityTextBase: {
    paddingHorizontal: 6,
    paddingVertical: Platform.select({ ios: 2, android: 1 }),
    marginHorizontal: 1,
    marginVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },

  // Subtle warm highlight for detected entities
  entityHighlighted: {
    backgroundColor: '#FEF9C3', // amber-100
    borderColor: '#FACC15',     // amber-400
  },

  // Calm green chip for censored state
  entityCensored: {
    backgroundColor: '#ECFDF5', // emerald-50
    borderColor: '#34D399',     // emerald-400
    fontWeight: '600',
    fontStyle: 'normal',
  },
});
