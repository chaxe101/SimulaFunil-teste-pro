// src/lib/auth.ts
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma'; // Adicione esta importação para usar o Prisma Client
import dayjs from 'dayjs'; // Adicione esta importação para manipulação de datas

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Codifica a chave secreta uma vez para uso na verificação
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Alterada a assinatura da função para receber APENAS a string do token
export async function verifyToken(token: string): Promise<any | null> { // Use 'any' para o payload se a estrutura for variada, ou defina uma interface específica
  if (!token) {
    return null; // Nenhum token fornecido
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);

    // --- Lógica de verificação do plano e expiração ---
    // 1. Busca o usuário do banco de dados para obter o status e a data de expiração mais atualizados
    // Assume que o payload do JWT tem um 'id' que corresponde ao userId
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        plano: true,
        expiresAt: true,
      }
    });

    if (!user) {
      console.error('JWT Verification Error: Usuário não encontrado no DB para o token fornecido.');
      return null; // Usuário não existe mais ou ID inválido no token
    }

    // 2. Verifica se o plano do usuário é pago e se já expirou
    if (user.plano !== 'free' && user.expiresAt && dayjs().isAfter(dayjs(user.expiresAt))) {
      // Se o plano expirou:
      // a) Rebaixa o plano do usuário no banco de dados para 'free'
      // b) Remove a data de expiração
      await prisma.user.update({
        where: { id: user.id },
        data: { plano: 'free', expiresAt: null },
      });
      console.warn(`Usuário ${user.id} com plano '${user.plano}' expirado. Rebaixado para 'free'.`);
      return null; // Nega o acesso porque o plano expirou
    }

    // 3. Se o token for válido e o plano não expirou, retorna o payload
    // Atualiza o payload para incluir o status do plano mais recente do DB
    // (Caso o plano tenha sido alterado ou o expiresAt atualizado em outro lugar)
    return { ...payload, plano: user.plano, expiresAt: user.expiresAt };

  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null; // Token inválido, expirado, etc.
  }
}