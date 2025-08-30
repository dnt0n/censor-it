export type Entity = {
  entity_group: string; // e.g. "NAME" | "ADDRESS"
  word: string;
  score: number;
};

export type DetectionResult = {
  entities: Entity[];
};

export type Segment =
  | { kind: 'plain'; text: string; key: string }
  | {
      kind: 'entity';
      text: string;              // matched text in source
      key: string;               // unique occurrence key
      entity_group: string;      // e.g. NAME
    };
