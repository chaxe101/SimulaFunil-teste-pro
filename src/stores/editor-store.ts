
import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { useShallow } from 'zustand/react/shallow';

type PreviewContent = {
  type: string;
  src: string;
};

type HistoryEntry = { type: 'node'; nodes: Node[]; edges: Edge[] };

type EditorState = {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  previewContent: PreviewContent | null;
  funnelId: string | null;
  
  // History for undo
  history: HistoryEntry[];
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addNode: (node: Node) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  unselectNode: () => void;
  deleteNode: (nodeId: string) => void;
  
  setPreviewContent: (content: PreviewContent | null) => void;
  
  undoLastAction: () => void;
  
  setFunnelId: (funnelId: string) => void;
  reset: () => void;
};

const initialState = {
    nodes: [],
    edges: [],
    selectedNode: null,
    previewContent: null,
    funnelId: null,
    history: [],
}

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,
  
  onNodesChange: (changes: NodeChange[]) => {
    const { nodes, edges, history } = get();
    
    const isUndoableChange = changes.some(c => c.type === 'position' && c.dragging === false);
    if(isUndoableChange) {
        const newHistory = [...history, { type: 'node', nodes, edges }];
         set({ history: newHistory.slice(-50) });
    }
    
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    
    const selectedChange = changes.find(change => change.type === 'select' && change.selected);
    if(selectedChange && 'id' in selectedChange) {
        const selectedNode = get().nodes.find(node => node.id === selectedChange.id);
        if (selectedNode) {
            set({ selectedNode });
        }
    } else if (changes.some(c => c.type === 'select' && !c.selected)) {
        const anySelected = get().nodes.some(n => n.selected);
        if (!anySelected) {
            set({ selectedNode: null });
        }
    }
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const { nodes, edges, history } = get();
    const newHistory = [...history, { type: 'node', nodes, edges }];
    
    set({
      edges: applyEdgeChanges(changes, get().edges),
      history: newHistory.slice(-50),
    });
  },
  
  addNode: (node: Node) => {
     const { nodes, edges, history } = get();
    const newHistory = [...history, { type: 'node', nodes, edges }];

    set({
      nodes: [...get().nodes, node],
      history: newHistory.slice(-50),
    });
  },

  setNodes: (nodes: Node[]) => {
    set({ nodes });
  },

  setEdges: (edges: Edge[]) => {
    set({ edges: edges });
  },
  
  updateNodeData: (nodeId: string, data: any) => {
    const { nodes, edges, history } = get();
    const newHistory = [...history, { type: 'node', nodes, edges }];

    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, ...data };
        }
        return node;
      }),
      history: newHistory.slice(-50),
    });
    const selected = get().selectedNode;
    if (selected && selected.id === nodeId) {
        set({
            selectedNode: {...selected, data: {...selected.data, ...data}}
        });
    }
  },

  unselectNode: () => {
    set({
      nodes: get().nodes.map(n => ({...n, selected: false})),
      selectedNode: null
    });
  },

  deleteNode: (nodeId: string) => {
    const { nodes, edges, history } = get();
    const newHistory = [...history, { type: 'node', nodes, edges }];
    
    const remainingNodes = get().nodes.filter(n => n.id !== nodeId);
    const remainingEdges = get().edges.filter(e => e.source !== nodeId && e.target !== nodeId);

    set({
      nodes: remainingNodes,
      edges: remainingEdges,
      history: newHistory.slice(-50),
    });
    
    if (get().selectedNode?.id === nodeId) {
      set({ selectedNode: null });
    }
  },

  setPreviewContent: (content) => {
    set({ previewContent: content });
  },
  
  undoLastAction: () => {
    const { history } = get();
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    if (lastAction.type === 'node') {
      set({ nodes: lastAction.nodes, edges: lastAction.edges, history: newHistory });
    }
  },

  setFunnelId: (funnelId: string) => {
    if (get().funnelId !== funnelId) {
      // When funnel changes, reset the state
      set(initialState);
      set({ funnelId });
    }
  },
  reset: () => {
    set(initialState);
  }
}));

export const useShallowEditorStore = <U>(selector: (state: EditorState) => U) => {
    return useEditorStore(useShallow(selector));
};
