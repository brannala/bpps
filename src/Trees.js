
function recurseTree(tNode,newickSt)
{
    if(tNode==null) {
       return;
    }
    var currNode=tNode;
    if(currNode.left != null)
    {
        newickSt.newick += "(";
        recurseTree(currNode.left,newickSt);
     }
    if(currNode.right != null)
    {
        newickSt.newick += ", ";
        recurseTree(currNode.right,newickSt);
        newickSt.newick += ")";
    }
    if((currNode.left == null)&&(currNode.right == null))
        newickSt.newick += currNode.name;
}

function newickFromTree(tNode)
{
    let treeSt={newick: ""};
    recurseTree(tNode,treeSt);
    return treeSt.newick;
}

/* code to generate random starting trees for control file  */

function minNode(name, left, right, father) {
   this.name = name;
   this.left = left;
   this.right = right;
   this.father = father;
}

// use array to represent tips of tree
function treeArray(tNode,tArray)
{
    if(tNode==null) return;
    var currNode=tNode;
    if(currNode.left != null)
        treeArray(currNode.left,tArray);
    if(currNode.right != null)
        treeArray(currNode.right,tArray);
    if((currNode.left == null)&&(currNode.right == null))
        tArray.push(currNode);
}

// generate a random tree for ntax = speciesNames.length
function randomTree(speciesNames)
{
var treeList = [];
let tRoot = new minNode("root",null,null,null);
tRoot.left = new minNode("empty",null,null,tRoot);
tRoot.right = new minNode("empty",null,null,tRoot);
treeArray(tRoot,treeList);
while(treeList.length < speciesNames.length)
{
    let x=Math.floor((Math.random() * treeList.length));
    treeList[x].left = new minNode("empty", null, null,treeList[x]);
    treeList[x].right = new minNode("empty", null, null,treeList[x]);
    treeList = [];
    treeArray(tRoot,treeList);
}
for(var i=0; i<treeList.length; i++)
    treeList[i].name=speciesNames[i];
return tRoot;
}

// Get all tip names under a node
function getTipNames(tNode) {
    if (tNode === null) return [];
    if (tNode.left === null && tNode.right === null) {
        return [tNode.name];
    }
    return [...getTipNames(tNode.left), ...getTipNames(tNode.right)];
}

// Truncate or use full name based on maxLen
function truncateName(name, maxLen) {
    if (name.length <= maxLen) return name;
    return name.substring(0, maxLen);
}

// Label internal nodes with names like S0, S1, etc. for MSC-M compatibility
function labelInternalNodes(tNode, prefix = 'S', counter = { n: 0 }) {
    if (tNode === null) return tNode;

    // Process children first (post-order traversal)
    if (tNode.left !== null) {
        labelInternalNodes(tNode.left, prefix, counter);
    }
    if (tNode.right !== null) {
        labelInternalNodes(tNode.right, prefix, counter);
    }

    // Label internal nodes (nodes with children)
    if (tNode.left !== null && tNode.right !== null) {
        if (!tNode.name || tNode.name === 'root' || tNode.name === 'empty') {
            tNode.name = prefix + counter.n;
            counter.n++;
        }
    }

    return tNode;
}

// Label internal nodes by concatenating descendant tip names
// maxLen: max characters to use from each tip name (use full name if shorter)
function labelInternalNodesFromDescendants(tNode, maxLen = 3, usedNames = new Set()) {
    if (tNode === null) return tNode;

    // Process children first (post-order traversal)
    if (tNode.left !== null) {
        labelInternalNodesFromDescendants(tNode.left, maxLen, usedNames);
    }
    if (tNode.right !== null) {
        labelInternalNodesFromDescendants(tNode.right, maxLen, usedNames);
    }

    // Label internal nodes (nodes with children)
    if (tNode.left !== null && tNode.right !== null) {
        if (!tNode.name || tNode.name === 'root' || tNode.name === 'empty' || tNode.name === 'internal') {
            // Get tip names and create concatenated name
            const tips = getTipNames(tNode);
            let name = tips.map(t => truncateName(t, maxLen)).join('');

            // Handle collision by adding suffix
            let baseName = name;
            let suffix = 1;
            while (usedNames.has(name)) {
                name = baseName + suffix;
                suffix++;
            }
            usedNames.add(name);
            tNode.name = name;
        }
    }

    return tNode;
}

