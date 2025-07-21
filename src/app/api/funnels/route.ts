// src/app/api/funnels/route.ts
// Este arquivo lida com as operações GET (listar todos) e POST (criar novo funil)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importa a instância do Prisma Client
import { verifyToken } from '@/lib/auth'; // Sua função de autenticação para verificar JWT
import { z } from 'zod'; // Para validação de dados
import { Funnel } from '@prisma/client'; // <-- Agora este import DEVE funcionar!

// Define o schema de validação para a criação de um novo funil
const funnelSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  nodes: z.any().optional(), // Pode refinar este para um tipo mais específico se souber a estrutura
  edges: z.any().optional(), // Pode refinar este para um tipo mais específico se souber a estrutura
});

// Função GET para buscar todos os funis de um usuário autenticado
export async function GET(request: NextRequest) {
  // 1. Extrai o token do cabeçalho da requisição
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // 2. Verifica se o token está presente
  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  // 3. Verifica o token de autenticação passando a string do token
  const userPayload = await verifyToken(token); 

  // 4. Se o token não for válido ou o payload não contiver o ID do usuário
  if (!userPayload || typeof userPayload.id !== 'string') {
    return NextResponse.json({ error: 'Não autorizado. Token inválido ou ID do usuário ausente.' }, { status: 401 });
  }

  try {
    // Busca todos os funis associados ao ID do usuário autenticado
    const funnels = await prisma.funnel.findMany({
      where: {
        userId: userPayload.id,
      },
      orderBy: {
        updatedAt: 'desc', // Ordena os funis pelo mais recente
      },
    });

    // Mapeia os funis para converter as strings JSON de 'nodes' e 'edges' de volta para objetos/arrays
    const parsedFunnels = funnels.map((funnel: Funnel) => ({ 
      ...funnel,
      // Garante que 'nodes' e 'edges' são tratados como string antes de JSON.parse
      nodes: typeof funnel.nodes === 'string' && funnel.nodes ? JSON.parse(funnel.nodes) : [], 
      edges: typeof funnel.edges === 'string' && funnel.edges ? JSON.parse(funnel.edges) : [], 
    }));

    // Retorna os funis encontrados como JSON
    return NextResponse.json(parsedFunnels, { status: 200 });
  } catch (error) {
    console.error('Falha ao buscar funis no backend:', error);
    // Para erros de JWT, pode ser útil retornar um 401 específico
    if (error instanceof Error && error.name === 'JWSInvalid') {
      return NextResponse.json({ error: "Token de autenticação inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Falha interna ao buscar funis. Tente novamente mais tarde.' },
      { status: 500 } // Erro interno do servidor
    );
  }
}

// Função POST para criar um novo funil para um usuário autenticado
export async function POST(request: NextRequest) {
  // 1. Extrai o token do cabeçalho da requisição
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // 2. Verifica se o token está presente
  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  // 3. Verifica o token de autenticação passando a string do token
  const userPayload = await verifyToken(token); 

  // 4. Se o token não for válido ou o payload não contiver o ID do usuário
  if (!userPayload || typeof userPayload.id !== 'string') {
    return NextResponse.json({ error: 'Não autorizado. Token inválido ou ID do usuário ausente.' }, { status: 401 });
  }

  try {
    // Tenta analisar o corpo da requisição como JSON
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erro ao analisar o corpo da requisição para POST /api/funnels:', parseError);
      return NextResponse.json({ error: 'Corpo da requisição inválido. Esperado JSON.' }, { status: 400 });
    }

    // Valida os dados do funil com Zod
    const parsedData = funnelSchema.safeParse(body);

    if (!parsedData.success) {
      // Retorna erros de validação se os dados não corresponderem ao schema
      return NextResponse.json({ errors: parsedData.error.errors }, { status: 400 });
    }

    const { name, nodes, edges } = parsedData.data;

    // Cria um novo funil no banco de dados associado ao ID do usuário autenticado
    const newFunnel = await prisma.funnel.create({
      data: {
        name,
        // Converte 'nodes' e 'edges' para string JSON antes de salvar
        nodes: JSON.stringify(nodes || []), 
        edges: JSON.stringify(edges || []), 
        userId: userPayload.id, 
      },
    });

    // Retorna o funil criado com status 201 (Created)
    return NextResponse.json(newFunnel, { status: 201 });
  } catch (error) {
    console.error('Falha ao criar funil no backend:', error);
    if (error instanceof Error && error.name === 'JWSInvalid') {
      return NextResponse.json({ error: "Token de autenticação inválido" }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Falha interna ao criar funil. Tente novamente mais tarde.' },
      { status: 500 } // Erro interno do servidor
    );
  }
}