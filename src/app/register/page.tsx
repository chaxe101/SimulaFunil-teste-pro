'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Logo } from "@/components/logo";
// Importar componentes de seleção se você estiver usando Shadcn/ui ou similar
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adicionado para o seletor de plano

// Tipagem para os valores aceitos no variant do Badge
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined;

// Tipagem explícita das chaves válidas
type PlanoKey = 'free' | 'pro-semanal' | 'pro-mensal';

const planosInfo: Record<PlanoKey, { name: string; price: string; color: BadgeVariant }> = {
  free: { name: 'Free', price: 'R$ 0/mês', color: 'secondary' },
  'pro-semanal': { name: 'Pro Semanal', price: 'R$ 9,75/semana', color: 'default' },
  'pro-mensal': { name: 'Pro Mensal', price: 'R$ 34,90/mês', color: 'default' },
};

function isPlanoKey(value: string): value is PlanoKey {
  return ['free', 'pro-semanal', 'pro-mensal'].includes(value);
}

export default function RegistroPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryPlano = searchParams.get('plano');
  // Inicializa o plano com base na query param ou 'free'
  const initialPlano: PlanoKey = isPlanoKey(queryPlano || '') ? (queryPlano as PlanoKey) : 'free';
  
  // Estado para o plano selecionado pelo usuário no formulário
  const [selectedPlano, setSelectedPlano] = useState<PlanoKey>(initialPlano);

  const planoInfo = planosInfo[selectedPlano]; // Agora usa o plano do estado

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // O plano no formData agora é controlado pelo estado `selectedPlano`
    plano: selectedPlano, 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Atualiza o formData.plano se o `selectedPlano` mudar (ex: via seletor)
  useEffect(() => {
    setFormData((prev) => ({ ...prev, plano: selectedPlano }));
  }, [selectedPlano]);

  // Se o queryPlano mudar (ex: usuário volta para a página com outro param), atualiza o selectedPlano
  useEffect(() => {
    setSelectedPlano(initialPlano);
  }, [queryPlano, initialPlano]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          plano: formData.plano, // Usa o plano do formData, que reflete o selectedPlano
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (formData.plano === 'free') {
          router.push('/dashboard');
        } else {
          router.push(`/checkout?plano=${formData.plano}`);
        }
      } else {
        setError(data.error || 'Erro ao criar conta');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
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
            <CardTitle className="text-2xl font-headline">Criar Conta</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Plano selecionado:</span>
              <Badge variant={planoInfo.color}>
                {planoInfo.name} - {planoInfo.price}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              {/* Novo Seletor de Plano */}
              <div>
                <Label htmlFor="plano-select">Alterar Plano</Label>
                <Select value={selectedPlano} onValueChange={(value: PlanoKey) => setSelectedPlano(value)}>
                  <SelectTrigger id="plano-select">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(planosInfo).map((key) => {
                      const planoKey = key as PlanoKey;
                      const info = planosInfo[planoKey];
                      return (
                        <SelectItem key={planoKey} value={planoKey}>
                          {info.name} - {info.price}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {error && <div className="text-red-500 text-sm text-center">{error}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Fazer login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}