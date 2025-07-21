// src/app/api/user/plan/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth"; // Sua função para verificar o JWT

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    }

    // Agora, verifyToken espera e recebe APENAS a string do token
    const payload = await verifyToken(token);
    
    // É importante que o payload tenha um 'id' para identificar o usuário
    if (!payload || typeof payload.id !== 'string') { // Verificação de tipo mais robusta para payload.id
      return NextResponse.json({ error: "Token inválido ou ID do usuário ausente" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id }, // Usa o ID do usuário do payload
      select: { plano: true }, // Garante que está buscando 'plano'
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Retorna o plano do usuário. Se for null/undefined no DB, retorna 'free' como fallback
    return NextResponse.json({ plano: user.plano || "free" });
  } catch (error) {
    console.error("[GET_PLAN_ERROR]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}