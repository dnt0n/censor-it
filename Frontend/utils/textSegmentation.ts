import { Entity, Segment } from '../types';

type Match = {
start: number;
end: number;
entity_group: string;
text: string; // matched text, original casing
};

/**
* Build non-overlapping segments from text + entity words.
* Matches are case-insensitive, ignores punctuation differences,
* prefers earlier spans when overlaps occur.
*/
export function buildSegments(
  text: string,
  entities: Entity[]
): Segment[] {
  const matches: Match[] = [];

  for (const e of entities) {
    if (!e.word?.trim()) continue;

    // Remove punctuation from entity word and trim
    const cleanWord = e.word.replace(/[^\w\s]/g, '').trim();
    if (!cleanWord) continue;

    // Match in the text ignoring case, allow flexible whitespace
    const re = new RegExp(cleanWord.replace(/\s+/g, '\\s+'), 'gi');

    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        entity_group: e.entity_group,
        text: m[0],
      });
      // Guard against zero-length matches
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }

  // Sort: earlier start first, longer match first if tie
  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  // Remove overlaps: keep earliest match
  const kept: Match[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start >= cursor) {
      kept.push(m);
      cursor = m.end;
    }
  }

  // Build final segments
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
