export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL || "no-reply@aanganmitra.internal";
  if (!key) return { ok: false, error: "Email disabled" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    return { ok: false, error: `status ${res.status}` };
  }
  return { ok: true };
}
