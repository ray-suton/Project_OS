import { useMemo, useCallback } from 'react'
import {
  ReactFlow,
  type Node,
  type Edge,
  Background,
  Controls,
  type NodeMouseHandler,
  Position,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { GraphResponse, FunctionalNode as FNode, FunctionalEdge } from '../../shared/types'
import { FeatureNode } from './FeatureNode'

interface FunctionMapProps {
  graph: GraphResponse
  selectedNodeId: string | null
  onSelectNode: (nodeId: string | null) => void
}

const nodeTypes = { feature: FeatureNode }

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  in_progress: '#f59e0b',
  error: '#ef4444',
  suggested: '#6b7280'
}

export function FunctionMap({ graph, selectedNodeId, onSelectNode }: FunctionMapProps) {
  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = layoutNodes(graph.nodes, selectedNodeId)
    const flowEdges: Edge[] = graph.edges.map((e: FunctionalEdge) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      animated: e.relation === 'data_flows_to',
      label: edgeLabel(e.relation),
      labelStyle: { fontSize: 10, fill: '#666' },
      style: {
        stroke: e.confidence > 0.8 ? '#555' : '#333',
        strokeWidth: e.confidence > 0.8 ? 2 : 1,
        strokeDasharray: e.relation === 'redirects_to' ? '5 5' : undefined
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#555', width: 16, height: 16 }
    }))

    return { nodes: flowNodes, edges: flowEdges }
  }, [graph, selectedNodeId])

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onSelectNode(node.id === selectedNodeId ? null : node.id)
    },
    [onSelectNode, selectedNodeId]
  )

  const onPaneClick = useCallback(() => {
    onSelectNode(null)
  }, [onSelectNode])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ type: 'smoothstep' }}
    >
      <Background color="#1a1a2e" gap={20} size={1} />
      <Controls
        showInteractive={false}
        style={{ background: '#1e1e2e', borderColor: '#333' }}
      />
    </ReactFlow>
  )
}

function layoutNodes(fnNodes: FNode[], selectedId: string | null): Node[] {
  const cols = Math.ceil(Math.sqrt(fnNodes.length))
  const spacingX = 280
  const spacingY = 160

  return fnNodes.map((n, i) => ({
    id: n.id,
    type: 'feature',
    position: {
      x: (i % cols) * spacingX,
      y: Math.floor(i / cols) * spacingY
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      label: n.name,
      nameEn: n.nameEn,
      status: n.status,
      type: n.type,
      fileCount: n.linkedFiles.length,
      route: n.preview?.route || null,
      confidence: n.confidence,
      selected: n.id === selectedId,
      color: STATUS_COLORS[n.status] || '#6b7280'
    }
  }))
}

function edgeLabel(relation: string): string {
  switch (relation) {
    case 'depends_on': return 'depends'
    case 'redirects_to': return 'navigates'
    case 'data_flows_to': return 'data'
    case 'shares_data': return 'shared'
    default: return ''
  }
}
