'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Logo } from "@/components/logo";

// Reutilize as tipagens e informações do plano
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined;
type PlanoKey = 'free' | 'pro-semanal' | 'pro-mensal';

const planosInfo: Record<PlanoKey, { name: string; price: string; color: BadgeVariant }> = {
  free: { name: 'Free', price: 'R$ 0/mês', color: 'secondary' },
  'pro-semanal': { name: 'Pro Semanal', price: 'R$ 9,75/semana', color: 'default' },
  'pro-mensal': { name: 'Pro Mensal', price: 'R$ 34,90/mês', color: 'default' },
};

function isPlanoKey(value: string): value is PlanoKey {
  return ['free', 'pro-semanal', 'pro-mensal'].includes(value);
}

// **Objeto com as URLs de Checkout fornecidas**
const checkoutUrls: Record<Exclude<PlanoKey, 'free'>, { credit_card: string; pix: string }> = {
  'pro-semanal': {
    credit_card: 'https://buy.stripe.com/fZu6oz62I6zuf0o5HJgQE00',
    pix: 'https://www.ggcheckout.com/checkout/v2/QD4oB6snCxXhmjwvO8jy'
  },
  'pro-mensal': {
    credit_card: 'https://buy.stripe.com/6oUeV51Ms2je9G4dabgQE01',
    pix: 'https://www.ggcheckout.com/checkout/v2/iDfALZmTI1sEGjBt5deW'
  }
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryPlano = searchParams.get('plano');
  const planoSelecionado: PlanoKey = isPlanoKey(queryPlano || '') ? (queryPlano as PlanoKey) : 'free';
  const planoInfo = planosInfo[planoSelecionado];

  // Verifica se o plano é válido para checkout (não 'free')
  // Se não for válido, redireciona para a página de registro
  if (!planoSelecionado || planoSelecionado === 'free') {
    router.replace('/registro');
    return null; // Renderiza nada enquanto redireciona
  }

  const handlePayment = (method: 'pix' | 'credit_card') => {
    // Busca as URLs específicas para o plano selecionado
    const urls = checkoutUrls[planoSelecionado];

    if (!urls) {
      console.error(`URLs de checkout não encontradas para o plano: ${planoSelecionado}`);
      // Poderia mostrar um erro para o usuário ou redirecionar para uma página de erro
      return;
    }

    let redirectToUrl: string = '';

    if (method === 'pix') {
      redirectToUrl = urls.pix;
    } else if (method === 'credit_card') {
      redirectToUrl = urls.credit_card;
    }

    if (redirectToUrl) {
      // Redireciona o usuário para a URL de checkout externa
      // Importante: use window.location.href para redirecionamentos externos
      window.location.href = redirectToUrl;
    } else {
      console.error(`URL de redirecionamento não definida para ${method} no plano ${planoSelecionado}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Logo className="h-10 w-10 text-primary" />
          <span className="text-4xl font-headline font-bold">SimulaFunil</span>
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Finalizar Pagamento</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Plano selecionado:</span>
              <Badge variant={planoInfo.color}>
                {planoInfo.name} - {planoInfo.price}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Escolha como deseja pagar o seu plano. Você será redirecionado para uma página segura de pagamento.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full h-12 text-lg" onClick={() => handlePayment('pix')}>
              Pagar com Pix
            </Button>
            <Button className="w-full h-12 text-lg" onClick={() => handlePayment('credit_card')}>
              Pagar com Cartão de Crédito
            </Button>
            {/* Você pode adicionar outras opções de pagamento aqui */}
          </CardContent>
          <CardContent className="text-center text-sm text-muted-foreground">
             <Link href="/register" className="text-primary hover:underline">
               Voltar e escolher outro plano
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}