import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Configurações</CardTitle>
        <CardDescription>
          Gerencie as configurações da sua conta e da aplicação aqui.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">As opções de configuração estarão disponíveis aqui em breve.</p>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button disabled>Salvar</Button>
      </CardFooter>
    </Card>
  );
}
