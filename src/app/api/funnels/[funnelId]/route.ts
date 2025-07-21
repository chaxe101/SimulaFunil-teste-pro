// src/app/api/funnels/[funnelId]/route.ts
// Este arquivo lida com as operações GET (por ID), PUT e DELETE para um funil específico

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

export async function GET(
  request: NextRequest,
  context: { params: { funnelId: string } }
) {
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
    console.error('Falha ao buscar funil específico no backend:', error);
    if (error instanceof Error && error.name === 'JWSInvalid') {
      return NextResponse.json({ error: "Token de autenticação inválido" }, { status: 401 });
    }
    return NextResponse.json({ error: 'Falha interna ao buscar funil. Tente novamente mais tarde.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { funnelId: string } }
) {
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
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erro ao analisar o corpo da requisição para PUT /api/funnels/[id]:', parseError);
      return NextResponse.json({ error: 'Corpo da requisição inválido. Esperado JSON.' }, { status: 400 });
    }

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
    console.error('Falha ao atualizar funil no backend:', error);
    if (error instanceof Error && error.name === 'JWSInvalid') {
      return NextResponse.json({ error: "Token de autenticação inválido" }, { status: 401 });
    }
    return NextResponse.json({ error: 'Falha interna ao atualizar funil. Tente novamente mais tarde.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { funnelId: string } }
) {
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
      where: {
        id: funnelId,
      },
    });

    return NextResponse.json({ message: 'Funil excluído com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error('Falha ao excluir funil no backend:', error);
    if (error instanceof Error && error.name === 'JWSInvalid') {
      return NextResponse.json({ error: "Token de autenticação inválido" }, { status: 401 });
    }
    return NextResponse.json({ error: 'Falha interna ao excluir funil. Tente novamente mais tarde.' }, { status: 500 });
  }
}
