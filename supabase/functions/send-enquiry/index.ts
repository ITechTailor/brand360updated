import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RECIPIENT = "girish@brand360.co.in";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, phone, email, eventType, eventDate, eventSize, message } = body;

    if (!name || !phone || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, phone, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subject = `New Event Enquiry from ${name} — Brand 360`;
    const textBody = [
      `New event enquiry received via the Brand 360 website.`,
      ``,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Event Type: ${eventType || "—"}`,
      `Event Date: ${eventDate || "—"}`,
      `Event Size: ${eventSize || "—"}`,
      `Message:`,
      `${message || "—"}`,
      ``,
      `— Sent from brand360.co.in enquiry form`,
    ].join("\n");

    const htmlBody = [
      `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#111;">`,
      `<h2 style="color:#0D0D0D;">New Event Enquiry</h2>`,
      `<p>A new enquiry was submitted via the Brand 360 website.</p>`,
      `<table style="width:100%;border-collapse:collapse;margin:16px 0;">`,
      `<tr><td style="padding:8px 12px;border:1px solid #eee;font-weight:bold;">Name</td><td style="padding:8px 12px;border:1px solid #eee;">${name}</td></tr>`,
      `<tr><td style="padding:8px 12px;border:1px solid #eee;font-weight:bold;">Phone</td><td style="padding:8px 12px;border:1px solid #eee;">${phone}</td></tr>`,
      `<tr><td style="padding:8px 12px;border:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px 12px;border:1px solid #eee;">${email}</td></tr>`,
      `<tr><td style="padding:8px 12px;border:1px solid #eee;font-weight:bold;">Event Type</td><td style="padding:8px 12px;border:1px solid #eee;">${eventType || "—"}</td></tr>`,
      `<tr><td style="padding:8px 12px;border:1px solid #eee;font-weight:bold;">Event Date</td><td style="padding:8px 12px;border:1px solid #eee;">${eventDate || "—"}</td></tr>`,
      `<tr><td style="padding:8px 12px;border:1px solid #eee;font-weight:bold;">Event Size</td><td style="padding:8px 12px;border:1px solid #eee;">${eventSize || "—"}</td></tr>`,
      `</table>`,
      `<p style="font-weight:bold;">Message:</p>`,
      `<p style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px;">${message || "—"}</p>`,
      `<hr style="margin:24px 0;border:none;border-top:1px solid #eee;">`,
      `<p style="font-size:12px;color:#888;">Sent from the brand360.co.in enquiry form</p>`,
      `</div>`,
    ].join("");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Brand 360 Enquiries <onboarding@resend.dev>",
          to: [RECIPIENT],
          reply_to: email,
          subject,
          text: textBody,
          html: htmlBody,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        return new Response(
          JSON.stringify({ error: `Email send failed: ${errText}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const data = await res.json();
      return new Response(
        JSON.stringify({ success: true, messageId: data.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: no email provider configured — return the composed payload
    // so the enquiry is at least captured in logs / can be forwarded manually.
    console.log("Enquiry received (no RESEND_API_KEY configured):", JSON.stringify(body, null, 2));
    return new Response(
      JSON.stringify({ success: true, note: "No email provider configured; enquiry logged only.", enquiry: body }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
