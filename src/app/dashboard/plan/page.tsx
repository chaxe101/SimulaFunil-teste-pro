"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Star, XCircle } from "lucide-react";
import { useRouter } from "next/navigation"; // Importe useRouter para navegação

export default function PlanPage() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null); // Pode ser null enquanto carrega
  const [isLoading, setIsLoading] = useState(true); // Novo estado para carregamento
  const [error, setError] = useState<string | null>(null); // Novo estado para erro
  const router = useRouter();

  const plans = [
    {
      name: "Free",
      id: "free",
      price: "R$ 0",
      period: "/mês",
      description: "Ideal para quem está começando e quer testar o simulador.",
      features: [
        { text: "2 funis ativos", included: true },
        { text: "Até 10 blocos por funil", included: true },
        { text: "Simulador visual (básico)", included: true },
        { text: "Salvar alterações no funil", included: true },
        { text: "Sem suporte", included: false },
        { text: "Sem exportação PDF", included: false },
      ],
      cta: "Seu Plano Atual",
      popular: false,
    },
    {
      name: "Pro Semanal",
      id: "pro-semanal",
      price: "R$ 9,75",
      period: "/semana",
      description: "Assinatura flexível semanal, com as mesmas vantagens do Pro.",
      features: [
        { text: "Até 15 funis ativos", included: true },
        { text: "Até 50 blocos por funil", included: true },
        { text: "Simulador visual (avançado)", included: true },
        { text: "Salvar alterações no funil", included: true },
        { text: "Exportar funil em PDF", included: true },
        { text: "Suporte via WhatsApp", included: true },
      ],
      cta: "Assinar Semanal",
      popular: false,
    },
    {
      name: "Pro Mensal",
      id: "pro-mensal",
      price: "R$ 34,90",
      period: "/mês",
      description: "Para quem já cria funis com frequência e quer economia.",
      features: [
        { text: "Até 15 funis ativos", included: true },
        { text: "Até 50 blocos por funil", included: true },
        { text: "Simulador visual (avançado)", included: true },
        { text: "Salvar alterações no funil", included: true },
        { text: "Exportar funil em PDF", included: true },
        { text: "Suporte via WhatsApp", included: true },
      ],
      cta: "Fazer Upgrade",
      popular: true,
    },
  ];

  const handlePlanChange = (planId: string) => {
    router.push(`/checkout?plano=${planId}`);
  };

  useEffect(() => {
    const fetchUserPlan = async () => {
      setIsLoading(true); // Inicia o carregamento
      setError(null); // Limpa erros anteriores
      try {
        // Tenta obter o token do localStorage
        const token = localStorage.getItem('token'); // Assumindo que o token é salvo aqui após o login

        // Se não houver token, define um erro e não tenta fazer a requisição
        if (!token) {
          throw new Error("Token de autenticação ausente. Faça login novamente.");
        }

        const response = await fetch("/api/user/plan", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Envia o token no cabeçalho Authorization
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao buscar plano do usuário.');
        }
        const data = await response.json();
        if (typeof data.plano === 'string') {
          setCurrentPlan(data.plano.toLowerCase().replace(' ', '-'));
        } else {
          setCurrentPlan("free");
          console.warn("Plano retornado pela API não é uma string:", data.plano);
        }
      } catch (err: any) {
        console.error("Erro ao buscar plano do usuário:", err);
        setError(err.message || "Não foi possível carregar o plano. Tente novamente.");
        setCurrentPlan("free"); // Em caso de erro, assume o plano 'free' como fallback
        // Opcional: Se o erro for de autenticação, redirecionar para o login
        if (err.message.includes("Token ausente") || err.message.includes("Token inválido")) {
            router.push('/login'); // Redireciona para a página de login
        }
      } finally {
        setIsLoading(false); // Finaliza o carregamento
      }
    };

    fetchUserPlan();
  }, [router]); // Adicionado `router` como dependência para o redirecionamento

  // Formata o nome do plano para exibição no cabeçalho
  const formattedCurrentPlanName = currentPlan
    ? currentPlan.replace('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    : 'Carregando...';

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Planos e Faturamento</CardTitle>
          <CardDescription>
            Gerencie sua assinatura e detalhes de faturamento. Você está
            atualmente no plano{" "}
            <strong>
              {isLoading ? "Carregando..." : formattedCurrentPlanName}
            </strong>
            .
          </CardDescription>
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              return (
                <Card
                  key={plan.name}
                  className={`flex flex-col ${
                    plan.popular ? "border-primary" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="flex items-center justify-center gap-2 text-center py-1 bg-primary text-primary-foreground font-bold rounded-t-lg">
                      <Star className="w-4 h-4" />
                      Mais Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">
                      {plan.name}
                    </CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <CardDescription className="h-10">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <ul className="space-y-4 flex-grow">
                      {plan.features.map((feature) => (
                        <li
                          key={feature.text}
                          className={`flex items-center gap-3 ${
                            !feature.included
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 flex-shrink-0" />
                          )}
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-8 w-full"
                      variant={plan.popular ? "default" : "secondary"}
                      disabled={isCurrent}
                      onClick={() => handlePlanChange(plan.id)}
                    >
                      {isCurrent ? "Seu Plano Atual" : plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}