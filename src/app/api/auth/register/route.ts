// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Tipagem explícita das chaves válidas (reusada do frontend)
type PlanoKey = 'free' | 'pro-semanal' | 'pro-mensal';

// Define o schema de validação para os dados de registro
const registerSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('Email inválido.').min(1, 'O email é obrigatório.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  // Adiciona 'plano' ao schema de validação
  plano: z.enum(['free', 'pro-semanal', 'pro-mensal'], {
    errorMap: () => ({ message: 'Plano inválido.' }),
  }).default('free'), // Adiciona um default caso não seja enviado, ou remova se for sempre obrigatório
});

// Função POST para lidar com o registro de novos usuários
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erro ao analisar o corpo da requisição para POST /api/auth/register:', parseError);
      return NextResponse.json({ error: 'Corpo da requisição inválido. Esperado JSON.' }, { status: 400 });
    }

    const parsedData = registerSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ errors: parsedData.error.errors }, { status: 400 });
    }

    // Destrutura também o 'plano'
    const { name, email, password, plano } = parsedData.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário com este email já existe.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Salva o campo 'plano' (consistente com schema.prisma)
        plano: plano, 
      },
      select: {
        id: true,
        name: true,
        email: true,
        plano: true, // Retorna o plano no select
        createdAt: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erro inesperado ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Falha ao registrar usuário. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}