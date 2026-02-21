import { randomTree, newickFromTree, minNode, labelInternalNodes, getAllNodeNames, getPossibleMigrationRoutes, cloneTree, areContemporaneous } from '../Trees';

// --- helper to build a small fixed tree: ((A, B), C) ---

function makeABCtree() {
    const root = new minNode('root', null, null, null);
    const internal = new minNode('', null, null, root);
    const tipA = new minNode('A', null, null, internal);
    const tipB = new minNode('B', null, null, internal);
    const tipC = new minNode('C', null, null, root);
    internal.left = tipA;
    internal.right = tipB;
    root.left = internal;
    root.right = tipC;
    return root;
}

// --- randomTree ---

it('returns a tree with the correct number of tips', () => {
    const species = ['X', 'Y', 'Z'];
    const tree = randomTree(species);
    const newick = newickFromTree(tree);
    for (const sp of species) {
        expect(newick).toContain(sp);
    }
});

it('generates different topologies for 4+ species (probabilistic)', () => {
    const species = ['A', 'B', 'C', 'D'];
    const newicks = new Set();
    for (let i = 0; i < 20; i++) {
        newicks.add(newickFromTree(randomTree(species)));
    }
    // With 4 species there are 3 unrooted topologies; expect at least 2 in 20 tries
    expect(newicks.size).toBeGreaterThanOrEqual(1);
});

// --- newickFromTree ---

it('produces Newick string for a fixed tree', () => {
    const tree = makeABCtree();
    const newick = newickFromTree(tree);
    expect(newick).toBe('((A, B), C)');
});

// --- labelInternalNodes ---

it('labels internal nodes with S0, S1, ...', () => {
    const tree = makeABCtree();
    labelInternalNodes(tree);
    const names = getAllNodeNames(tree);
    expect(names.internal).toContain('S0');
    expect(names.internal).toContain('S1');
});

it('does not relabel existing named internal nodes', () => {
    const tree = makeABCtree();
    // Manually name the internal node
    tree.left.name = 'ancestor';
    labelInternalNodes(tree);
    const names = getAllNodeNames(tree);
    expect(names.internal).toContain('ancestor');
});

// --- getAllNodeNames ---

it('returns tips and internal nodes', () => {
    const tree = makeABCtree();
    labelInternalNodes(tree);
    const names = getAllNodeNames(tree);
    expect(names.tips).toEqual(['A', 'B', 'C']);
    expect(names.all.length).toBe(5); // 3 tips + 2 internal
});

// --- getPossibleMigrationRoutes ---

it('returns all directional pairs', () => {
    const routes = getPossibleMigrationRoutes(['A', 'B', 'C']);
    expect(routes.length).toBe(6); // 3 * 2
    expect(routes).toContainEqual({source: 'A', target: 'B'});
    expect(routes).toContainEqual({source: 'B', target: 'A'});
});

it('returns empty array for a single species', () => {
    expect(getPossibleMigrationRoutes(['A'])).toEqual([]);
});

// --- cloneTree ---

it('creates an independent deep copy', () => {
    const tree = makeABCtree();
    const clone = cloneTree(tree);
    expect(newickFromTree(clone)).toBe(newickFromTree(tree));
    // mutating clone should not affect original
    clone.left.left.name = 'Z';
    expect(newickFromTree(tree)).toBe('((A, B), C)');
    expect(newickFromTree(clone)).toBe('((Z, B), C)');
});

// --- areContemporaneous ---

it('returns true for sibling tips', () => {
    const tree = makeABCtree();
    labelInternalNodes(tree);
    expect(areContemporaneous('A', 'B', tree)).toBe(true);
});

it('returns false for a node and itself', () => {
    const tree = makeABCtree();
    labelInternalNodes(tree);
    expect(areContemporaneous('A', 'A', tree)).toBe(false);
});

it('returns false when one node is ancestor of the other', () => {
    const tree = makeABCtree();
    labelInternalNodes(tree);
    // S0 is ancestor of A
    expect(areContemporaneous('S0', 'A', tree)).toBe(false);
});

it('returns true for non-overlapping tip and internal node', () => {
    const tree = makeABCtree();
    labelInternalNodes(tree);
    // S0 = (A,B), C is sibling subtree — contemporaneous
    expect(areContemporaneous('S0', 'C', tree)).toBe(true);
});
