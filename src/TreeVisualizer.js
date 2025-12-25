import React, { Component } from "react";

class TreeVisualizer extends Component {
    // Calculate ultrametric tree layout from treeObject (minNode structure)
    // All tips aligned at the same x position (right side)
    calculateTreeLayout() {
        const { treeObject, speciesList } = this.props;

        if (!treeObject || !speciesList || speciesList.length < 2) {
            return null;
        }

        const width = 350;
        const height = Math.max(150, speciesList.length * 45 + 40);
        const margin = { top: 20, right: 100, bottom: 20, left: 30 };

        // Get tree depth for each node (distance from tips)
        const getDepthFromTips = (node) => {
            if (!node) return 0;
            if (!node.left && !node.right) return 0; // Tips are at depth 0
            return 1 + Math.max(getDepthFromTips(node.left), getDepthFromTips(node.right));
        };

        const maxDepth = getDepthFromTips(treeObject);
        const treeWidth = width - margin.left - margin.right;
        const tipX = margin.left + treeWidth; // All tips at the right edge

        // Assign Y positions to tips (leaves)
        let tipIndex = 0;
        const tipCount = speciesList.length;
        const yScale = (height - margin.top - margin.bottom) / Math.max(1, tipCount - 1);

        const positions = {};
        const branches = [];

        // Traverse tree and calculate positions (ultrametric: x based on depth from tips)
        const traverse = (node) => {
            if (!node) return null;

            let x, y;

            if (!node.left && !node.right) {
                // Leaf node - all at the same x position (right edge)
                x = tipX;
                y = margin.top + tipIndex * yScale;
                if (tipCount === 1) y = height / 2;
                tipIndex++;
                positions[node.name] = { x, y, isLeaf: true };
            } else {
                // Internal node
                const leftPos = traverse(node.left);
                const rightPos = traverse(node.right);

                // Y at average of children
                y = (leftPos.y + rightPos.y) / 2;

                // X based on depth from tips (further from tips = more to the left)
                const depthFromTips = getDepthFromTips(node);
                x = tipX - (depthFromTips / Math.max(1, maxDepth)) * treeWidth;

                positions[node.name] = { x, y, isLeaf: false };

                // Add branches (horizontal lines to children, then vertical connector)
                if (leftPos) {
                    branches.push({ x1: x, y1: leftPos.y, x2: leftPos.x, y2: leftPos.y });
                    branches.push({ x1: x, y1: y, x2: x, y2: leftPos.y });
                }
                if (rightPos) {
                    branches.push({ x1: x, y1: rightPos.y, x2: rightPos.x, y2: rightPos.y });
                    branches.push({ x1: x, y1: y, x2: x, y2: rightPos.y });
                }
            }

            return { x, y };
        };

        traverse(treeObject);

        return { positions, branches, width, height, margin };
    }

    // Check if reverse route exists (for bidirectional coloring)
    hasReverseRoute(source, target) {
        const { migrationRoutes } = this.props;
        return migrationRoutes && migrationRoutes.some(
            r => r.source === target && r.target === source
        );
    }

    // Render a curved arrow between two species
    renderMigrationArrow(source, target, positions, key, isReverse) {
        const p1 = positions[source];
        const p2 = positions[target];

        if (!p1 || !p2) return null;

        // Calculate curved path going to the left of the tree
        // Use different curve offsets for forward vs reverse to separate bidirectional arrows
        const baseOffset = -40;
        const offsetX = isReverse ? baseOffset - 25 : baseOffset;
        const midY = (p1.y + p2.y) / 2;
        const controlX = Math.min(p1.x, p2.x) + offsetX;

        // Offset start/end points from nodes
        const startX = p1.x - 3;
        const startY = p1.y;
        const endX = p2.x - 3;
        const endY = p2.y;

        // Create bezier curve path
        const path = `M ${startX} ${startY} Q ${controlX} ${midY} ${endX} ${endY}`;

        // Calculate arrowhead position and angle
        const arrowSize = 5;
        // Approximate tangent at endpoint
        const dx = endX - controlX;
        const dy = endY - midY;
        const angle = Math.atan2(dy, dx);

        const arrowClass = isReverse ? 'active-reverse' : 'active';

        // Use inline styles to ensure visibility
        const strokeColor = isReverse ? '#2563eb' : '#dc2626';

        return (
            <g key={key}>
                <path
                    d={path}
                    className={`migration-arrow ${arrowClass}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                />
                {/* Arrowhead */}
                <polygon
                    points={`0,-${arrowSize} ${arrowSize * 1.5},0 0,${arrowSize}`}
                    transform={`translate(${endX}, ${endY}) rotate(${angle * 180 / Math.PI})`}
                    className={`arrow-marker ${arrowClass}`}
                    fill={strokeColor}
                />
            </g>
        );
    }

    render() {
        const { speciesList, migrationRoutes } = this.props;

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
                    {branches.map((branch, index) => (
                        <line
                            key={`branch-${index}`}
                            x1={branch.x1}
                            y1={branch.y1}
                            x2={branch.x2}
                            y2={branch.y2}
                            className="tree-branch"
                        />
                    ))}

                    {/* All nodes (tips and internal) with labels */}
                    {Object.entries(positions).map(([nodeName, pos]) => {
                        const isLeaf = pos.isLeaf;
                        return (
                            <g key={nodeName}>
                                {/* Node circle */}
                                <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={isLeaf ? 6 : 4}
                                    className={isLeaf ? "tree-node-circle" : "tree-internal-node"}
                                />
                                {/* Node label */}
                                <text
                                    x={isLeaf ? pos.x + 12 : pos.x - 8}
                                    y={isLeaf ? pos.y + 4 : pos.y - 8}
                                    className={isLeaf ? "tree-tip-label" : "tree-internal-label"}
                                    textAnchor={isLeaf ? "start" : "end"}
                                >
                                    {nodeName}
                                </text>
                            </g>
                        );
                    })}

                    {/* Migration arrows */}
                    {migrationRoutes && migrationRoutes.map((route, index) => {
                        // Determine if this is a "reverse" route for coloring
                        // A route is reverse if there's a matching route in the opposite direction
                        // that appears earlier in the list (to ensure consistent coloring)
                        const hasReverse = this.hasReverseRoute(route.source, route.target);
                        const isReverse = hasReverse && route.source > route.target;

                        return this.renderMigrationArrow(
                            route.source,
                            route.target,
                            positions,
                            `migration-${index}`,
                            isReverse
                        );
                    })}
                </svg>

                {/* Legend - only show if there are routes */}
                {migrationRoutes && migrationRoutes.length > 0 && (
                    <div className="tree-legend">
                        <span className="legend-item">
                            <span className="legend-line active"></span>
                            A → B
                        </span>
                        <span className="legend-item">
                            <span className="legend-line reverse"></span>
                            B → A
                        </span>
                    </div>
                )}
            </div>
        );
    }
}

export default TreeVisualizer;
