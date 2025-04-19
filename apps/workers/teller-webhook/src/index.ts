interface Env {
  TELLER_SIGNING_SECRET: string;
  TELLER_SIGNING_KEY: string;
  WEBHOOK_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      // Get the raw body for signature verification
      const rawBody = await request.clone().text();

      // Verify Teller signature
      const signature = request.headers.get("x-teller-signature");
      if (!signature) {
        return new Response("Missing signature", { status: 401 });
      }

      // Verify the signature using the Teller signing key
      const isValid = await verifyTellerSignature(rawBody, signature, env.TELLER_SIGNING_KEY);

      if (!isValid) {
        return new Response("Invalid signature", { status: 401 });
      }

      // Parse the webhook payload
      const payload = JSON.parse(rawBody);

      // Forward the webhook to your backend
      const response = await fetch(env.WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Teller-Signature": signature,
        },
        body: rawBody,
      });

      if (!response.ok) {
        throw new Error(`Backend responded with status: ${response.status}`);
      }

      return new Response("Webhook processed successfully", { status: 200 });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Internal server error", { status: 500 });
    }
  },
};

async function verifyTellerSignature(
  payload: string,
  signature: string,
  signingKey: string,
): Promise<boolean> {
  // Import the crypto module
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  // Verify the signature
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    hexToArrayBuffer(signature),
    encoder.encode(payload),
  );

  return isValid;
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}
