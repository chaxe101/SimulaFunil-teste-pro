import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Filter, GitBranch, LayoutGrid, Lightbulb, MousePointer2, PlayCircle, Rocket, Share2, ShoppingCart, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LandingPageSimulator } from "@/components/landing-page-simulator";

const whyUseFeatures = [
  {
    icon: <LayoutGrid className="h-8 w-8 text-primary" />,
    title: "Planejamento Visual",
    description: "Veja seu funil completo de forma clara antes de construir.",
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: "Identificação de Falhas",
    description: "Encontre possíveis lacunas e pontos de abandono na jornada.",
  },
  {
    icon: <Share2 className="h-8 w-8 text-primary" />,
    title: "Comunicação Eficiente",
    description: "Compartilhe sua estratégia visualmente com equipe e clientes.",
  },
];

const howItWorksSteps = [
  {
    icon: <MousePointer2 className="h-8 w-8 text-primary" />,
    title: "Arraste os blocos",
    description: "Escolha landing pages, VSLs, formulários, checkouts e mais.",
  },
  {
    icon: <GitBranch className="h-8 w-8 text-primary" />,
    title: "Conecte os elementos",
    description: "Crie os fluxos entre as etapas com um simples clique.",
  },
  {
    icon: <PlayCircle className="h-8 w-8 text-primary" />,
    title: "Simule a jornada",
    description: "Navegue pelo funil como se fosse um visitante.",
  },
];

const journeyFeatures = [
  "Crie múltiplos caminhos baseados em diferentes ações do usuário.",
  "Visualize pontos de saída e oportunidades de engajamento.",
  "Teste diferentes estruturas de funil antes de implementar.",
];

const useCases = [
  { icon: <Rocket className="h-6 w-6 text-primary" />, title: "Lançamentos Digitais", description: "Do planejamento ao pós-venda, planeje cada etapa da jornada." },
  { icon: <Users className="h-6 w-6 text-primary" />, title: "Funis de Afiliados", description: "Otimize o caminho do conteúdo até a recomendação de produto." },
  { icon: <ShoppingCart className="h-6 w-6 text-primary" />, title: "E-commerces", description: "Do clique no anúncio à recompra, otimize a jornada." },
  { icon: <Filter className="h-6 w-6 text-primary" />, title: "Captação de Leads", description: "Da isca digital à nutrição e conversão." },
];

const plans = [
  {
    name: "Free",
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
    popular: false,
  },
  {
    name: "Pro Semanal",
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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-2xl font-headline font-bold">SimulaFunil</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#how" className="text-sm font-medium text-muted-foreground hover:text-foreground">Como Funciona</Link>
          <Link href="/suporte" className="text-sm font-medium text-muted-foreground hover:text-foreground">Suporte</Link>
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Login</Link>
          <Button asChild>
            <Link href="/login">Começar Grátis</Link>
          </Button>
        </nav>
        <nav className="md:hidden">
          <Button variant="outline" asChild>
            <Link href="/login">Começar Grátis</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section id="hero" className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline">
              Visualize sua estratégia de funil<br/>antes de implementá-la
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Planeje jornadas de conversão mais eficientes com uma ferramenta de simulação visual.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/login">Criar meu primeiro funil <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="mt-12 md:mt-16 px-4">
              <LandingPageSimulator />
            </div>
          </div>
        </section>

        <section id="why" className="py-20 bg-card/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center">Por que usar o SimulaFunil?</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {whyUseFeatures.map((feature, index) => (
                <Card key={index} className="bg-card/50 border-border/50 text-center p-4">
                  <CardHeader className="items-center">
                    <div className="bg-primary/10 p-3 rounded-full">
                      {feature.icon}
                    </div>
                    <CardTitle className="mt-4 font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center">Monte seu funil em 3 passos simples</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {howItWorksSteps.map((step) => (
                <Card key={step.title} className="bg-card text-center">
                  <CardHeader className="items-center p-6">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      {step.icon}
                    </div>
                    <CardTitle className="font-headline text-xl mt-4">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="journey" className="py-20 bg-card/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Visualize toda a jornada do cliente em um único lugar</h2>
                <ul className="space-y-4 text-left">
                  {journeyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <span className="text-lg text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="use-cases" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center">Ideal para diversos fluxos de conversão</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {useCases.map((useCase) => (
                <Card key={useCase.title} className="bg-card p-2">
                  <CardHeader className="flex-row items-center gap-4">
                    {useCase.icon}
                    <CardTitle className="font-headline text-lg m-0">{useCase.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm">{useCase.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-card/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center">Escolha o plano ideal para você</h2>
            <p className="mt-4 max-w-2xl mx-auto text-center text-muted-foreground">
              Comece gratuitamente e evolua conforme suas necessidades.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <Card key={plan.name} className={`flex flex-col bg-card ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''}`}>
                  <CardHeader className="p-6">
                    <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                    <p className="text-muted-foreground h-10">{plan.description}</p>
                    <div className="flex items-baseline gap-1 pt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-6 pt-0">
                    <ul className="space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className={`flex items-center gap-2 ${!feature.included ? 'text-muted-foreground line-through' : ''}`}>
                          {feature.included ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <XCircle className="h-5 w-5 flex-shrink-0" />}
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 mt-auto">
                    {/* Alterado de '/registro' para '/register' */}
                    <Button className="w-full" size="lg" variant={plan.popular ? 'default' : 'secondary'} asChild>
                      <Link href={`/register?plano=${plan.name.toLowerCase().replace(' ', '-')}`}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section id="cta-final" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Pare de construir funis às cegas</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Em menos de 5 minutos, visualize seu funil completo.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/login">Criar minha conta gratuita</Link>
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">Não é necessário cartão de crédito.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-headline font-bold">SimulaFunil</span>
          </div>
          <div className="flex gap-4">
            <Link href="/suporte" className="text-muted-foreground hover:text-foreground text-sm">Suporte</Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm">Login</Link>
          </div>
          <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} SimulaFunil. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}