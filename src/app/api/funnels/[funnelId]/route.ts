// src/app/api/funnels/[funnelId]/route.ts
// Este arquivo lida com as operações GET (por ID), PUT e DELETE para um funil específico

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importa a instância do Prisma Client
import { verifyToken } from '@/lib/auth'; // Sua função de autenticação para verificar JWT
import { z } from 'zod'; // Para validação de dados
import { Funnel } from '@prisma/client'; // Importa o tipo Funnel do Prisma Client

// Define o schema de validação para a atualização de um funil
const funnelUpdateSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.').optional(),
  nodes: z.any().optional(),
  edges: z.any().optional(),
});

// Função GET para buscar um funil específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { funnelId: string } } // Obtém o funnelId da URL dinâmica
) {
  // Não é necessário 'await params', params já é um objeto
  const { funnelId } = params;

  // 1. Extrai o token do cabeçalho da requisição
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // 2. Verifica se o token está presente
  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  // 3. Verifica o token de autenticação passando a string do token
  const userPayload = await verifyToken(token); // CORREÇÃO AQUI: Passa a string do token

  // 4. Se o token não for válido ou o payload não contiver o ID do usuário
  if (!userPayload || typeof userPayload.id !== 'string') { // CORREÇÃO AQUI: Usando userPayload.id
    return NextResponse.json({ error: 'Não autorizado. Token inválido ou ID do usuário ausente.' }, { status: 401 });
  }

  try {
    // Busca o funil pelo ID e garante que ele pertence ao usuário autenticado
    const funnel = await prisma.funnel.findFirst({
      where: {
        id: funnelId,
        userId: userPayload.id, // CORREÇÃO AQUI: Usando userPayload.id
      },
    });

    if (!funnel) {
      // Se o funil não for encontrado ou não pertencer ao usuário, retorna 404
      return NextResponse.json({ error: 'Funil não encontrado ou você não tem permissão para acessá-lo.' }, { status: 404 });
    }

    // Converte as strings JSON de 'nodes' e 'edges' de volta para objetos/arrays
    const parsedFunnel = {
      ...funnel,
      nodes: typeof funnel.nodes === 'string' && funnel.nodes ? JSON.parse(funnel.nodes) : [],
      edges: typeof funnel.edges === 'string' && funnel.edges ? JSON.parse(funnel.edges) : [],
    };

    // Retorna o funil encontrado e parseado
    return NextResponse.json(parsedFunnel, { status: 200 });
  } catch (error) {
    console.error('Falha ao buscar funil específico no backend:', error);
    if (error instanceof Error && error.name === 'JWSInvalid') {
      return NextResponse.json({ error: "Token de autenticação inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Falha interna ao buscar funil. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}

// Função PUT para atualizar um funil específico por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { funnelId: string } }
) {
  // Não é necessário 'await params', params já é um objeto
  const { funnelId } = params;

  // 1. Extrai o token do cabeçalho da requisição
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // 2. Verifica se o token está presente
  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  // 3. Verifica o token de autenticação passando a string do token
  const userPayload = await verifyToken(token); // CORREÇÃO AQUI: Passa a string do token

  // 4. Se o token não for válido ou o payload não contiver o ID do usuário
  if (!userPayload || typeof userPayload.id !== 'string') { // CORREÇÃO AQUI: Usando userPayload.id
    return NextResponse.json({ error: 'Não autorizado. Token inválido ou ID do usuário ausente.' }, { status: 401 });
  }

  try {
    // Tenta analisar o corpo da requisição como JSON
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erro ao analisar o corpo da requisição para PUT /api/funnels/[id]:', parseError);
      return NextResponse.json({ error: 'Corpo da requisição inválido. Esperado JSON.' }, { status: 400 });
    }

    // Valida os dados da atualização com Zod
    const parsedData = funnelUpdateSchema.safeParse(body);

    if (!parsedData.success) {
      // Retorna erros de validação
      return NextResponse.json({ errors: parsedData.error.errors }, { status: 400 });
    }

    // Primeiro, verifique se o funil existe e pertence ao usuário antes de atualizar
    const existingFunnel = await prisma.funnel.findFirst({
      where: {
        id: funnelId,
        userId: userPayload.id, // CORREÇÃO AQUI: Usando userPayload.id
      },
    });

    if (!existingFunnel) {
      // Se o funil não for encontrado ou não pertencer ao usuário, retorna 404
      return NextResponse.json({ error: 'Funil não encontrado ou você não tem permissão para atualizá-lo.' }, { status: 404 });
    }

    // Converte 'nodes' e 'edges' para string JSON antes de salvar na atualização
    const dataToUpdate: { name?: string; nodes?: string; edges?: string } = {
      ...parsedData.data,
      nodes: parsedData.data.nodes ? JSON.stringify(parsedData.data.nodes) : JSON.stringify([]),
      edges: parsedData.data.edges ? JSON.stringify(parsedData.data.edges) : JSON.stringify([]),
    };
    
    // Remove propriedades undefined ou nulas para que o Prisma não tente atualizá-las para null
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);


    // Atualiza o funil no banco de dados
    const updatedFunnel = await prisma.funnel.update({
      where: {
        id: funnelId, // Usa o ID do funil da URL
      },
      data: dataToUpdate, // Atualiza com os dados convertidos
    });

    // Converte 'nodes' e 'edges' de volta para arrays antes de retornar o funil atualizado
    const parsedUpdatedFunnel = {
      ...updatedFunnel,
      nodes: typeof updatedFunnel.nodes === 'string' && updatedFunnel.nodes ? JSON.parse(updatedFunnel.nodes) : [],
      edges: typeof updatedFunnel.edges === 'string' && updatedFunnel.edges ? JSON.parse(updatedFunnel.edges) : [],
    };

    // Retorna o funil atualizado e parseado
    return NextResponse.json(parsedUpdatedFunnel, { status: 200 });
  } catch (error) {
    console.error('Falha ao atualizar funil no backend:', error);
    if (error instanceof Error && error.name === 'JWSInvalid') {
      return NextResponse.json({ error: "Token de autenticação inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Falha interna ao atualizar funil. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}

// Função DELETE para excluir um funil específico por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { funnelId: string } }
) {
  // Não é necessário 'await params', params já é um objeto
  const { funnelId } = params;

  // 1. Extrai o token do cabeçalho da requisição
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // 2. Verifica se o token está presente
  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  // 3. Verifica o token de autenticação passando a string do token
  const userPayload = await verifyToken(token); // CORREÇÃO AQUI: Passa a string do token

  // 4. Se o token não for válido ou o payload não contiver o ID do usuário
  if (!userPayload || typeof userPayload.id !== 'string') { // CORREÇÃO AQUI: Usando userPayload.id
    return NextResponse.json({ error: 'Não autorizado. Token inválido ou ID do usuário ausente.' }, { status: 401 });
  }

  try {
    // Primeiro, verifique se o funil existe e pertence ao usuário antes de deletar
    const existingFunnel = await prisma.funnel.findFirst({
      where: {
        id: funnelId,
        userId: userPayload.id, // CORREÇÃO AQUI: Usando userPayload.id
      },
    });

    if (!existingFunnel) {
      // Se o funil não for encontrado ou não pertencer ao usuário, retorna 404
      return NextResponse.json({ error: 'Funil não encontrado ou você não tem permissão para deletá-lo.' }, { status: 404 });
    }

    // Exclui o funil do banco de dados
    await prisma.funnel.delete({
      where: {
        id: funnelId, // Usa o ID do funil da URL
      },
    });

    // Retorna uma mensagem de sucesso
    return NextResponse.json({ message: 'Funil excluído com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error('Falha ao excluir funil no backend:', error);
    if (error instanceof Error && error.name === 'JWSInvalid') {
      return NextResponse.json({ error: "Token de autenticação inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Falha interna ao excluir funil. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}