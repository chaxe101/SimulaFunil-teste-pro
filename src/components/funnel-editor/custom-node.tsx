'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { findBlockByType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Expand, Trash2, Video, AudioLines, FileText, DollarSign, Mail as MailIcon, MessageSquare } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import Image from 'next/image';

const CustomNodeComponent = ({ data, id, selected }: NodeProps<{ type: string; label?: string, url?: string, fileSrc?: string, fileName?: string, notesText?: string, description?: string, value?: string, subject?: string, message?: string }>) => {
  const blockInfo = findBlockByType(data.type);
  const { setPreviewContent, deleteNode } = useEditorStore();

  if (!blockInfo) {
    return <div>Unknown block type</div>;
  }
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };
  
  if (data.type === 'notes') {
    return (
      <>
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />
        <div className={cn(
            "w-56 p-4 rounded-md shadow-lg font-sans relative",
            'bg-yellow-100 dark:bg-yellow-400/20 text-yellow-900 dark:text-yellow-200',
            selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
        )}>
            {selected && (
              <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-yellow-700 dark:text-yellow-200 hover:bg-black/10 hover:text-yellow-900 dark:hover:text-yellow-100" onClick={handleDelete} >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Deletar</span>
              </Button>
            )}
            <p className="whitespace-pre-wrap break-words text-sm">{data.notesText || 'Clique para adicionar uma anotação...'}</p>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
      </>
    );
  }
  
  const hasUrlInput = blockInfo.hasLink;
  const hasFileInput = ['image-upload', 'video-upload', 'audio-upload', 'pdf-upload', 'all-in-one'].includes(data.type);
  
  const hasUrlPreview = hasUrlInput && data.url;
  const hasFilePreview = hasFileInput && data.fileSrc;
  
  const hasContent = hasUrlPreview || hasFilePreview;

  const getPreviewType = () => {
      if (hasUrlPreview) {
        if (data.type === 'vsl') return 'vsl';
        if (data.type === 'landing-page') return 'landing';
        if (data.type === 'checkout') return 'checkout';
        return 'landing'; 
      }
      if (data.type === 'image-upload') return 'imagem';
      if (data.type === 'video-upload') return 'video';
      if (data.type === 'audio-upload') return 'audio';
      if (data.type === 'pdf-upload') return 'pdf';
      return null;
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const previewType = getPreviewType();
    if (!previewType) return;

    if (previewType === 'pdf' && data.fileSrc) {
        // Open PDF in new tab to avoid browser restrictions
        window.open(data.fileSrc, '_blank');
    } else {
        const contentToExpand = {
          type: previewType,
          src: (hasUrlPreview ? data.url! : data.fileSrc!)
        };
        setPreviewContent(contentToExpand);
    }
  }
    
  const displayDescription = data.description || blockInfo.description;
  
  const additionalData = [
    { key: 'value', value: data.value, icon: <DollarSign className="w-3 h-3 text-muted-foreground" /> },
    { key: 'subject', value: data.subject, icon: <MailIcon className="w-3 h-3 text-muted-foreground" /> },
    { key: 'message', value: data.message, icon: <MessageSquare className="w-3 h-3 text-muted-foreground" /> },
  ].filter(item => item.value);

  // Função auxiliar para limpar a URL para o thum.io
  const cleanUrlForThumIo = (url: string) => {
    if (!url) return '';
    // Remove qualquer ocorrência de 'http://' ou 'https://' no início da URL
    // Isso garante que a URL esteja no formato esperado pelo thum.io (sem protocolo)
    return url.replace(/^(https?:\/\/)/, '');
  };

  return (
    <div className="h-full w-full">
      <NodeResizer 
        color="#F43F5E" 
        isVisible={selected} 
        minWidth={256} 
        minHeight={150} 
      />
      <Handle type="target" position={Position.Top} className="!bg-accent" />
      <Card 
        className={cn(
          "border-2 transition-all bg-card w-full h-full flex flex-col",
          selected ? "border-primary shadow-lg shadow-primary/20" : "border-border"
        )} 
        style={{borderColor: selected ? blockInfo.color : undefined}}
      >
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-3 relative react-flow__drag-handle cursor-move shrink-0" style={{backgroundColor: `${blockInfo.color}1A`}}>
           <div style={{ color: blockInfo.color }}>
            {React.cloneElement(blockInfo.icon, { className: 'w-6 h-6' })}
          </div>
          <CardTitle className="text-base font-semibold truncate">{data.label || blockInfo.label}</CardTitle>
          {selected && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 z-10 h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Deletar</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-3 pt-2 space-y-2 flex-grow flex flex-col">
            
            {!hasContent ? (
              <div className="text-xs text-muted-foreground flex-grow space-y-2">
                {blockInfo.hasDescription && (
                    <p className="line-clamp-4">{displayDescription}</p>
                )}
                
                  {additionalData.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-border/50">
                      {additionalData.map(item => (
                        <div key={item.key} className="flex items-start gap-2">
                          {item.icon}
                          <span className="truncate flex-1">{item.key === 'value' ? `R$ ${item.value}` : item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                {(!blockInfo.hasDescription && additionalData.length === 0) && (
                      "Selecione para configurar."
                )}
              </div>
            ) : (
                <div className="relative w-full h-full flex-grow">
                    {hasContent && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 z-10 bg-black/50 hover:bg-black/75 text-white h-7 w-7"
                            onClick={handleExpandClick}
                        >
                            <Expand className="h-4 w-4" />
                            <span className="sr-only">Expandir</span>
                        </Button>
                    )}
                      {hasUrlPreview ? (
                        <div className="w-full h-full flex flex-col relative group">
                            <div className="w-full h-full rounded bg-muted flex items-center justify-center overflow-hidden">
                              <iframe
                                src={data.url}
                                className="w-full h-full rounded border border-border"
                                sandbox="allow-scripts allow-same-origin allow-forms"
                                loading="lazy"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground pt-2 truncate shrink-0">{data.url}</p>
                        </div>
                      ) : hasFilePreview ? (
                          (() => {
                              let previewContent;
                              if (data.type === 'image-upload') {
                              previewContent = <img alt="File Preview" className="aspect-video w-full h-full object-cover rounded" src={data.fileSrc!} />;
                              } else if (data.type === 'video-upload') {
                              previewContent = <div className="aspect-video w-full h-full rounded bg-muted flex items-center justify-center"><Video className="w-10 h-10 text-muted-foreground" /></div>;
                              } else if (data.type === 'audio-upload') {
                              previewContent = (
                                  <div className="w-full h-full rounded bg-muted flex flex-col items-center justify-center p-2 gap-2">
                                      <AudioLines className="w-10 h-10 text-muted-foreground" />
                                      <audio src={data.fileSrc!} controls className="w-full h-8"></audio>
                                  </div>
                              );
                              } else if (data.type === 'pdf-upload') {
                              previewContent = <div className="aspect-video w-full h-full rounded bg-muted flex items-center justify-center"><FileText className="w-10 h-10 text-muted-foreground" /></div>;
                              }
                              return (
                              <div className="h-full flex flex-col">
                                  <div className="flex-grow flex items-center justify-center">{previewContent}</div>
                                  <p className="text-xs text-muted-foreground pt-2 truncate shrink-0">{data.fileName}</p>
                              </div>
                              );
                          })()
                      ) : null}
                </div>
            )}
          </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} className="!bg-accent" />
    </div>
  );
};

export const CustomNode = memo(CustomNodeComponent);
