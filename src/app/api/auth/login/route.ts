// src/app/api/auth/login/route.ts
// Este arquivo lida com as requisições POST para /api/auth/login

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Certifique-se de que '@/lib/prisma' resolve corretamente
import bcrypt from 'bcryptjs'; // Certifique-se de que 'bcryptjs' está instalado e seus tipos (@types/bcryptjs)
import { SignJWT } from 'jose'; // Para gerar JWTs. Certifique-se de ter 'jose' instalado.
import { z } from 'zod'; // Certifique-se de que 'zod' está instalado

// Definição do schema de validação para os dados de login
const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'), // Senha não pode ser vazia
});

// Chave secreta para assinar o JWT. DEVE ser a mesma usada em '@/lib/auth.ts'
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // É crucial que esta variável de ambiente esteja definida.
  // Em produção, use um segredo forte e complexo e NUNCA a exponha.
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Lida com as requisições POST para o login de usuários existentes.
 * @param request A requisição Next.js.
 * @returns Uma resposta JSON com o token JWT ou um erro.
 */
export async function POST(request: NextRequest) {
  try {
    // Tenta analisar o corpo da requisição como JSON
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erro ao analisar o corpo da requisição:', parseError);
      return NextResponse.json({ error: 'Corpo da requisição inválido. Esperado JSON.' }, { status: 400 });
    }

    // Valida os dados recebidos usando o schema Zod
    const parsedData = loginSchema.safeParse(body);

    if (!parsedData.success) {
      // Se a validação falhar, retorna os erros de validação
      console.error('Erro de validação dos dados de login:', parsedData.error.errors);
      return NextResponse.json({ errors: parsedData.error.errors }, { status: 400 });
    }

    const { email, password } = parsedData.data;

    // 1. Encontrar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
      // Inclui os campos 'plano' e 'expiresAt' na consulta
      select: {
        id: true,
        email: true,
        password: true, // Necessário para bcrypt.compare
        plano: true,
        expiresAt: true,
      }
    });

    if (!user) {
      // Se o usuário não for encontrado, retorna erro de credenciais inválidas
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    // 2. Comparar a senha fornecida com a senha com hash armazenada
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Se a senha não corresponder, retorna erro de credenciais inválidas
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    // 3. Gerar um JWT
    // Inclua 'plano' e 'expiresAt' no payload do JWT
    const token = await new SignJWT({
        id: user.id,
        plano: user.plano,
        expiresAt: user.expiresAt ? user.expiresAt.toISOString() : null // Converte Date para string ISO ou null
    })
      .setProtectedHeader({ alg: 'HS256' }) // Algoritmo de assinatura
      .setIssuedAt() // Data de emissão
      .setExpirationTime('2h') // Tempo de vida do TOKEN JWT (ex: 2 horas)
      .sign(secretKey); // Assina o token com a chave secreta

    // 4. Retornar o token JWT e outras informações relevantes para o cliente
    return NextResponse.json({
        token,
        userEmail: user.email,
        userPlan: user.plano, // Envia o plano atual do usuário
        userExpiresAt: user.expiresAt ? user.expiresAt.toISOString() : null // Envia a data de expiração
    }, { status: 200 });
  } catch (error) {
    // Captura quaisquer outros erros inesperados durante o processo de login
    console.error('Erro inesperado no login do usuário:', error);
    return NextResponse.json(
      { error: 'Falha ao fazer login.', details: (error as Error).message },
      { status: 500 } // 500 Internal Server Error
    );
  }
}