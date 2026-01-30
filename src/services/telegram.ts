export class TelegramService {
  constructor(private token: string, private chatId: string) {}

  async sendMessage(message: string): Promise<void> {
    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: this.chatId,
        text: message,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Telegram API error: ${res.status} ${text}`);
    }
  }
}
