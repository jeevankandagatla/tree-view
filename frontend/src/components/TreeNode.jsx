import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { ChevronDown, ChevronUp, User, Plus, Trash2, Edit2 } from "lucide-react";

const TreeNode = ({ id, data }) => {
  const { name, role, isCollapsed, onToggle, hasChildren } = data;

  return (
    <div className={`tree-node ${isCollapsed ? 'collapsed' : ''} ${hasChildren ? 'has-children' : ''}`}>
      <Handle type="target" position={Position.Top} className="handle" />
      
      <div className="node-content">
        <div className="icon-wrapper">
          <User size={16} />
        </div>
        <div className="text-wrapper">
          <div className="name">{name}</div>
          {role && <div className="role">{role}</div>}
        </div>

        <div className="node-actions">
          <button className="action-btn add" onClick={(e) => { e.stopPropagation(); data.onAdd(id); }} title="Add Child">
            <Plus size={14} />
          </button>
          <button className="action-btn edit" onClick={(e) => { e.stopPropagation(); data.onEdit(id); }} title="Edit">
            <Edit2 size={14} />
          </button>
          <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); data.onDelete(id); }} title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
        
        {hasChildren && (
          <button className="toggle-btn" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
};

export default memo(TreeNode);
