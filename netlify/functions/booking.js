// Netlify Function: sends booking notifications by email (Resend) and WhatsApp (Twilio).
// API credentials must be configured in Netlify environment variables, never in browser code.

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(body),
});

const safe = (value, max = 500) =>
  String(value ?? "").trim().slice(0, max);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  let booking;
  try {
    booking = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON." });
  }

  const name = safe(booking.name, 100);
  const phone = safe(booking.phone, 40);
  const date = safe(booking.date, 20);
  const time = safe(booking.time, 10);
  const service = safe(booking.service, 100);
  const duration = safe(booking.duration, 10);
  const payment = safe(booking.payment, 80);
  const notes = safe(booking.notes, 800);
  const price = Number(booking.price);

  if (!name || !phone || !date || !time || !service || !Number.isFinite(price)) {
    return json(400, { error: "Ju lutem plotësoni të dhënat e detyrueshme." });
  }

  // ISO date validation plus basic past-date protection.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return json(400, { error: "Data ose ora nuk është e vlefshme." });
  }

  const emailTo = process.env.BOOKING_EMAIL_TO || "selimkuci5@gmail.com";
  const emailFrom = process.env.RESEND_FROM;
  const resendApiKey = process.env.RESEND_API_KEY;

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
  const whatsappTo = process.env.TWILIO_WHATSAPP_TO;

  const plainText = [
    "Rezervim i ri — Kuçi Coiffeur",
    `Emri: ${name}`,
    `Telefoni: ${phone}`,
    `Shërbimi: ${service}`,
    `Kohëzgjatja: ${duration} minuta`,
    `Data: ${date}`,
    `Ora: ${time}`,
    `Çmimi: €${price.toFixed(2)}`,
    `Pagesa e zgjedhur: ${payment}`,
    notes ? `Shënime: ${notes}` : "",
    "",
    "Kjo është kërkesë rezervimi; orari nuk konfirmohet automatikisht.",
  ].filter(Boolean).join("\n");

  const outcomes = { email: "failed", whatsapp: "failed" };

  if (resendApiKey && emailFrom) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [emailTo],
          subject: `Rezervim i ri: ${name} — ${date} ${time}`,
          text: plainText,
        }),
      });
      if (res.ok) outcomes.email = "sent";
      else console.error("Resend returned status", res.status);
    } catch (err) {
      console.error("Email notification error:", err?.message || "unknown");
    }
  } else {
    console.warn("Email not configured: set RESEND_API_KEY and RESEND_FROM.");
  }

  if (twilioSid && twilioToken && whatsappFrom && whatsappTo) {
    try {
      const body = new URLSearchParams({
        From: whatsappFrom.startsWith("whatsapp:") ? whatsappFrom : `whatsapp:${whatsappFrom}`,
        To: whatsappTo.startsWith("whatsapp:") ? whatsappTo : `whatsapp:${whatsappTo}`,
        Body: plainText,
      });
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(twilioSid)}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        }
      );
      if (res.ok) outcomes.whatsapp = "sent";
      else {
        const errorBody = await res.text();
        console.error("Twilio returned status", res.status, errorBody.slice(0, 500));
      }
    } catch (err) {
      console.error("WhatsApp notification error:", err?.message || "unknown");
    }
  } else {
    console.warn("WhatsApp not configured: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, and TWILIO_WHATSAPP_TO.");
  }

  if (outcomes.email !== "sent" && outcomes.whatsapp !== "sent") {
    return json(502, {
      error: "Asnjë njoftim nuk u dërgua. Kontrollo variablat e Netlify dhe regjistrat e funksionit.",
      ...outcomes,
    });
  }

  return json(200, outcomes);
};
