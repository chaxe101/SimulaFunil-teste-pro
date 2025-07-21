
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ContentPreviewModalProps {
  content: {
    type: string;
    src: string;
  } | null;
  onClose: () => void;
}

const PdfPreview = ({ src }: { src: string }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (src.startsWith('data:application/pdf;base64,')) {
      const base64String = src.split(',')[1];
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    }
  }, [src]);

  if (!pdfUrl) {
    return <p className="text-foreground">Carregando PDF...</p>;
  }

  return (
    <iframe
      src={pdfUrl}
      title="PDF Preview"
      className="w-full h-full border-0"
    ></iframe>
  );
};


export function ContentPreviewModal({ content, onClose }: ContentPreviewModalProps) {

  if (!content) {
    return null;
  }

  const renderContent = () => {
    const srcToUse = content.src;
      
    switch (content.type) {
      case 'landing':
      case 'vsl':
      case 'checkout':
        return (
            <iframe src={srcToUse} title="Website Preview" className="w-full h-full border-0" />
        );
      case 'imagem':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-black/50">
            <Image src={srcToUse} alt="Image Preview" fill style={{ objectFit: 'contain' }} />
          </div>
        );
      case 'video':
        return (
          <div className="w-full h-full bg-black flex items-center justify-center">
             <video src={srcToUse} controls autoPlay className="max-w-full max-h-full" />
          </div>
        );
      case 'audio':
        return <div className="p-8 flex items-center justify-center h-full"><audio src={srcToUse} controls autoPlay className="w-full" /></div>;
      case 'pdf':
        return <PdfPreview src={srcToUse} />;
      default:
        return <p>Unsupported content type.</p>;
    }
  };

  const getTitle = () => {
     switch (content.type) {
      case 'landing':
      case 'vsl':
      case 'checkout':
        return "Pré-visualização do Site";
      case 'imagem':
        return "Pré-visualização da Imagem";
      case 'video':
        return "Pré-visualização do Vídeo";
      case 'audio':
        return "Pré-visualização do Áudio";
      case 'pdf':
        return "Pré-visualização do PDF";
      default:
        return "Pré-visualização do Conteúdo";
    }
  }
  
  const getDescription = () => {
    if (['landing', 'vsl', 'checkout'].includes(content.type)) {
      return <>Esta é uma pré-visualização interativa. Alguns sites podem não funcionar corretamente devido a restrições de segurança. <a href={content.src} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Abrir em nova aba</a>.</>;
    }
    return null;
  }

  return (
    <Dialog open={!!content} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <DialogTitle>{getTitle()}</DialogTitle>
          {getDescription() && <DialogDescription>{getDescription()}</DialogDescription>}
        </DialogHeader>
        <div className="p-0 flex-grow h-full bg-muted flex items-center justify-center">
            {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
