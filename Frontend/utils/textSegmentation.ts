import { Entity, Segment } from '../types';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type Match = {
  start: number;
  end: number;
  entity_group: string;
  text: string; // matched text, original casing
};

/**
 * Build non-overlapping segments from text + entity words.
 * Matches are case-insensitive, whole-word, and prefer earlier spans when overlaps occur.
 */
export function buildSegments(
  text: string,
  entities: Entity[]
): Segment[] {
  const matches: Match[] = [];

  for (const e of entities) {
    if (!e.word?.trim()) continue;
    // Whole-word, case-insensitive; supports multi-word (e.g., "block 110")
    const re = new RegExp(`\\b${escapeRegExp(e.word)}\\b`, 'gi');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        entity_group: e.entity_group,
        text: m[0],
      });
      // Guard against zero-length matches (shouldn't happen with \b... but be safe)
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }

  matches.sort((a, b) => a.start - b.start || b.end - a.end); // earlier first, longer first on tie

  // Remove overlaps by keeping the first span that starts earliest
  const kept: Match[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start >= cursor) {
      kept.push(m);
      cursor = m.end;
    }
  }

  const segments: Segment[] = [];
  let pos = 0;
  let idx = 0;

  for (const m of kept) {
    if (m.start > pos) {
      segments.push({
        kind: 'plain',
        text: text.slice(pos, m.start),
        key: `plain-${pos}-${m.start}`,
      });
    }
    segments.push({
      kind: 'entity',
      text: m.text,
      key: `ent-${idx}-${m.start}-${m.end}-${m.entity_group}`,
      entity_group: m.entity_group,
    });
    pos = m.end;
    idx++;
  }

  if (pos < text.length) {
    segments.push({
      kind: 'plain',
      text: text.slice(pos),
      key: `plain-${pos}-${text.length}`,
    });
  }

  return segments;
}

/**
 * Compute final censored string from segments and current censor map.
 */
export function computeCensoredText(
  segments: Segment[],
  censoredMap: Record<string, boolean>
): string {
  return segments
    .map((seg) => {
      if (seg.kind === 'plain') return seg.text;
      const isCensored = !!censoredMap[seg.key];
      return isCensored ? `[${seg.entity_group.toLowerCase()}]` : seg.text;
    })
    .join('');
}
