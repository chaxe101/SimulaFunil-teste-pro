// src/app/api/funnels/[funnelId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import { Funnel } from '@prisma/client';

const funnelUpdateSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.').optional(),
  nodes: z.any().optional(),
  edges: z.any().optional(),
});

type Context = {
  params: {
    funnelId: string;
  };
};

// GET
export async function GET(request: NextRequest, context: Context) {
  const { funnelId } = context.params;

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  const userPayload = await verifyToken(token);

  if (!userPayload || typeof userPayload.id !== 'string') {
    return NextResponse.json({ error: 'Não autorizado. Token inválido ou ID do usuário ausente.' }, { status: 401 });
  }

  try {
    const funnel = await prisma.funnel.findFirst({
      where: {
        id: funnelId,
        userId: userPayload.id,
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funil não encontrado ou você não tem permissão para acessá-lo.' }, { status: 404 });
    }

    const parsedFunnel = {
      ...funnel,
      nodes: typeof funnel.nodes === 'string' && funnel.nodes ? JSON.parse(funnel.nodes) : [],
      edges: typeof funnel.edges === 'string' && funnel.edges ? JSON.parse(funnel.edges) : [],
    };

    return NextResponse.json(parsedFunnel, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar funil:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar funil.' }, { status: 500 });
  }
}

// PUT
export async function PUT(request: NextRequest, context: Context) {
  const { funnelId } = context.params;

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  const userPayload = await verifyToken(token);

  if (!userPayload || typeof userPayload.id !== 'string') {
    return NextResponse.json({ error: 'Não autorizado. Token inválido ou ID do usuário ausente.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsedData = funnelUpdateSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ errors: parsedData.error.errors }, { status: 400 });
    }

    const existingFunnel = await prisma.funnel.findFirst({
      where: {
        id: funnelId,
        userId: userPayload.id,
      },
    });

    if (!existingFunnel) {
      return NextResponse.json({ error: 'Funil não encontrado ou você não tem permissão para atualizá-lo.' }, { status: 404 });
    }

    const dataToUpdate: { name?: string; nodes?: string; edges?: string } = {
      ...parsedData.data,
      nodes: parsedData.data.nodes ? JSON.stringify(parsedData.data.nodes) : JSON.stringify([]),
      edges: parsedData.data.edges ? JSON.stringify(parsedData.data.edges) : JSON.stringify([]),
    };

    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
        delete dataToUpdate[key as keyof typeof dataToUpdate];
      }
    });

    const updatedFunnel = await prisma.funnel.update({
      where: { id: funnelId },
      data: dataToUpdate,
    });

    const parsedUpdatedFunnel = {
      ...updatedFunnel,
      nodes: typeof updatedFunnel.nodes === 'string' && updatedFunnel.nodes ? JSON.parse(updatedFunnel.nodes) : [],
      edges: typeof updatedFunnel.edges === 'string' && updatedFunnel.edges ? JSON.parse(updatedFunnel.edges) : [],
    };

    return NextResponse.json(parsedUpdatedFunnel, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar funil:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar funil.' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: NextRequest, context: Context) {
  const { funnelId } = context.params;

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  const userPayload = await verifyToken(token);

  if (!userPayload || typeof userPayload.id !== 'string') {
    return NextResponse.json({ error: 'Não autorizado. Token inválido ou ID do usuário ausente.' }, { status: 401 });
  }

  try {
    const existingFunnel = await prisma.funnel.findFirst({
      where: {
        id: funnelId,
        userId: userPayload.id,
      },
    });

    if (!existingFunnel) {
      return NextResponse.json({ error: 'Funil não encontrado ou você não tem permissão para deletá-lo.' }, { status: 404 });
    }

    await prisma.funnel.delete({
      where: { id: funnelId },
    });

    return NextResponse.json({ message: 'Funil excluído com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir funil:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir funil.' }, { status: 500 });
  }
}
