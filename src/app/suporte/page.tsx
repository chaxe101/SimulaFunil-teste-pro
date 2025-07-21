'use client'

import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SuportePage() {
  const [formType, setFormType] = useState<'ajuda' | 'sugestao' | null>(null)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4 space-y-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold">Central de Suporte</CardTitle>
          <CardDescription>
            Estamos aqui para te ajudar. Escolha abaixo a melhor forma de entrar em contato.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* WhatsApp */}
          <div className="text-center">
            <h3 className="text-lg font-semibold">Falar via WhatsApp</h3>
            <p className="text-sm text-muted-foreground">
              Atendimento das 9h às 18h, de segunda a sexta.
            </p>
            <a
              href="https://api.whatsapp.com/send?phone=SEUNUMEROAQUI"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="mt-2 bg-green-500 hover:bg-green-600 text-white">
                Iniciar Conversa
              </Button>
            </a>
          </div>

          {/* Formulários */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Envie uma mensagem</h3>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setFormType('ajuda')} variant="outline">
                Ajuda
              </Button>
              <Button onClick={() => setFormType('sugestao')} variant="outline">
                Sugestão
              </Button>
            </div>

            {formType === 'ajuda' && (
              <div className="mt-6">
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLSce9vL-TcwKKCf42alnYRsRTtemtdySbpc-0QchJJSh00yBEw/viewform?embedded=true"
                  width="100%"
                  height="500"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  className="rounded-lg border"
                >
                  Carregando…
                </iframe>
              </div>
            )}

            {formType === 'sugestao' && (
              <div className="mt-6">
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLSedF04fQfCT7WLUFLO7FAoK6OCkV3X2rBHbgruJhhSrQi5GaQ/viewform?embedded=true"
                  width="100%"
                  height="500"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  className="rounded-lg border"
                >
                  Carregando…
                </iframe>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botão Voltar para Início */}
      <Link href="/">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          ← Voltar para o Início
        </Button>
      </Link>
    </main>
  )
}
