"use client";

import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Check, Star, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
    cta: "Começar Grátis",
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
    cta: "Escolher Semanal",
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
    cta: "Escolher Mensal",
    popular: true,
  },
];

export default function PublicPlansPage() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4 font-headline">Escolha seu Plano</h1>
      <p className="text-center text-muted-foreground mb-10">
        Comece agora com o plano ideal para sua jornada.
      </p>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${plan.popular ? "border-primary" : ""}`}
          >
            {plan.popular && (
              <div className="flex items-center justify-center gap-2 text-center py-1 bg-primary text-primary-foreground font-bold rounded-t-lg">
                <Star className="w-4 h-4" />
                Mais Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <CardDescription className="h-10">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <ul className="space-y-4 flex-grow">
                {plan.features.map((feature) => (
                  <li
                    key={feature.text}
                    className={`flex items-center gap-3 ${
                      !feature.included ? "text-muted-foreground line-through" : ""
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
                onClick={() => router.push(`/register?plano=${plan.id}`)}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
