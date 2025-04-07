import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { MercadoPagoConfig, Payment } from 'npm:mercadopago@2.0.8';

const client = new MercadoPagoConfig({ 
  accessToken: Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!,
});

serve(async (req) => {
  try {
    const { planId, amount } = await req.json();

    const payment = await new Payment(client).create({
      transaction_amount: amount,
      payment_method_id: 'pix',
      description: `Plano ${planId}`,
      payer: {
        email: 'test@test.com', // This should be the user's email
      },
    });

    return new Response(
      JSON.stringify({
        qrCode: payment.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});