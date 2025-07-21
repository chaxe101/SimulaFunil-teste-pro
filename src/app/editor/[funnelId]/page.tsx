
'use client';

import { FunnelEditor } from '@/components/funnel-editor/editor';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import {
  Download,
  Loader2,
  Save,
  ChevronDown,
  LogOut,
  FileJson,
  Undo,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useEditorStore } from '@/stores/editor-store';
import { findBlockByType } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';

export default function EditorPage() {
  const params = useParams();
  const funnelId = Array.isArray(params.funnelId) ? params.funnelId[0] : params.funnelId;
  const router = useRouter();
  const { toast } = useToast();

  const [funnelName, setFunnelName] = useState('Carregando...');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { nodes, edges, setFunnelId, setNodes, setEdges, undoLastAction } = useEditorStore(state => ({
    nodes: state.nodes,
    edges: state.edges,
    setFunnelId: state.setFunnelId,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    undoLastAction: state.undoLastAction,
  }));

  const fetchFunnelData = useCallback(async () => {
    if (!funnelId || funnelId === 'new') {
        setFunnelName("Novo Funil");
        setNodes([]);
        setEdges([]);
        return;
    }

    const token = localStorage.getItem('token');
    // Redirection is handled by the layout now. We can assume the token exists.
    if (!token) return;

    try {
        const response = await fetch(`/api/funnels/${funnelId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 401) {
            toast({ variant: 'destructive', title: 'Sessão Expirada', description: 'Por favor, faça o login novamente.' });
            router.push('/login');
            return;
        }
        if (!response.ok) throw new Error('Falha ao buscar funil');

        const data = await response.json();
        setFunnelName(data.name);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os dados do funil.' });
        router.push('/dashboard');
    }
  }, [funnelId, router, setNodes, setEdges, toast]);


  useEffect(() => {
    // Check for token on mount, redirect if not found
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    setFunnelId(funnelId);
    fetchFunnelData();
  }, [funnelId, setFunnelId, fetchFunnelData, router]);

  const handleSave = useCallback(async () => {
    if (!funnelId || funnelId === 'new') {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não é possível salvar um novo funil sem ID.' });
        return;
    }
    setIsSaving(true);
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }
    
    try {
        const response = await fetch(`/api/funnels/${funnelId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: funnelName, nodes, edges })
        });
        
        if (!response.ok) throw new Error('Falha ao salvar o funil.');

        toast({ title: 'Sucesso', description: 'Funil salvo com sucesso!' });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar o funil.' });
    } finally {
        setIsSaving(false);
    }
  }, [funnelId, funnelName, nodes, edges, router, toast]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    const funnelCanvas = document.querySelector<HTMLElement>('.react-flow');
    const controls = document.querySelector<HTMLElement>('.react-flow__controls');
    const minimap = document.querySelector<HTMLElement>('.react-flow__minimap');
    
    if (!funnelCanvas) {
      console.error('Canvas element not found');
      setIsDownloading(false);
      return;
    }

    if (controls) controls.style.visibility = 'hidden';
    if (minimap) minimap.style.visibility = 'hidden';
    
    try {
      const canvas = await html2canvas(funnelCanvas, {
        useCORS: true,
        scale: 1.5,
        backgroundColor: null,
      });

      if (controls) controls.style.visibility = 'visible';
      if (minimap) minimap.style.visibility = 'visible';

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
        hotfixes: ['px_scaling'],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      if (nodes.length > 0) {
        pdf.addPage('a4', 'portrait');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text('Detalhes dos Blocos do Funil', 20, 30);

        let y = 50;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pdf.internal.pageSize.getWidth() - (margin * 2);

        nodes.forEach((node) => {
          const blockInfo = findBlockByType(node.data.type);
          if (!blockInfo) return;

          const blockDetails: { key: string; value: string }[] = [];
          if (node.data.url) blockDetails.push({ key: 'URL/Link', value: node.data.url });
          if (node.data.fileName) blockDetails.push({ key: 'Arquivo', value: node.data.fileName });
          if (node.data.value) blockDetails.push({ key: 'Valor', value: `R$ ${node.data.value}` });
          if (node.data.subject) blockDetails.push({ key: 'Assunto do E-mail', value: node.data.subject });
          if (node.data.message) blockDetails.push({ key: 'Mensagem', value: node.data.message });
          if (node.data.notesText) blockDetails.push({ key: 'Conteúdo', value: node.data.notesText });

          if (blockDetails.length === 0) return;

          let blockHeight = 25;
          pdf.setFontSize(10);
          blockDetails.forEach(detail => {
              const textLines = pdf.splitTextToSize(`${detail.key}: ${detail.value}`, contentWidth - 10);
              blockHeight += (textLines.length * 5) + 3;
          });
          
          if (y + blockHeight > pageHeight - margin) {
            pdf.addPage('a4', 'portrait');
            y = 30;
          }
          
          pdf.setFillColor(248, 249, 250);
          pdf.setDrawColor(222, 226, 230);
          pdf.roundedRect(margin - 5, y - 13, contentWidth + 10, blockHeight, 3, 3, 'FD');

          let currentY = y;

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.setTextColor(49, 53, 59);
          pdf.text(node.data.label || blockInfo.label, margin, currentY);
          currentY += 12;
          
          blockDetails.forEach(detail => {
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(10);
              pdf.setTextColor(108, 117, 125);
              
              const keyText = `${detail.key}: `;
              const keyWidth = pdf.getStringUnitWidth(keyText) * pdf.getFontSize() / pdf.internal.scaleFactor;
              
              pdf.text(keyText, margin, currentY);

              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(49, 53, 59);
              const valueLines = pdf.splitTextToSize(detail.value, contentWidth - 10 - keyWidth);
              pdf.text(valueLines, margin + keyWidth, currentY);
              currentY += valueLines.length * 5 + 3;
          });

          y += blockHeight + 15;
        });
      }

      pdf.save(`Funil - ${funnelName}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      if (controls) controls.style.visibility = 'visible';
      if (minimap) minimap.style.visibility = 'visible';
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveAndExit = async () => {
    await handleSave();
    router.push('/dashboard');
  };

  const handleExportJson = () => {
    const funnelData = {
      name: funnelName,
      nodes,
      edges,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(funnelData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `funil-${funnelName.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
  };

  // Render a loader while we check for auth token
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex h-[60px] items-center border-b px-6 bg-sidebar shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">SimulaFunil</span>
        </Link>
        <div className="flex items-center gap-4 mx-6">
          <span className="h-6 w-px bg-border"></span>
          <h1 className="text-lg font-medium">
            Projeto: {funnelName}
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={() => undoLastAction()} title="Desfazer (Ctrl+Z)">
              <Undo className="h-5 w-5" />
              <span className="sr-only">Desfazer</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownloadPDF} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            <span className="sr-only">Baixar PDF</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                Salvar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
               <DropdownMenuItem onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                <span>Salvar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSaveAndExit}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Salvar e sair</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJson}>
                <FileJson className="mr-2 h-4 w-4" />
                <span>Exportar JSON</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-grow overflow-hidden relative">
        <FunnelEditor funnelId={funnelId} />
      </main>
    </div>
  );
}
