'use client';

import React, { useState, useCallback, DragEvent, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  ReactFlowInstance,
  applyNodeChanges,
  OnNodesChange,
  applyEdgeChanges,
  OnEdgesChange,
  BackgroundVariant,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  FileText,
  PlaySquare,
  ShoppingCart,
} from 'lucide-react';

const miniBlockTypes = [
  {
    type: 'landing-page',
    label: 'Página de Captura',
    icon: <FileText />,
    color: 'text-emerald-500',
  },
  {
    type: 'vsl',
    label: 'VSL',
    icon: <PlaySquare />,
    color: 'text-red-500',
  },
  {
    type: 'sales-page',
    label: 'Página de Vendas',
    icon: <ShoppingCart />,
    color: 'text-green-500',
  },
];

const MiniCustomNode = ({ data }: NodeProps<{ label: string; icon: React.ReactElement, color: string }>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary/50" />
      <div className="w-40 h-24 p-2 rounded-lg shadow-lg bg-card border-2 border-border flex flex-col items-center justify-center gap-2">
        {React.cloneElement(data.icon, {className: `w-8 h-8 ${data.color}`})}
        <span className="text-sm font-semibold text-center text-card-foreground">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary/50" />
    </>
  );
};

const nodeTypes = {
  custom: MiniCustomNode,
};

let id = 0;
const getId = () => `lp-node_${id++}`;

export function LandingPageSimulator() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

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
      
      const block = miniBlockTypes.find(b => b.type === type);
      if (!block) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: getId(),
        type: 'custom',
        position,
        data: { label: block.label, icon: block.icon, color: block.color },
      };
      
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <div className="h-[550px] w-full max-w-5xl mx-auto rounded-xl border-2 border-border shadow-2xl flex bg-card/10 overflow-hidden">
      <ReactFlowProvider>
        <div className="w-48 bg-sidebar p-4 border-r border-border/50 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-center text-muted-foreground">Arraste para o canvas</h3>
          <div className="flex flex-col gap-3">
            {miniBlockTypes.map((block) => (
              <div
                key={block.type}
                className="p-3 rounded-lg border bg-card cursor-grab flex flex-col items-center justify-center gap-2 transition-all hover:shadow-lg hover:border-primary aspect-square"
                onDragStart={(event) => onDragStart(event, block.type)}
                draggable
              >
                {React.cloneElement(block.icon, {className: `w-7 h-7 ${block.color}`})}
                <span className="font-medium text-xs text-center">{block.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-grow h-full" ref={reactFlowWrapper}>
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
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls showInteractive={false} showZoom={false} showFitView={false} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
