import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dayjs from 'dayjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    return new NextResponse('Webhook Error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType;

    if (userId && planType) {
      let expirationDate: Date | null = null;
      if (planType === 'weekly') expirationDate = dayjs().add(7, 'days').toDate();
      if (planType === 'monthly') expirationDate = dayjs().add(30, 'days').toDate();

      await prisma.user.update({
        where: { id: userId },
        data: {
          plano: planType,
          expiresAt: expirationDate,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