// Check if nodeA is an ancestor of nodeB
function isAncestor(nodeA, nodeB, tNode) {
    // Find nodeA in tree and check if nodeB is in its subtree
    const findNode = (root, name) => {
        if (root === null) return null;
        if (root.name === name) return root;
        return findNode(root.left, name) || findNode(root.right, name);
    };

    const checkDescendant = (node, targetName) => {
        if (node === null) return false;
        if (node.name === targetName) return true;
        return checkDescendant(node.left, targetName) || checkDescendant(node.right, targetName);
    };

    const nodeARef = findNode(tNode, nodeA);
    if (!nodeARef) return false;

    // Check if nodeB is a descendant of nodeA (making nodeA an ancestor of nodeB)
    return checkDescendant(nodeARef.left, nodeB) || checkDescendant(nodeARef.right, nodeB);
}

// Check if two nodes are contemporaneous (can exchange migrants)
// Two nodes are contemporaneous if neither is an ancestor of the other
function areContemporaneous(nodeA, nodeB, treeRoot) {
    if (nodeA === nodeB) return false;
    return !isAncestor(nodeA, nodeB, treeRoot) && !isAncestor(nodeB, nodeA, treeRoot);
}

// Get all node names from tree (tips first, then internal nodes in post-order)
function getAllNodeNames(tNode) {
    const tips = [];
    const internal = [];

    const traverse = (node) => {
        if (node === null) return;
        traverse(node.left);
        traverse(node.right);

        if (node.left === null && node.right === null) {
            tips.push(node.name);
        } else if (node.name && node.name !== 'root' && node.name !== 'empty') {
            internal.push(node.name);
        }
    };

    traverse(tNode);
    return { tips, internal, all: [...tips, ...internal] };
}

// Generate Newick string with internal node labels included
function recurseTreeWithLabels(tNode, newickSt) {
    if (tNode === null) return;

    if (tNode.left !== null) {
        newickSt.newick += "(";
        recurseTreeWithLabels(tNode.left, newickSt);
    }
    if (tNode.right !== null) {
        newickSt.newick += ", ";
        recurseTreeWithLabels(tNode.right, newickSt);
        newickSt.newick += ")";
        // Add internal node label after closing paren
        if (tNode.name && tNode.name !== 'root' && tNode.name !== 'empty') {
            newickSt.newick += tNode.name;
        }
    }
    // Leaf node - add name
    if (tNode.left === null && tNode.right === null) {
        newickSt.newick += tNode.name;
    }
}

function newickFromTreeWithLabels(tNode) {
    let treeSt = { newick: "" };
    recurseTreeWithLabels(tNode, treeSt);
    return treeSt.newick;
}

// Get all nodes (tips and internal) as flat array
function getAllNodes(tNode, nodeList = []) {
    if (tNode === null) return nodeList;
    nodeList.push(tNode);
    getAllNodes(tNode.left, nodeList);
    getAllNodes(tNode.right, nodeList);
    return nodeList;
}

// Get all possible migration routes (tip-to-tip pairs)
// Returns array of {source, target} for all directional pairs
function getPossibleMigrationRoutes(speciesList) {
    const routes = [];
    for (let i = 0; i < speciesList.length; i++) {
        for (let j = 0; j < speciesList.length; j++) {
            if (i !== j) {
                routes.push({
                    source: speciesList[i],
                    target: speciesList[j]
                });
            }
        }
    }
    return routes;
}

// Deep clone a tree structure
function cloneTree(tNode, parent = null) {
    if (tNode === null) return null;
    const newNode = new minNode(tNode.name, null, null, parent);
    newNode.left = cloneTree(tNode.left, newNode);
    newNode.right = cloneTree(tNode.right, newNode);
    return newNode;
}

