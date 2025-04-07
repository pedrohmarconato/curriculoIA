import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { MercadoPagoConfig, Preference } from 'npm:mercadopago@2.0.8';

const client = new MercadoPagoConfig({ 
  accessToken: Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!,
});

serve(async (req) => {
  try {
    const { title, price, quantity } = await req.json();

    const preference = await new Preference(client).create({
      items: [
        {
          title,
          unit_price: price,
          quantity,
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: `${req.headers.get('origin')}/payment/success`,
        failure: `${req.headers.get('origin')}/payment/failure`,
        pending: `${req.headers.get('origin')}/payment/pending`,
      },
      auto_return: 'approved',
    });

    return new Response(
      JSON.stringify(preference),
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