
'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { findBlockByType } from '@/lib/types';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export function PropertiesPanel() {
  const { selectedNode, updateNodeData, unselectNode } = useEditorStore();

  if (!selectedNode) {
    return null;
  }

  const blockInfo = findBlockByType(selectedNode.data.type);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateNodeData(selectedNode.id, { [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target) {
          updateNodeData(selectedNode.id, {
            fileSrc: loadEvent.target.result as string,
            fileName: file.name,
            fileType: file.type,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const valueInputTypes = ['direct-checkout', 'order-bump', 'upsell', 'downsell', 'all-in-one'];
  const emailInputTypes = ['email-sequence', 'welcome-email', 'recovery-email', 'all-in-one'];
  const whatsappInputTypes = ['whatsapp-funnel', 'whatsapp-rescue', 'whatsapp-link', 'all-in-one'];
  const fileInputTypes = ['image-upload', 'video-upload', 'audio-upload', 'pdf-upload', 'all-in-one'];

  return (
    <aside className="w-80 border-l bg-sidebar">
      <div className="flex justify-between items-center p-4 border-b border-border/50">
        <h2 className="font-headline text-lg">Propriedades</h2>
        <Button variant="ghost" size="icon" onClick={unselectNode}>
            <X className="w-4 h-4"/>
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-3">
              <div style={{color: blockInfo?.color}}>{React.cloneElement(blockInfo!.icon, {className: 'w-8 h-8'})}</div>
              <span className="font-bold text-lg">{blockInfo?.label}</span>
          </div>

          {selectedNode.data.type !== 'notes' && (
             <div>
              <Label htmlFor="node-label">Rótulo do Bloco</Label>
              <Input 
                  id="node-label" 
                  name="label"
                  value={selectedNode.data.label || ''} 
                  onChange={handleInputChange}
                  placeholder={blockInfo?.label}
                  className="mt-1"
              />
          </div>
          )}
          
          {blockInfo?.hasDescription && (
             <div>
                <Label htmlFor="block-description">Descrição</Label>
                <Textarea 
                    id="block-description"
                    name="description"
                    value={selectedNode.data.description || blockInfo.description} 
                    onChange={handleInputChange}
                    placeholder={blockInfo.description}
                    className="mt-1"
                    rows={4}
                />
            </div>
          )}

          {selectedNode.data.type === 'notes' && (
             <div>
                <Label htmlFor="notesText">Conteúdo da Anotação</Label>
                <Textarea 
                    id="notesText"
                    name="notesText"
                    value={selectedNode.data.notesText || ''} 
                    onChange={handleInputChange}
                    placeholder="Digite sua anotação aqui..."
                    className="mt-1"
                    rows={8}
                />
            </div>
          )}
          
          {blockInfo?.hasLink && (
              <div>
                  <Label htmlFor="url">URL / Link</Label>
                  <Input 
                      id="url" 
                      name="url"
                      value={selectedNode.data.url || ''} 
                      onChange={handleInputChange}
                      placeholder={blockInfo?.linkExample || "https://example.com"}
                      className="mt-1"
                  />
              </div>
          )}

          {fileInputTypes.includes(selectedNode.data.type) && (
              <div>
                  <Label htmlFor="file-upload">Carregar Arquivo</Label>
                  <Input 
                      id="file-upload" 
                      name="file"
                      type="file"
                      onChange={handleFileChange}
                      className="mt-1"
                      accept={
                        selectedNode.data.type === 'image-upload' ? 'image/*' :
                        selectedNode.data.type === 'video-upload' ? 'video/*' :
                        selectedNode.data.type === 'audio-upload' ? 'audio/*' :
                        selectedNode.data.type === 'pdf-upload' ? 'application/pdf' : 
                        selectedNode.data.type === 'all-in-one' ? '*' : ''
                      }
                  />
                  {selectedNode.data.fileName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Arquivo: {selectedNode.data.fileName}
                    </p>
                  )}
              </div>
          )}

          {valueInputTypes.includes(selectedNode.data.type) && (
              <div>
                  <Label htmlFor="value">Valor do Produto (R$)</Label>
                  <Input 
                      id="value" 
                      name="value"
                      type="number"
                      value={selectedNode.data.value || ''} 
                      onChange={handleInputChange}
                      placeholder="99.90"
                      className="mt-1"
                  />
              </div>
          )}
          
          {emailInputTypes.includes(selectedNode.data.type) && (
              <>
                  <div>
                      <Label htmlFor="subject">Assunto do E-mail</Label>
                      <Input 
                          id="subject" 
                          name="subject"
                          value={selectedNode.data.subject || ''} 
                          onChange={handleInputChange}
                          placeholder="Sua oferta incrível está aqui!"
                          className="mt-1"
                      />
                  </div>
                  {selectedNode.data.type === 'email-sequence' && (
                    <div>
                        <Label htmlFor="sendTime">Enviar após (horas)</Label>
                        <Input 
                            id="sendTime"
                            name="sendTime"
                            type="number"
                            value={selectedNode.data.sendTime || ''} 
                            onChange={handleInputChange}
                            placeholder="24"
                            className="mt-1"
                        />
                    </div>
                  )}
              </>
          )}

          {whatsappInputTypes.includes(selectedNode.data.type) && (
              <div>
                  <Label htmlFor="message">Mensagem de WhatsApp</Label>
                  <Textarea 
                      id="message"
                      name="message"
                      value={selectedNode.data.message || ''} 
                      onChange={handleInputChange}
                      placeholder="Digite sua mensagem aqui..."
                      className="mt-1"
                  />
              </div>
          )}
          
          {blockInfo?.extra && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
              <span className="font-bold text-primary/80">💡 Dica:</span> {blockInfo.extra}
            </div>
          )}

        </div>
      </ScrollArea>
    </aside>
  );
}
