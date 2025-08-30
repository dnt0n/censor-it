/**
 * You will implement this.
 * Must return a JSON string shaped like: { "entities": [{ entity_group, word, score }, ...] }
 * You can make it async if you later call a server.
 */
export async function process_input(input: string): Promise<string> {
  // --- Demo output so the app works immediately. Replace this with your model call. ---
  const demo = {
    entities: [
      { entity_group: 'NAME', word: 'mike', score: 0.87544074058532715 },
      { entity_group: 'ADDRESS', word: 'block 110', score: 0.9386700391769409 },
    ],
  };
  return JSON.stringify(demo);
}
