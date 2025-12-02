import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy } from 'lucide-react';
import { JsonValue } from '../types';

interface JsonNodeProps {
  name?: string; // The key name if this node is a property of an object
  value: JsonValue;
  isLast: boolean;
  depth?: number;
}

const INDENT_SIZE = 1.5; // rem

export const JsonNode: React.FC<JsonNodeProps> = ({ name, value, isLast, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCopy, setShowCopy] = useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
  };

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isEmpty = isObject 
    ? Object.keys(value as object).length === 0 
    : isArray 
      ? (value as any[]).length === 0 
      : false;

  const renderValue = (val: JsonValue) => {
    if (val === null) return <span className="text-rose-600 dark:text-rose-400">null</span>;
    if (typeof val === 'boolean') return <span className="text-rose-600 dark:text-rose-400">{val.toString()}</span>;
    if (typeof val === 'number') return <span className="text-orange-600 dark:text-orange-400">{val}</span>;
    if (typeof val === 'string') return <span className="text-green-600 dark:text-green-400">"{val}"</span>;
    return <span className="text-slate-400">unknown</span>;
  };

  const indentStyle = { paddingLeft: `${depth * INDENT_SIZE}rem` };

  if (isObject || isArray) {
    const keys = isObject ? Object.keys(value as object) : [];
    const items = isArray ? (value as any[]) : [];
    const openBracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';
    const length = isArray ? items.length : keys.length;

    return (
      <div className="font-mono text-sm leading-6 relative group">
        {/* Line Container */}
        <div 
          className={`flex items-start hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded px-1 cursor-pointer select-none transition-colors duration-150 ${!isExpanded ? 'bg-slate-100 dark:bg-slate-800/30' : ''}`}
          style={indentStyle}
          onClick={toggleExpand}
          onMouseEnter={() => setShowCopy(true)}
          onMouseLeave={() => setShowCopy(false)}
        >
          {/* Expander Icon */}
          <div className="w-5 h-6 flex items-center justify-center mr-1 shrink-0 opacity-70 hover:opacity-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-slate-500 dark:text-slate-400">
             {!isEmpty && (
               isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
             )}
          </div>

          {/* Key Name (if exists) */}
          {name && (
            <span className="mr-2">
              <span className="text-sky-600 dark:text-sky-400">"{name}"</span>
              <span className="text-slate-500 dark:text-slate-400">:</span>
            </span>
          )}

          {/* Opening Bracket */}
          <span className="text-slate-500 dark:text-slate-300">{openBracket}</span>

          {/* Collapsed State Preview */}
          {!isExpanded && !isEmpty && (
             <span className="text-slate-500 mx-2 italic text-xs">
               {isArray ? `Array(${length})` : `Object(${length})`} ...
             </span>
          )}

          {/* Closing Bracket (if collapsed or empty) */}
          {(!isExpanded || isEmpty) && (
            <span className="text-slate-500 dark:text-slate-300">
              {closeBracket}
              {!isLast && <span className="text-slate-500">,</span>}
            </span>
          )}
          
          {/* Copy Button specific to this node */}
           {showCopy && (
            <button 
              onClick={handleCopyValue}
              title="Copy value"
              className="ml-auto opacity-50 hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-opacity"
            >
              <Copy size={12} />
            </button>
          )}
        </div>

        {/* Children (Recursive) */}
        {isExpanded && !isEmpty && (
          <div>
            {isObject
              ? keys.map((key, idx) => (
                  <JsonNode
                    key={key}
                    name={key}
                    value={(value as any)[key]}
                    isLast={idx === keys.length - 1}
                    depth={depth + 1}
                  />
                ))
              : items.map((item, idx) => (
                  <JsonNode
                    key={idx}
                    value={item}
                    isLast={idx === items.length - 1}
                    depth={depth + 1}
                  />
                ))}
            {/* Closing Bracket Line */}
            <div 
              className="hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded px-1 transition-colors duration-150"
              style={{ paddingLeft: `${(depth * INDENT_SIZE) + 1.75}rem` }} // +1.75 to align with start
            >
              <span className="text-slate-500 dark:text-slate-300">{closeBracket}</span>
              {!isLast && <span className="text-slate-500">,</span>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Primitive Value Rendering
  return (
    <div 
      className="font-mono text-sm leading-6 flex items-start hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded px-1 group transition-colors duration-150"
      style={indentStyle}
    >
      {/* Spacer for alignment since primitives don't have expanders */}
      <div className="w-6 shrink-0" /> 

      {name && (
        <span className="mr-2">
          <span className="text-sky-600 dark:text-sky-400">"{name}"</span>
          <span className="text-slate-500 dark:text-slate-400">:</span>
        </span>
      )}
      
      {renderValue(value)}
      {!isLast && <span className="text-slate-500">,</span>}
    </div>
  );
};