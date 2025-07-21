// src/app/api/webhooks/pix-payment/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dayjs from 'dayjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, planType, status } = body; // Adapte conforme o JSON que o GG envia

    if (status === 'paid') {
      let expirationDate: Date | null = null;
      let newPlan = 'free';

      if (planType === 'weekly') {
        newPlan = 'weekly';
        expirationDate = dayjs().add(7, 'days').toDate();
      } else if (planType === 'monthly') {
        newPlan = 'monthly';
        expirationDate = dayjs().add(30, 'days').toDate();
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          plano: newPlan,
          expiresAt: expirationDate,
        },
      });

      return NextResponse.json({ updated: true });
    }

    return NextResponse.json({ ignored: true });
  } catch (error) {
    console.error('Erro no webhook Pix:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
