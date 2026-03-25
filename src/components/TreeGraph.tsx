"use client";

/**
 * SVG Tree Graph — interactive visualization of completed lives.
 *
 * Renders lives as nodes connected by lines, with branch points
 * shown as fork markers. Supports click to select.
 */

import { useMemo } from "react";
import type { LifeRecord } from "@/game/tree/types";

interface TreeNode {
  readonly life: LifeRecord;
  readonly x: number;
  readonly y: number;
  readonly children: TreeNode[];
}

interface TreeGraphProps {
  lives: LifeRecord[];
  selectedId: string | null;
  onSelect: (life: LifeRecord) => void;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;
const VERTICAL_GAP = 40;
const HORIZONTAL_GAP = 30;

export function TreeGraph({ lives, selectedId, onSelect }: TreeGraphProps) {
  const { nodes, width, height } = useMemo(() => layoutTree(lives), [lives]);

  if (nodes.length === 0) return null;

  const svgWidth = width + 60;
  const svgHeight = height + 60;

  return (
    <div className="w-full h-full overflow-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="mx-auto"
      >
        <g transform="translate(30, 30)">
          {/* Connection lines */}
          {nodes.map((node) =>
            node.children.map((child) => (
              <line
                key={`${node.life.id}-${child.life.id}`}
                x1={node.x + NODE_WIDTH / 2}
                y1={node.y + NODE_HEIGHT}
                x2={child.x + NODE_WIDTH / 2}
                y2={child.y}
                className="stroke-foreground/15"
                strokeWidth={2}
                strokeDasharray={child.life.sourceBranchId ? "6 4" : undefined}
              />
            ))
          )}

          {/* Nodes */}
          {nodes.map((node) => (
            <LifeNodeSvg
              key={node.life.id}
              node={node}
              isSelected={selectedId === node.life.id}
              onSelect={onSelect}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

function LifeNodeSvg({
  node,
  isSelected,
  onSelect,
}: {
  node: TreeNode;
  isSelected: boolean;
  onSelect: (life: LifeRecord) => void;
}) {
  const { life, x, y } = node;
  const branchCount = life.branchPoints.length;
  const unexplored = life.branchPoints.filter((bp) => !bp.explored).length;

  return (
    <g
      onClick={() => onSelect(life)}
      className="cursor-pointer"
    >
      {/* Node background */}
      <rect
        x={x}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={12}
        className={`transition-colors ${
          isSelected
            ? "fill-foreground/10 stroke-foreground/40"
            : "fill-foreground/[0.03] stroke-foreground/15 hover:fill-foreground/[0.06]"
        }`}
        strokeWidth={isSelected ? 2 : 1}
      />

      {/* Name */}
      <text
        x={x + NODE_WIDTH / 2}
        y={y + 24}
        textAnchor="middle"
        className="fill-foreground/80 text-xs font-semibold"
      >
        {life.name}
      </text>

      {/* Age */}
      <text
        x={x + NODE_WIDTH / 2}
        y={y + 42}
        textAnchor="middle"
        className="fill-foreground/40 text-[10px]"
      >
        Lived to {life.deathAge}
      </text>

      {/* Branch indicator */}
      {branchCount > 0 && (
        <text
          x={x + NODE_WIDTH / 2}
          y={y + 58}
          textAnchor="middle"
          className={`text-[10px] ${
            unexplored > 0 ? "fill-amber-500" : "fill-foreground/25"
          }`}
        >
          {branchCount} branch{branchCount !== 1 ? "es" : ""}
          {unexplored > 0 ? ` (${unexplored} unexplored)` : ""}
        </text>
      )}

      {/* Branch point dots along the bottom */}
      {life.branchPoints.slice(0, 8).map((bp, i) => (
        <circle
          key={bp.id}
          cx={x + 20 + i * 18}
          cy={y + NODE_HEIGHT - 8}
          r={3}
          className={bp.explored ? "fill-foreground/15" : "fill-amber-400"}
        />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Layout algorithm — simple top-down tree
// ---------------------------------------------------------------------------

function layoutTree(lives: LifeRecord[]): {
  nodes: TreeNode[];
  width: number;
  height: number;
} {
  if (lives.length === 0) return { nodes: [], width: 0, height: 0 };

  // Build parent-child map
  const childMap = new Map<string, LifeRecord[]>();
  const roots: LifeRecord[] = [];

  for (const life of lives) {
    if (life.parentLifeId) {
      const siblings = childMap.get(life.parentLifeId) ?? [];
      siblings.push(life);
      childMap.set(life.parentLifeId, siblings);
    } else {
      roots.push(life);
    }
  }

  // If no explicit roots, treat all as roots (flat list)
  if (roots.length === 0) {
    roots.push(...lives);
  }

  // Layout each root tree
  const allNodes: TreeNode[] = [];
  let currentX = 0;

  for (const root of roots) {
    const tree = layoutSubtree(root, childMap, currentX, 0);
    collectNodes(tree, allNodes);
    currentX = getMaxX(tree) + NODE_WIDTH + HORIZONTAL_GAP;
  }

  const maxX = allNodes.reduce((max, n) => Math.max(max, n.x + NODE_WIDTH), 0);
  const maxY = allNodes.reduce((max, n) => Math.max(max, n.y + NODE_HEIGHT), 0);

  return { nodes: allNodes, width: maxX, height: maxY };
}

function layoutSubtree(
  life: LifeRecord,
  childMap: Map<string, LifeRecord[]>,
  startX: number,
  depth: number
): TreeNode {
  const children = childMap.get(life.id) ?? [];
  const y = depth * (NODE_HEIGHT + VERTICAL_GAP);

  if (children.length === 0) {
    return { life, x: startX, y, children: [] };
  }

  // Layout children
  let childX = startX;
  const childNodes: TreeNode[] = [];
  for (const child of children) {
    const childNode = layoutSubtree(child, childMap, childX, depth + 1);
    childNodes.push(childNode);
    childX = getMaxX(childNode) + NODE_WIDTH + HORIZONTAL_GAP;
  }

  // Center parent above children
  const leftChild = childNodes[0].x;
  const rightChild = childNodes[childNodes.length - 1].x;
  const parentX = (leftChild + rightChild) / 2;

  return { life, x: parentX, y, children: childNodes };
}

function collectNodes(node: TreeNode, result: TreeNode[]): void {
  result.push(node);
  for (const child of node.children) {
    collectNodes(child, result);
  }
}

function getMaxX(node: TreeNode): number {
  let max = node.x;
  for (const child of node.children) {
    max = Math.max(max, getMaxX(child));
  }
  return max;
}
