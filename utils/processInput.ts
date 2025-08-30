export async function process_input(input: string): Promise<string> {
  console.log("process_input called with:", input);

  try {
    const response = await fetch("https://jovanteooo-hackstreetboys-techjam.hf.space/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    });

    console.log("Raw response status:", response.status);

    const json = await response.json();
    console.log("Raw AI Response:", json);

    // Directly use json.entities
    const entitiesRaw = json?.entities ?? [];
    const filteredEntities = entitiesRaw.filter((e: any) => e.score > 0.5);

    console.log("Filtered Entities:", filteredEntities);

    return JSON.stringify({ entities: filteredEntities });
  } catch (err) {
    console.error("Error in process_input:", err);
    return JSON.stringify({ entities: [] });
  }
}
