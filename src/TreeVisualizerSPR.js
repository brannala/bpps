import React, { Component } from "react";

class TreeVisualizerSPR extends Component {
    // Calculate ultrametric tree layout from treeObject (minNode structure)
    calculateTreeLayout() {
        const { treeObject, speciesList } = this.props;

        if (!treeObject || !speciesList || speciesList.length < 2) {
            return null;
        }

        const width = 400;
        const height = Math.max(180, speciesList.length * 45 + 40);
        const margin = { top: 20, right: 100, bottom: 20, left: 30 };

        // Get tree depth for each node (distance from tips)
        const getDepthFromTips = (node) => {
            if (!node) return 0;
            if (!node.left && !node.right) return 0;
            return 1 + Math.max(getDepthFromTips(node.left), getDepthFromTips(node.right));
        };

        const maxDepth = getDepthFromTips(treeObject);
        const treeWidth = width - margin.left - margin.right;
        const tipX = margin.left + treeWidth;

        let tipIndex = 0;
        const tipCount = speciesList.length;
        const yScale = (height - margin.top - margin.bottom) / Math.max(1, tipCount - 1);

        const positions = {};
        const branches = [];

        const traverse = (node) => {
            if (!node) return null;

            let x, y;

            if (!node.left && !node.right) {
                x = tipX;
                y = margin.top + tipIndex * yScale;
                if (tipCount === 1) y = height / 2;
                tipIndex++;
                positions[node.name] = { x, y, isLeaf: true };
            } else {
                const leftPos = traverse(node.left);
                const rightPos = traverse(node.right);

                y = (leftPos.y + rightPos.y) / 2;
                const depthFromTips = getDepthFromTips(node);
                x = tipX - (depthFromTips / Math.max(1, maxDepth)) * treeWidth;

                positions[node.name] = { x, y, isLeaf: false };

                if (leftPos) {
                    branches.push({ x1: x, y1: leftPos.y, x2: leftPos.x, y2: leftPos.y, targetNode: node.left.name });
                    branches.push({ x1: x, y1: y, x2: x, y2: leftPos.y, targetNode: null });
                }
                if (rightPos) {
                    branches.push({ x1: x, y1: rightPos.y, x2: rightPos.x, y2: rightPos.y, targetNode: node.right.name });
                    branches.push({ x1: x, y1: y, x2: x, y2: rightPos.y, targetNode: null });
                }
            }

            return { x, y };
        };

        traverse(treeObject);

        return { positions, branches, width, height, margin };
    }

    // Check if a node is in the subtree of the selected node
    isInSelectedSubtree(nodeName) {
        const { sprSelectedNode, treeObject } = this.props;
        if (!sprSelectedNode || !treeObject) return false;

        const findNode = (node, name) => {
            if (!node) return null;
            if (node.name === name) return node;
            return findNode(node.left, name) || findNode(node.right, name);
        };

        const checkDescendant = (node, target) => {
            if (!node) return false;
            if (node.name === target) return true;
            return checkDescendant(node.left, target) || checkDescendant(node.right, target);
        };

        // Check if nodeName is the selected node or a descendant of it
        if (nodeName === sprSelectedNode) return true;

        const selectedNodeRef = findNode(treeObject, sprSelectedNode);
        if (!selectedNodeRef) return false;
        return checkDescendant(selectedNodeRef, nodeName);
    }

    handleNodeClick(nodeName) {
        const { treeEditMode, onNodeClick } = this.props;
        if (treeEditMode && onNodeClick) {
            onNodeClick(nodeName);
        }
    }

    render() {
        const { speciesList, treeEditMode, sprSelectedNode, migrationRoutes } = this.props;

        if (!speciesList || speciesList.length < 2) {
            return <div className="tree-visualizer-empty">Load a map file with at least 2 species to see the tree</div>;
        }

        const layout = this.calculateTreeLayout();

        if (!layout) {
            return <div className="tree-visualizer-empty">Unable to render tree</div>;
        }

        const { positions, branches, width, height } = layout;

        return (
            <div className="tree-visualizer">
                <svg width={width} height={height} className="tree-svg">
                    {/* Tree branches */}
                    {branches.map((branch, index) => {
                        const isSelected = branch.targetNode && this.isInSelectedSubtree(branch.targetNode);
                        return (
                            <line
                                key={`branch-${index}`}
                                x1={branch.x1}
                                y1={branch.y1}
                                x2={branch.x2}
                                y2={branch.y2}
                                className={`tree-branch ${isSelected ? 'tree-branch-selected' : ''}`}
                            />
                        );
                    })}

                    {/* All nodes with labels */}
                    {Object.entries(positions).map(([nodeName, pos]) => {
                        const isLeaf = pos.isLeaf;
                        const isSelected = nodeName === sprSelectedNode;
                        const isInSubtree = this.isInSelectedSubtree(nodeName);
                        const isValidTarget = treeEditMode && sprSelectedNode && !isInSubtree && nodeName !== sprSelectedNode;

                        return (
                            <g
                                key={nodeName}
                                onClick={() => this.handleNodeClick(nodeName)}
                                style={{ cursor: treeEditMode ? 'pointer' : 'default' }}
                            >
                                {/* Clickable area (larger than visible node) */}
                                {treeEditMode && (
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={15}
                                        className="node-click-area"
                                    />
                                )}

                                {/* Node circle */}
                                <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={isLeaf ? 6 : 4}
                                    className={`
                                        ${isLeaf ? "tree-node-circle" : "tree-internal-node"}
                                        ${isSelected ? 'node-selected' : ''}
                                        ${isInSubtree && !isSelected ? 'node-in-subtree' : ''}
                                        ${isValidTarget ? 'node-valid-target' : ''}
                                    `}
                                />

                                {/* Node label */}
                                <text
                                    x={isLeaf ? pos.x + 12 : pos.x - 8}
                                    y={isLeaf ? pos.y + 4 : pos.y - 8}
                                    className={`
                                        ${isLeaf ? "tree-tip-label" : "tree-internal-label"}
                                        ${isSelected || isInSubtree ? 'label-selected' : ''}
                                    `}
                                    textAnchor={isLeaf ? "start" : "end"}
                                >
                                    {nodeName}
                                </text>
                            </g>
                        );
                    })}

                    {/* Migration arrows (if any) */}
                    {migrationRoutes && migrationRoutes.map((route, index) => {
                        const p1 = positions[route.source];
                        const p2 = positions[route.target];
                        if (!p1 || !p2) return null;

                        const midY = (p1.y + p2.y) / 2;
                        const controlX = Math.min(p1.x, p2.x) - 40;
                        const path = `M ${p1.x - 3} ${p1.y} Q ${controlX} ${midY} ${p2.x - 3} ${p2.y}`;

                        return (
                            <path
                                key={`migration-${index}`}
                                d={path}
                                className="migration-arrow active"
                                fill="none"
                            />
                        );
                    })}
                </svg>
            </div>
        );
    }
}

export default TreeVisualizerSPR;
