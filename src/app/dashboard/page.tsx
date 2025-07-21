
"use client";

import { useState, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  CalendarDays,
  Blocks,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type FunnelStatus = "all" | "active" | "draft";
type Funnel = {
  id: string;
  name: string;
  updatedAt: string;
  nodes: any[];
  status: FunnelStatus;
};

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();

  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FunnelStatus>("all");
  const [isCreateFunnelOpen, setCreateFunnelOpen] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState("");
  const [userName, setUserName] = useState("Usuário");

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      const namePart = email.split('@')[0];
      setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
    }

    const fetchFunnels = async () => {
      const token = localStorage.getItem("token");
      // The layout now handles the redirection, so we can assume token exists here.
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("/api/funnels", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          toast({ variant: "destructive", title: "Sessão expirada", description: "Faça login novamente." });
          localStorage.removeItem('token');
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Falha ao buscar funis");
        }

        const data = await response.json();
        setFunnels(data.map((f: any) => ({ ...f, status: 'active' }))); // Assuming all fetched funnels are active for now
      } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar seus funis." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunnels();
  }, [router, toast]);

  const filteredFunnels = funnels.filter(funnel => 
    activeTab === 'all' || funnel.status === activeTab
  );
  
  const handleCreateFunnel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !newFunnelName.trim()) return;

    try {
      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newFunnelName, nodes: [], edges: [] }),
      });

      if (!response.ok) throw new Error('Falha ao criar funil');

      const newFunnel = await response.json();
      setCreateFunnelOpen(false);
      setNewFunnelName("");
      router.push(`/editor/${newFunnel.id}`);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar o funil." });
    }
  };

  const handleDeleteFunnel = async (funnelId: string) => {
    if (!confirm("Tem certeza que deseja deletar este funil? Esta ação não pode ser desfeita.")) {
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Falha ao deletar funil');
      
      setFunnels(funnels.filter(f => f.id !== funnelId));
      toast({ title: "Sucesso", description: "Funil deletado com sucesso." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível deletar o funil." });
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            const funnelData = JSON.parse(content);
            if (funnelData.nodes && funnelData.edges) {
              const token = localStorage.getItem('token');
              if (!token) {
                 router.push("/login");
                 return;
              }
              const response = await fetch('/api/funnels', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: file.name.replace('.json', ''), ...funnelData }),
              });
              if (!response.ok) throw new Error('Falha ao importar funil');
              const newFunnel = await response.json();
              router.push(`/editor/${newFunnel.id}`);
            } else {
              toast({ variant: "destructive", title: "Erro de importação", description: "Arquivo JSON inválido. A estrutura do funil não foi encontrada." });
            }
          } catch (error) {
            toast({ variant: "destructive", title: "Erro de importação", description: "Erro ao ler o arquivo JSON. Verifique se o arquivo está no formato correto." });
          }
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Olá, {userName} 👋</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-headline">Meus Funis</h2>
            <p className="text-muted-foreground">Gerencie seus funis de conversão</p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar funis..."
                className="w-full rounded-lg bg-card pl-8 sm:w-[200px] lg:w-[250px]"
              />
            </div>
             <Button variant="secondary" className="hidden sm:inline-flex" asChild>
               <Label htmlFor="upload-funnel-json" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Carregar Códigos
                </Label>
            </Button>
            <input 
              type="file" 
              id="upload-funnel-json" 
              accept="application/json" 
              className="hidden"
              onChange={handleFileUpload}
            />
             <Dialog open={isCreateFunnelOpen} onOpenChange={setCreateFunnelOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Novo Funil
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                 <form onSubmit={handleCreateFunnel}>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Funil</DialogTitle>
                      <DialogDescription>
                        Dê um nome ao seu novo projeto de funil. Você poderá alterá-lo depois.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="funnel-name" className="text-right">
                          Nome
                        </Label>
                        <Input
                          id="funnel-name"
                          className="col-span-3"
                          placeholder="Ex: Lançamento de Produto X"
                          required
                          value={newFunnelName}
                          onChange={(e) => setNewFunnelName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        Criar Funil
                      </Button>
                    </DialogFooter>
                 </form>
              </DialogContent>
            </Dialog>
          </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FunnelStatus)}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="draft">Rascunhos</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredFunnels.length > 0 ? (
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFunnels.map((funnel) => (
              <Card key={funnel.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-semibold text-lg hover:text-primary">
                      <Link href={`/editor/${funnel.id}`}>{funnel.name}</Link>
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Mais</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive flex items-center gap-2 cursor-pointer" onClick={() => handleDeleteFunnel(funnel.id)}>
                            <Trash2 className="w-4 h-4" /> Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        Modificado em {new Date(funnel.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <Blocks className="w-4 h-4" />
                      <span>
                        {funnel.nodes?.length || 0} blocos
                      </span>
                    </div>
                    <Badge variant={funnel.status === 'active' ? 'default' : 'outline'} className={cn('capitalize w-fit', funnel.status === 'active' ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20')}>
                        {funnel.status === 'draft' ? 'Rascunho' : 'Ativo'}
                      </Badge>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="text-primary p-0" asChild>
                    <Link href={`/editor/${funnel.id}`}>Editar Funil</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
            <div className="text-center py-16 text-muted-foreground">
                <p>Nenhum funil encontrado.</p>
                <p className="mt-2">Que tal criar o seu primeiro?</p>
            </div>
        )}
        </div>
      </Tabs>
    </div>
  );
}
