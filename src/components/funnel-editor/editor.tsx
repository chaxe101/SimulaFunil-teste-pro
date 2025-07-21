'use client';

import React, { DragEvent, useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  ReactFlowInstance,
  NodeOrigin,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BlocksSidebar } from './blocks-sidebar';
import { PropertiesPanel } from './properties-panel';
import { CustomNode } from './custom-node';
import { useEditorStore } from '@/stores/editor-store';
import { ContentPreviewModal } from './content-preview-modal';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeTypes = {
  custom: CustomNode,
};

const nodeOrigin: NodeOrigin = [0, 0];

let id = 1;
const getId = () => `dnd-node_${id++}`;

export function FunnelEditor({ funnelId }: { funnelId: string }) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addNode,
    setNodes,
    setEdges,
    previewContent,
    setPreviewContent,
  } = useEditorStore();

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isBlocksSidebarOpen, setBlocksSidebarOpen] = useState(true);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges(addEdge(params, edges)),
    [edges, setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: getId(),
        type: 'custom',
        position,
        data: { type },
        // REMOVIDO: nodeOrigin, // <--- Esta linha foi removida
      };
      
      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  useEffect(() => {
    if (funnelId === 'new' && reactFlowInstance) {
      const funnelDataString = sessionStorage.getItem('funnelToLoad');
      if (funnelDataString) {
        try {
          const funnelData = JSON.parse(funnelDataString);
          if (funnelData.nodes && funnelData.edges) {
            setNodes(funnelData.nodes);
            setEdges(funnelData.edges);
            setTimeout(() => {
              reactFlowInstance.fitView({ padding: 0.1 });
            }, 100);
          }
        } catch (error) {
          console.error("Failed to load funnel from session storage", error);
        } finally {
          sessionStorage.removeItem('funnelToLoad');
        }
      }
    }
  }, [funnelId, reactFlowInstance, setNodes, setEdges]);

  return (
    <ReactFlowProvider>
      <div className="w-full h-full flex" ref={reactFlowWrapper}>
        <div className={cn('relative transition-all duration-300 ease-in-out', isBlocksSidebarOpen ? 'w-72' : 'w-0')}>
          <div className={cn(isBlocksSidebarOpen ? 'w-72' : 'w-0', 'overflow-hidden h-full')}>
            <BlocksSidebar />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 bg-sidebar rounded-full h-8 w-8 border-border/80 hover:bg-sidebar-accent"
            onClick={() => setBlocksSidebarOpen(!isBlocksSidebarOpen)}
            title={isBlocksSidebarOpen ? "Recolher barra lateral" : "Expandir barra lateral"}
          >
            {isBlocksSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex-grow h-full relative bg-background">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            nodeOrigin={nodeOrigin}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
          </ReactFlow>
        </div>
        <PropertiesPanel />
      </div>
      <ContentPreviewModal
        content={previewContent}
        onClose={() => setPreviewContent(null)}
      />
    </ReactFlowProvider>
  );
}
