function normalizeServer(server: string): string {
  const trimmed = server.trim();
  if (!trimmed) {
    return "https://ntfy.sh";
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/+$/, "");
  }
  return `https://${trimmed.replace(/\/+$/, "")}`;
}

export class NtfyService {
  constructor(private server: string, private topic: string) {}

  async publish(message: string): Promise<void> {
    const base = normalizeServer(this.server);
    const topic = encodeURIComponent(this.topic.trim());
    const url = `${base}/${topic}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        Markdown: "yes",
      },
      body: message,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ntfy error: ${res.status} ${text}`);
    }
  }
}