// Generate extended Newick with introgression (hybrid) nodes
// events: [{source: 'A', target: 'B'}, ...]
// baseNewick: the labeled Newick string (with internal node labels)
// Returns extended Newick with hybrid annotations
function generateExtendedNewick(tNode, events, defaultPhi = 0.5) {
    if (!tNode || !events || events.length === 0) {
        return newickFromTreeWithLabels(tNode) + ';';
    }

    // Clone the tree to avoid modifying original
    const tree = cloneTree(tNode);

    // Label internal nodes if not already labeled
    labelInternalNodesFromDescendants(tree, 3, new Set());

    // Build a map of node names to their positions in traversal
    const nodeMap = new Map();
    const buildNodeMap = (node) => {
        if (!node) return;
        if (node.name) nodeMap.set(node.name, node);
        buildNodeMap(node.left);
        buildNodeMap(node.right);
    };
    buildNodeMap(tree);

    // For each introgression event, we need to annotate the tree
    // The source gets: (source)H[&phi=X,&tau-parent=no]
    // The target's parent gets H[&tau-parent=yes] inserted

    // Track hybrid nodes
    const hybridAnnotations = new Map(); // nodeName -> {hybridLabel, phi, isSource}

    events.forEach((event, idx) => {
        const hybridLabel = `H${idx + 1}`;

        // Mark source node for annotation
        if (nodeMap.has(event.source)) {
            hybridAnnotations.set(event.source, {
                hybridLabel,
                phi: defaultPhi,
                isSource: true
            });
        }

        // Mark target node - the hybrid appears as ancestor
        if (nodeMap.has(event.target)) {
            if (!hybridAnnotations.has(event.target)) {
                hybridAnnotations.set(event.target, {
                    hybridLabel,
                    isSource: false
                });
            }
        }
    });

    // Generate extended Newick by traversing and adding annotations
    function recurseExtended(node) {
        if (node === null) return '';

        let result = '';

        if (node.left !== null) {
            result += '(';
            result += recurseExtended(node.left);
        }
        if (node.right !== null) {
            result += ', ';
            result += recurseExtended(node.right);
            result += ')';

            // Add internal node label
            if (node.name && node.name !== 'root' && node.name !== 'empty' && node.name !== 'internal') {
                result += node.name;
            }
        }

        // Leaf node
        if (node.left === null && node.right === null) {
            result += node.name;

            // Check if this node has hybrid annotation (source)
            const annotation = hybridAnnotations.get(node.name);
            if (annotation && annotation.isSource) {
                // Wrap in parentheses and add hybrid label with phi
                result = `(${result})${annotation.hybridLabel}[&phi=${annotation.phi},&tau-parent=no]`;
            }
        }

        return result;
    }

    let extNewick = recurseExtended(tree);

    // Now we need to add the target-side hybrid nodes
    // For each event, insert H[&tau-parent=yes] near the target
    events.forEach((event, idx) => {
        const hybridLabel = `H${idx + 1}`;
        const targetNode = event.target;

        // Find the target in the newick and add hybrid as sibling/ancestor
        // This is a simplified approach - insert after target's closing structure
        const targetPattern = new RegExp(`(\\b${escapeRegex(targetNode)})(\\b|[,\\)\\[])`, 'g');

        // Check if target already has the source annotation (bidirectional case)
        if (!hybridAnnotations.get(targetNode)?.isSource) {
            // Add hybrid node as wrapper around target
            extNewick = extNewick.replace(targetPattern, (match, name, suffix) => {
                // Only replace first occurrence to avoid duplicates
                return `(${name}, ${hybridLabel}[&tau-parent=yes])${suffix}`;
            });
        }
    });

    return extNewick + ';';
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Simpler approach: generate extended Newick from string manipulation
function generateExtendedNewickFromString(baseNewick, events, defaultPhi = 0.5) {
    if (!baseNewick || !events || events.length === 0) {
        return baseNewick.endsWith(';') ? baseNewick : baseNewick + ';';
    }

    let newick = baseNewick.replace(/;$/, ''); // Remove trailing semicolon

    events.forEach((event, idx) => {
        const hybridLabel = `H${idx + 1}`;
        const source = event.source;
        const target = event.target;

        // Step 1: Annotate source - wrap it with hybrid node
        // Find source node and wrap: source -> (source)H[&phi=X,&tau-parent=no]
        const sourcePattern = new RegExp(`([(,])\\s*(${escapeRegex(source)})(\\s*[,):\\[])`, 'g');
        let sourceReplaced = false;
        newick = newick.replace(sourcePattern, (match, prefix, name, suffix) => {
            if (!sourceReplaced) {
                sourceReplaced = true;
                return `${prefix}(${name})${hybridLabel}[&phi=${defaultPhi},&tau-parent=no]${suffix}`;
            }
            return match;
        });

        // Step 2: Add target-side hybrid node
        // Find target and add hybrid as ancestor: target -> (target, H[&tau-parent=yes])
        // But we need to be careful not to double-wrap
        const targetPattern = new RegExp(`([(,])\\s*(${escapeRegex(target)})(\\s*[,):\\[])`, 'g');
        let targetReplaced = false;
        newick = newick.replace(targetPattern, (match, prefix, name, suffix) => {
            if (!targetReplaced && name !== source) { // Don't replace if same as source
                targetReplaced = true;
                // Create a new clade with target and hybrid ancestor marker
                return `${prefix}(${name}, ${hybridLabel}[&tau-parent=yes])${suffix}`;
            }
            return match;
        });
    });

    return newick + ';';
}

export { randomTree, newickFromTree, minNode, labelInternalNodes, labelInternalNodesFromDescendants, newickFromTreeWithLabels, getAllNodes, getAllNodeNames, getPossibleMigrationRoutes, cloneTree, areContemporaneous, generateExtendedNewick, generateExtendedNewickFromString }
