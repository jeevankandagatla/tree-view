import React, { useState, useCallback, useEffect, useMemo } from "react";
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  addEdge,
  updateEdge,
  ControlButton
} from "reactflow";
import "reactflow/dist/style.css";
import { getLayoutedElements } from "./utils/layoutUtils";
import TreeNode from "./components/TreeNode";
import NodeModal from "./components/NodeModal";
import { RotateCcw, Loader2 } from "lucide-react";

const nodeTypes = {
  treeNode: TreeNode,
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/tree";

const TreeVisualizer = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, nodeId: null });

  // Layout Logic
  const applyLayout = useCallback((nodesToLayout, edgesToLayout) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodesToLayout, edgesToLayout);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [setNodes, setEdges]);

  // Fetch initial data from Flask
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const { nodes: lNodes, edges: lEdges } = getLayoutedElements(data.nodes, data.edges);
        setNodes(lNodes);
        setEdges(lEdges);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch tree data:", err);
        setIsLoading(false);
      });
  }, []);

  // Save to Flask whenever nodes/edges change
  const saveToServer = useCallback((nextNodes, nextEdges) => {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: nextNodes, edges: nextEdges })
    }).catch(err => console.error("Failed to save to server:", err));
  }, []);

  // CRUD Actions
  const onAdd = (parentId) => setModalConfig({ isOpen: true, type: 'add', nodeId: parentId });
  const onEdit = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    setModalConfig({ isOpen: true, type: 'edit', nodeId, data: node.data });
  };
  const onDelete = (nodeId) => {
    const descendantIds = getDescendantIds(nodeId, edges);
    const idsToRemove = [nodeId, ...descendantIds];
    const nextNodes = nodes.filter(n => !idsToRemove.includes(n.id));
    const nextEdges = edges.filter(e => !idsToRemove.includes(e.source) && !idsToRemove.includes(e.target));
    
    setNodes(nextNodes);
    setEdges(nextEdges);
    saveToServer(nextNodes, nextEdges);
    setTimeout(() => applyLayout(nextNodes, nextEdges), 50);
  };

  const getDescendantIds = (nodeId, allEdges) => {
    const children = allEdges.filter(e => e.source === nodeId).map(e => e.target);
    let descendants = [...children];
    children.forEach(childId => {
      descendants = [...descendants, ...getDescendantIds(childId, allEdges)];
    });
    return descendants;
  };

  const handleSave = (formData) => {
    let nextNodes, nextEdges;
    if (modalConfig.type === 'add') {
      const newNodeId = `node-${Date.now()}`;
      const newNode = {
        id: newNodeId,
        type: 'treeNode',
        data: { ...formData },
        position: { x: 0, y: 0 }
      };
      const newEdge = {
        id: `e-${modalConfig.nodeId}-${newNodeId}`,
        source: modalConfig.nodeId,
        target: newNodeId,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
        style: { stroke: '#6366f1', strokeWidth: 2 },
      };
      nextNodes = [...nodes, newNode];
      nextEdges = [...edges, newEdge];
    } else {
      nextNodes = nodes.map(n => n.id === modalConfig.nodeId ? { ...n, data: { ...n.data, ...formData } } : n);
      nextEdges = edges;
    }
    
    setNodes(nextNodes);
    setEdges(nextEdges);
    saveToServer(nextNodes, nextEdges);
    applyLayout(nextNodes, nextEdges);
  };

  const onConnect = useCallback((params) => {
    const nextEdges = addEdge({ 
      ...params, 
      animated: true, 
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
      style: { stroke: '#6366f1', strokeWidth: 2 } 
    }, edges);
    setEdges(nextEdges);
    saveToServer(nodes, nextEdges);
    applyLayout(nodes, nextEdges);
  }, [edges, nodes, applyLayout, saveToServer]);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    const nextEdges = updateEdge(oldEdge, newConnection, edges);
    setEdges(nextEdges);
    saveToServer(nodes, nextEdges);
    applyLayout(nodes, nextEdges);
  }, [edges, nodes, applyLayout, saveToServer]);

  const onReset = useCallback(() => {
    if (window.confirm("This will restore the initial example tree. Continue?")) {
      fetch(`${API_URL}/reset`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          const { nodes: lNodes, edges: lEdges } = getLayoutedElements(data.nodes, data.edges);
          setNodes(lNodes);
          setEdges(lEdges);
        });
    }
  }, [setNodes, setEdges]);

  // Toggling Subtrees (stays client-side for UX speed)
  const toggleNode = useCallback((nodeId) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const visibleElements = useMemo(() => {
    let hiddenIds = new Set();
    collapsedNodes.forEach(id => {
      getDescendantIds(id, edges).forEach(childId => hiddenIds.add(childId));
    });

    const filteredNodes = nodes.filter(n => !hiddenIds.has(n.id)).map(n => ({
      ...n,
      data: {
        ...n.data,
        isCollapsed: collapsedNodes.has(n.id),
        hasChildren: edges.some(e => e.source === n.id),
        onToggle: () => toggleNode(n.id),
        onAdd,
        onEdit,
        onDelete
      }
    }));

    const filteredEdges = edges.filter(e => !hiddenIds.has(e.source) && !hiddenIds.has(e.target));
    return { nodes: filteredNodes, edges: filteredEdges };
  }, [nodes, edges, collapsedNodes, toggleNode]);

  // Re-layout when visibility changes
  useEffect(() => {
    if (visibleElements.nodes.length > 0) {
      const { nodes: lNodes } = getLayoutedElements(visibleElements.nodes, visibleElements.edges);
      setNodes(nds => nds.map(n => {
        const layouted = lNodes.find(ln => ln.id === n.id);
        return layouted ? { ...n, position: layouted.position } : n;
      }));
    }
  }, [collapsedNodes]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <Loader2 className="animate-spin" size={48} color="#6366f1" />
        <p>Connecting to Tree-View Backend...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0f172a" }}>
      <ReactFlow
        nodes={visibleElements.nodes}
        edges={visibleElements.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeUpdate={onEdgeUpdate}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#1e293b" gap={20} />
        <Controls>
          <ControlButton onClick={onReset} title="Reset to Default">
            <RotateCcw size={14} style={{ color: '#000000' }} />
          </ControlButton>
        </Controls>
      </ReactFlow>
      
      <div className="overlay-info" style={{ pointerEvents: 'none' }}>
        <h1 style={{ pointerEvents: 'auto' }}>Tree-View Pro</h1>
        <p>React + Flask Fullstack Visualizer</p>
      </div>

      <NodeModal
        key={modalConfig.nodeId || 'new'}
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onSave={handleSave}
        initialData={modalConfig.data}
      />
    </div>
  );
};

export default TreeVisualizer;
