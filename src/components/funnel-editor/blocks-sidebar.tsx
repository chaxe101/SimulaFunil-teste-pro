
'use client';

import React, { useState, useMemo, DragEvent } from 'react';
import { blockTypes } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

export function BlocksSidebar() {
  const [searchTerm, setSearchTerm] = useState('');

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredBlockTypes = useMemo(() => {
    if (!searchTerm) {
      return blockTypes;
    }
    return blockTypes.filter(block =>
      block.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <TooltipProvider>
      <aside className="w-72 border-r bg-sidebar flex flex-col h-full">
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar bloco..."
              className="pl-8 bg-background/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-grow">
          <div className="p-4">
            {filteredBlockTypes.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredBlockTypes.map((block) => (
                    <Tooltip key={block.type} delayDuration={300}>
                      <TooltipTrigger asChild>
                         <div
                            className="p-3 rounded-lg border bg-card cursor-grab flex flex-col items-center justify-center gap-2 transition-all hover:shadow-lg hover:border-primary aspect-square"
                            onDragStart={(event) => onDragStart(event, block.type)}
                            draggable
                        >
                            <div style={{color: block.color}}>{React.cloneElement(block.icon, {className: 'w-7 h-7'})}</div>
                            <span className="font-medium text-xs text-center">{block.label}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="start" className="max-w-xs z-50">
                        <p className="font-bold">{block.label}</p>
                        <p className="text-xs text-muted-foreground">{block.description}</p>
                        {block.extra && <p className="text-xs text-primary/80 mt-2">💡 {block.extra}</p>}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>Nenhum bloco encontrado.</p>
                </div>
             )}
          </div>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
}
