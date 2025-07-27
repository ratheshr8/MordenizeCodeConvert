import React from 'react';
import { FlowChart as FlowChartType, FlowChartNode, FlowChartConnection } from '../../types';

interface FlowChartProps {
  flowChart: FlowChartType;
}

export const FlowChart: React.FC<FlowChartProps> = ({ flowChart }) => {
  const getNodeColor = (type: FlowChartNode['type']) => {
    switch (type) {
      case 'start':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'process':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'decision':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'end':
        return 'bg-red-100 border-red-500 text-red-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getNodeShape = (type: FlowChartNode['type']) => {
    switch (type) {
      case 'start':
      case 'end':
        return 'rounded-full';
      case 'decision':
        return 'rounded-lg';
      default:
        return 'rounded-lg';
    }
  };

  const getConnectionPath = (from: FlowChartNode, to: FlowChartNode) => {
    const startX = from.x + 100; // Node width / 2
    const startY = from.y + 40;  // Node height / 2
    const endX = to.x + 100;
    const endY = to.y + 40;

    // Simple straight line for now
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  const findNodeById = (id: string) => flowChart.nodes.find(node => node.id === id);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Code Logic Flow Chart</h3>
      
      <div className="relative bg-gray-50 rounded-lg p-8 min-h-96 overflow-auto">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {flowChart.connections.map((connection, index) => {
            const fromNode = findNodeById(connection.from);
            const toNode = findNodeById(connection.to);
            
            if (!fromNode || !toNode) return null;
            
            return (
              <g key={index}>
                <path
                  d={getConnectionPath(fromNode, toNode)}
                  stroke="#6B7280"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
                {connection.label && (
                  <text
                    x={(fromNode.x + toNode.x + 200) / 2}
                    y={(fromNode.y + toNode.y + 80) / 2}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                    style={{ fontSize: '12px' }}
                  >
                    {connection.label}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6B7280"
              />
            </marker>
          </defs>
        </svg>

        {flowChart.nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute border-2 p-4 shadow-md transition-all duration-200 hover:shadow-lg ${getNodeColor(node.type)} ${getNodeShape(node.type)} ${
              node.type === 'decision' ? 'clip-path-diamond' : ''
            }`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: '200px',
              height: '80px',
              zIndex: 2,
              clipPath: node.type === 'decision' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none'
            }}
          >
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="font-medium text-sm mb-1">{node.title}</div>
              <div className="text-xs opacity-80">{node.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-500 rounded-full"></div>
          <span className="text-gray-600">Start/End</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded"></div>
          <span className="text-gray-600">Process</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 bg-yellow-100 border border-yellow-500"
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          ></div>
          <span className="text-gray-600">Decision</span>
        </div>
      </div>
    </div>
  );
};