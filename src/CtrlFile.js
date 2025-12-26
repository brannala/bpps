import React, { Component } from "react";
import "./CtrlFile.css";
import { ParseMapText, MapFileUpload, getSpeciesList, validateMapAgainstSequences } from "./CtrlFunc";
import { getSeqBySpecies, priorFromSeqs, getAllMaxNumberSeqs } from "./PriorFunc";
import CreateControlFile from "./CreateControlFile";
import CtrlFileOptions from "./CtrlFileOptions";
import { randomTree, newickFromTree, labelInternalNodesFromDescendants, newickFromTreeWithLabels, cloneTree, getAllNodeNames } from "./Trees";
import { ErrorBanner, WarningBanner } from "./ErrorMessage";

class CtrlFile extends Component {
    constructor(props) {
        super(props);
        this.state = { mapData: [], mapFileName: '', ctrlFileOpts: { speciesDelim: false, speciesTreeInf: true, diploid: false,
                                                                     burnin: 2000, sampleFreq: 2, mcmcSamples: 20000,
                                                                     seed: -1, jobname: 'out' },
                       nTree: "", seqBySpecies: [], priors: { priorTheta: {a: 3.0, b: 0.002}, priorTau: {a: 3.0, b: 0.002}}, numberSeqs: [], speciesList: [],
                       mapFileError: null, mapFileWarning: null,
                       // Migration configuration
                       migrationConfig: {
                           enabled: false,
                           routes: [],  // [{source: 'A', target: 'B'}, ...]
                           wprior: { alpha: 2, beta: 200 }
                       },
                       // Introgression configuration
                       introgressionConfig: {
                           enabled: false,
                           events: [],  // [{source: 'A', target: 'B'}, ...] for UI reference
                           extendedNewick: '',  // User-editable extended Newick string
                           phiprior: { alpha: 1, beta: 1 }  // Beta(a,b) prior for phi
                       },
                       introgressionExpanded: false,
                       treeObject: null,      // minNode tree structure
                       labeledNewick: "",     // Newick with internal node labels
                       allNodeNames: { tips: [], internal: [], all: [] },  // All node names for migration
                       // Collapsible section states
                       analysisExpanded: true,
                       topologyExpanded: true,
                       migrationExpanded: false,
                       mcmcExpanded: true,
                       // Tree editing state
                       treeEditMode: false,
                       sprSelectedNode: null,  // First node selected for SPR
                       newickInput: "",
                       newickError: null,
                       // Single species mode (no map file needed)
                       singleSpeciesMode: false,
                       singleSpeciesName: ''
                     };
        this.handleMapFileRead = this.handleMapFileRead.bind(this);
        this.handleEnableSingleSpeciesMode = this.handleEnableSingleSpeciesMode.bind(this);
        this.handleSingleSpeciesNameChange = this.handleSingleSpeciesNameChange.bind(this);
        this.handleApplySingleSpecies = this.handleApplySingleSpecies.bind(this);
        this.handleExitSingleSpeciesMode = this.handleExitSingleSpeciesMode.bind(this);
        this.clearMapFileError = this.clearMapFileError.bind(this);
        this.clearMapFileWarning = this.clearMapFileWarning.bind(this);
        this.handleSpecDelimCheckbox = this.handleSpecDelimCheckbox.bind(this);
        this.handleSpecTreeInfCheckbox = this.handleSpecTreeInfCheckbox.bind(this);
        this.handleDiploidCheckbox = this.handleDiploidCheckbox.bind(this);
        this.handleBurninSet = this.handleBurninSet.bind(this);
        this.handleSampleFreqSet = this.handleSampleFreqSet.bind(this);
        this.handleMcmcSamples = this.handleMcmcSamples.bind(this);
        this.handleSeedSet = this.handleSeedSet.bind(this);
        this.handleJobnameSet = this.handleJobnameSet.bind(this);
        this.handleRandomTopology = this.handleRandomTopology.bind(this);
        // Migration handlers
        this.handleToggleMigration = this.handleToggleMigration.bind(this);
        this.handleUpdateMigrationRoutes = this.handleUpdateMigrationRoutes.bind(this);
        this.handleUpdateWprior = this.handleUpdateWprior.bind(this);
        this.handleMigrationSectionToggle = this.handleMigrationSectionToggle.bind(this);
        // Introgression handlers
        this.handleToggleIntrogression = this.handleToggleIntrogression.bind(this);
        this.handleUpdateIntrogressionEvents = this.handleUpdateIntrogressionEvents.bind(this);
        this.handleIntrogressionSectionToggle = this.handleIntrogressionSectionToggle.bind(this);
        this.handleUpdateExtendedNewick = this.handleUpdateExtendedNewick.bind(this);
        this.handleUpdatePhiprior = this.handleUpdatePhiprior.bind(this);
        // Panel toggle handlers
        this.handleAnalysisSectionToggle = this.handleAnalysisSectionToggle.bind(this);
        this.handleTopologySectionToggle = this.handleTopologySectionToggle.bind(this);
        this.handleMcmcSectionToggle = this.handleMcmcSectionToggle.bind(this);
        // Tree editing handlers
        this.handleToggleTreeEditMode = this.handleToggleTreeEditMode.bind(this);
        this.handleSprNodeClick = this.handleSprNodeClick.bind(this);
        this.handleCancelSpr = this.handleCancelSpr.bind(this);
        this.handleNewickInputChange = this.handleNewickInputChange.bind(this);
        this.handleApplyNewick = this.handleApplyNewick.bind(this);
        this.handleUpdateTree = this.handleUpdateTree.bind(this);
    }

    handleRandomTopology() {
        if (this.state.speciesList.length > 0) {
            const rTree = randomTree(this.state.speciesList);
            const nT = newickFromTree(rTree);
            // Clone and label internal nodes for migration support
            const labeledTree = cloneTree(rTree);
            // Use descendant-based naming with 3 chars max per species
            const usedNames = new Set(this.state.speciesList);
            labelInternalNodesFromDescendants(labeledTree, 3, usedNames);
            const labeledNT = newickFromTreeWithLabels(labeledTree);
            const nodeNames = getAllNodeNames(labeledTree);

            this.setState({
                nTree: nT,
                treeObject: labeledTree,
                labeledNewick: labeledNT,
                allNodeNames: nodeNames,
                // Reset migration routes when topology changes
                migrationConfig: {
                    ...this.state.migrationConfig,
                    routes: []
                }
            });
        }
    }

    clearMapFileError() {
        this.setState({ mapFileError: null });
    }

    clearMapFileWarning() {
        this.setState({ mapFileWarning: null });
    }

    handleMapFileRead(fileContents,fileName)
    {
        // Clear any previous errors/warnings
        this.setState({ mapFileError: null, mapFileWarning: null });

        // Parse the map file
        const parseResult = ParseMapText(fileContents);

        if (parseResult.error) {
            this.setState({ mapFileError: parseResult.error });
            return;
        }

        const mapData = parseResult.data;

        // Validate map file against sequence data
        const validation = validateMapAgainstSequences(mapData, this.props.sequenceData);

        if (!validation.valid) {
            this.setState({ mapFileError: validation.errors.join('. ') });
            return;
        }

        // Set warning if there are specimens in sequences not in map file
        const warning = validation.warnings.length > 0 ? validation.warnings.join('. ') : null;

        const speciesList = getSpeciesList(mapData);
        const rTree = randomTree(speciesList);
        const nT = newickFromTree(rTree);
        // Clone and label internal nodes for migration support
        const labeledTree = cloneTree(rTree);
        // Use descendant-based naming with 3 chars max per species
        const usedNames = new Set(speciesList);
        labelInternalNodesFromDescendants(labeledTree, 3, usedNames);
        const labeledNT = newickFromTreeWithLabels(labeledTree);
        const nodeNames = getAllNodeNames(labeledTree);

        const seqBySpecies = getSeqBySpecies(this.props.sequenceData, speciesList, mapData);
        const priors = priorFromSeqs(seqBySpecies);

        // Compute all max sequence counts in a single pass (much faster than per-species calls)
        const maxCountsMap = getAllMaxNumberSeqs(speciesList, this.props.sequenceData, mapData);
        let numSeqs = '';
        for(let i = 0; i < speciesList.length; i++)
          numSeqs += `${maxCountsMap.get(speciesList[i])}  `;

        // Set all state in a single call
        this.setState({
            mapData: mapData,
            mapFileName: fileName,
            speciesList: speciesList,
            nTree: nT,
            treeObject: labeledTree,
            labeledNewick: labeledNT,
            allNodeNames: nodeNames,
            seqBySpecies: seqBySpecies,
            priors: priors,
            numberSeqs: numSeqs,
            mapFileWarning: warning,
            // Reset migration when new map file is loaded
            migrationConfig: {
                enabled: false,
                routes: [],
                wprior: { alpha: 2, beta: 200 }
            },
            // Exit single species mode when loading a map file
            singleSpeciesMode: false,
            singleSpeciesName: ''
        });
    }

    // Enable single species mode
    handleEnableSingleSpeciesMode() {
        this.setState({ singleSpeciesMode: true, singleSpeciesName: '' });
    }

    // Handle species name input change
    handleSingleSpeciesNameChange(e) {
        this.setState({ singleSpeciesName: e.target.value });
    }

    // Apply single species configuration
    handleApplySingleSpecies() {
        const speciesName = this.state.singleSpeciesName.trim();
        if (!speciesName) {
            this.setState({ mapFileError: 'Please enter a species name' });
            return;
        }

        // Count total sequences across all loci
        let totalSeqs = 0;
        if (this.props.sequenceData && this.props.sequenceData.length > 0) {
            // For single species, count unique sequence names across first locus
            // (assuming all loci have same sequences)
            totalSeqs = parseInt(this.props.sequenceData[0].noseqs, 10);
        }

        if (totalSeqs === 0) {
            this.setState({ mapFileError: 'No sequence data loaded. Please upload a sequence file first.' });
            return;
        }

        // Set up state for single species (pseudo map data with size > 0 to enable control file)
        const singleSpeciesMap = new Map();
        singleSpeciesMap.set(speciesName, totalSeqs);

        this.setState({
            mapData: singleSpeciesMap,
            mapFileName: '',  // No map file
            speciesList: [speciesName],
            nTree: speciesName,  // Single species "tree" is just the name
            treeObject: null,  // No tree structure needed
            labeledNewick: '',
            allNodeNames: { tips: [speciesName], internal: [], all: [speciesName] },
            seqBySpecies: [],
            priors: { priorTheta: { a: 3.0, b: 0.002 }, priorTau: { a: 3.0, b: 0.002 } },
            numberSeqs: totalSeqs.toString(),
            mapFileError: null,
            mapFileWarning: null
        });
    }

    // Exit single species mode
    handleExitSingleSpeciesMode() {
        this.setState({
            singleSpeciesMode: false,
            singleSpeciesName: '',
            mapData: [],
            mapFileName: '',
            speciesList: [],
            nTree: '',
            treeObject: null,
            labeledNewick: '',
            allNodeNames: { tips: [], internal: [], all: [] },
            numberSeqs: []
        });
    }

    handleSpecDelimCheckbox(e)
    {
        // Block enabling species delimitation when migration is active (requires A00 mode)
        if (this.state.migrationConfig.enabled && !this.state.ctrlFileOpts.speciesDelim) {
            return; // Cannot enable with migration
        }
        let cFO = {...this.state.ctrlFileOpts};
        this.state.ctrlFileOpts.speciesDelim ? cFO.speciesDelim = false : cFO.speciesDelim = true;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleSpecTreeInfCheckbox(e)
    {
        // Block enabling species tree inference when migration is active (requires A00 mode)
        if (this.state.migrationConfig.enabled && !this.state.ctrlFileOpts.speciesTreeInf) {
            return; // Cannot enable with migration
        }
        let cFO = {...this.state.ctrlFileOpts};
        this.state.ctrlFileOpts.speciesTreeInf ? cFO.speciesTreeInf = false : cFO.speciesTreeInf = true;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleDiploidCheckbox(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        this.state.ctrlFileOpts.diploid ? cFO.diploid = false : cFO.diploid = true;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleBurninSet(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        cFO.burnin = e.target.value;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleSampleFreqSet(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        cFO.sampleFreq = e.target.value;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleMcmcSamples(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        cFO.mcmcSamples = e.target.value;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleSeedSet(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        cFO.seed = e.target.value;
        this.setState({ ctrlFileOpts: cFO });
    }

    handleJobnameSet(e)
    {
        let cFO = {...this.state.ctrlFileOpts};
        cFO.jobname = e.target.value;
        this.setState({ ctrlFileOpts: cFO });
    }

    // Migration handlers
    handleToggleMigration() {
        const newEnabled = !this.state.migrationConfig.enabled;

        if (newEnabled) {
            // Force A00 mode and disable introgression when enabling migration
            const newCtrlFileOpts = {
                ...this.state.ctrlFileOpts,
                speciesDelim: false,
                speciesTreeInf: false
            };
            this.setState({
                migrationConfig: {
                    ...this.state.migrationConfig,
                    enabled: true
                },
                // Disable introgression when enabling migration
                introgressionConfig: {
                    ...this.state.introgressionConfig,
                    enabled: false
                },
                ctrlFileOpts: newCtrlFileOpts
            });
        } else {
            this.setState({
                migrationConfig: {
                    ...this.state.migrationConfig,
                    enabled: false
                }
            });
        }
    }

    handleUpdateMigrationRoutes(routes) {
        this.setState({
            migrationConfig: {
                ...this.state.migrationConfig,
                routes: routes
            }
        });
    }

    handleUpdateWprior(alpha, beta) {
        this.setState({
            migrationConfig: {
                ...this.state.migrationConfig,
                wprior: { alpha, beta }
            }
        });
    }

    handleMigrationSectionToggle() {
        this.setState({ migrationExpanded: !this.state.migrationExpanded });
    }

    // Introgression handlers
    handleToggleIntrogression() {
        const newEnabled = !this.state.introgressionConfig.enabled;

        if (newEnabled) {
            // Force A00 mode and disable migration when enabling introgression
            const newCtrlFileOpts = {
                ...this.state.ctrlFileOpts,
                speciesDelim: false,
                speciesTreeInf: false
            };
            this.setState({
                introgressionConfig: {
                    ...this.state.introgressionConfig,
                    enabled: true
                },
                // Disable migration when enabling introgression
                migrationConfig: {
                    ...this.state.migrationConfig,
                    enabled: false
                },
                ctrlFileOpts: newCtrlFileOpts
            });
        } else {
            this.setState({
                introgressionConfig: {
                    ...this.state.introgressionConfig,
                    enabled: false
                }
            });
        }
    }

    handleUpdateIntrogressionEvents(events) {
        // Use functional setState to avoid race conditions with other setState calls
        this.setState(prevState => ({
            introgressionConfig: {
                ...prevState.introgressionConfig,
                events: events
            }
        }));
    }

    handleIntrogressionSectionToggle() {
        this.setState({ introgressionExpanded: !this.state.introgressionExpanded });
    }

    handleUpdateExtendedNewick(newick) {
        // Use functional setState to avoid race conditions with other setState calls
        this.setState(prevState => ({
            introgressionConfig: {
                ...prevState.introgressionConfig,
                extendedNewick: newick
            }
        }));
    }

    handleUpdatePhiprior(alpha, beta) {
        // Use functional setState to avoid race conditions
        this.setState(prevState => ({
            introgressionConfig: {
                ...prevState.introgressionConfig,
                phiprior: { alpha, beta }
            }
        }));
    }

    // Panel toggle handlers
    handleAnalysisSectionToggle() {
        this.setState({ analysisExpanded: !this.state.analysisExpanded });
    }

    handleTopologySectionToggle() {
        this.setState({ topologyExpanded: !this.state.topologyExpanded });
    }

    handleMcmcSectionToggle() {
        this.setState({ mcmcExpanded: !this.state.mcmcExpanded });
    }

    // Tree editing handlers
    handleToggleTreeEditMode() {
        this.setState({
            treeEditMode: !this.state.treeEditMode,
            sprSelectedNode: null
        });
    }

    handleSprNodeClick(nodeName) {
        if (!this.state.sprSelectedNode) {
            // First click - select node to prune
            this.setState({ sprSelectedNode: nodeName });
        } else {
            // Second click - perform SPR if valid
            this.performSpr(this.state.sprSelectedNode, nodeName);
        }
    }

    handleCancelSpr() {
        this.setState({ sprSelectedNode: null });
    }

    // Check if targetNode is a descendant of sourceNode
    isDescendant(tree, sourceName, targetName) {
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

        const sourceNode = findNode(tree, sourceName);
        if (!sourceNode) return false;
        return checkDescendant(sourceNode, targetName);
    }

    performSpr(sourceNodeName, targetNodeName) {
        const { treeObject } = this.state;

        // Can't attach to self or within own subtree
        if (sourceNodeName === targetNodeName) {
            this.setState({ sprSelectedNode: null });
            return;
        }

        // Check if target is descendant of source (invalid move)
        if (this.isDescendant(treeObject, sourceNodeName, targetNodeName)) {
            this.setState({ sprSelectedNode: null, newickError: "Cannot attach subtree within itself" });
            setTimeout(() => this.setState({ newickError: null }), 3000);
            return;
        }

        // Perform the SPR move
        const newTree = this.doSprMove(treeObject, sourceNodeName, targetNodeName);
        if (newTree) {
            this.handleUpdateTree(newTree);
        }

        this.setState({ sprSelectedNode: null });
    }

    doSprMove(tree, sourceNodeName, targetNodeName) {
        // Deep clone the tree first
        const newTree = cloneTree(tree);

        // Find nodes and their parents
        const findNodeWithParent = (node, name, parent = null) => {
            if (!node) return null;
            if (node.name === name) return { node, parent };
            return findNodeWithParent(node.left, name, node) || findNodeWithParent(node.right, name, node);
        };

        const sourceResult = findNodeWithParent(newTree, sourceNodeName);
        const targetResult = findNodeWithParent(newTree, targetNodeName);

        if (!sourceResult || !targetResult || !sourceResult.parent) {
            return null; // Can't move root
        }

        const sourceNode = sourceResult.node;
        const sourceParent = sourceResult.parent;
        const targetNode = targetResult.node;
        const targetParent = targetResult.parent;

        // Step 1: Remove source from its parent, replace parent with sibling
        const sibling = sourceParent.left === sourceNode ? sourceParent.right : sourceParent.left;

        if (sourceParent.father) {
            // sourceParent is not root
            if (sourceParent.father.left === sourceParent) {
                sourceParent.father.left = sibling;
            } else {
                sourceParent.father.right = sibling;
            }
            if (sibling) sibling.father = sourceParent.father;
        } else {
            // sourceParent is root - sibling becomes new root
            if (sibling) sibling.father = null;
            // This case needs special handling - return sibling as new root
            // But we need to reattach source somewhere
        }

        // Step 2: Insert source between target and its parent
        if (targetParent) {
            const newInternal = sourceParent; // Reuse the old parent node
            newInternal.father = targetParent;

            if (targetParent.left === targetNode) {
                targetParent.left = newInternal;
            } else {
                targetParent.right = newInternal;
            }

            newInternal.left = sourceNode;
            newInternal.right = targetNode;
            sourceNode.father = newInternal;
            targetNode.father = newInternal;

            // Find and return the root
            let root = newInternal;
            while (root.father) root = root.father;
            return root;
        } else {
            // Target is root - create new root
            const newRoot = sourceParent;
            newRoot.father = null;
            newRoot.left = sourceNode;
            newRoot.right = targetNode;
            sourceNode.father = newRoot;
            targetNode.father = newRoot;
            return newRoot;
        }
    }

    handleUpdateTree(newTree) {
        const { speciesList } = this.state;

        // Re-label internal nodes
        const usedNames = new Set(speciesList);
        labelInternalNodesFromDescendants(newTree, 3, usedNames);

        const nT = newickFromTree(newTree);
        const labeledNT = newickFromTreeWithLabels(newTree);
        const nodeNames = getAllNodeNames(newTree);

        this.setState({
            treeObject: newTree,
            nTree: nT,
            labeledNewick: labeledNT,
            allNodeNames: nodeNames,
            newickInput: nT,
            // Reset migration routes when topology changes
            migrationConfig: {
                ...this.state.migrationConfig,
                routes: []
            }
        });
    }

    handleNewickInputChange(e) {
        this.setState({ newickInput: e.target.value, newickError: null });
    }

    handleApplyNewick() {
        const { newickInput, nTree, speciesList } = this.state;

        // Parse and validate the Newick string
        // Use newickInput if user typed something, otherwise fall back to nTree (pre-populated value)
        try {
            const inputStr = (newickInput || nTree || '').trim();
            if (!inputStr) {
                this.setState({ newickError: "Please enter a Newick string" });
                return;
            }

            const parsed = this.parseNewick(inputStr);
            if (!parsed) {
                this.setState({ newickError: "Could not parse Newick string. Check parentheses and format." });
                return;
            }

            // Verify all species are present
            const tipNames = this.getTipNames(parsed);

            if (!tipNames || tipNames.length === 0) {
                this.setState({ newickError: "No species found in Newick string" });
                return;
            }

            const speciesSet = new Set(speciesList);
            const tipSet = new Set(tipNames);

            if (tipNames.length !== speciesList.length) {
                this.setState({ newickError: `Expected ${speciesList.length} species, found ${tipNames.length}. Tips found: ${tipNames.join(', ')}` });
                return;
            }

            for (const species of speciesList) {
                if (!tipSet.has(species)) {
                    this.setState({ newickError: `Missing species from map file: ${species}` });
                    return;
                }
            }

            for (const tip of tipNames) {
                if (!speciesSet.has(tip)) {
                    this.setState({ newickError: `Species "${tip}" not in map file. Expected: ${speciesList.join(', ')}` });
                    return;
                }
            }

            this.handleUpdateTree(parsed);
            this.setState({ newickError: null });
        } catch (err) {
            this.setState({ newickError: "Parse error: " + err.message });
        }
    }

    getTipNames(node) {
        if (!node) return [];
        if (!node.left && !node.right) return [node.name];
        return [...this.getTipNames(node.left), ...this.getTipNames(node.right)];
    }

    // Newick parser - handles spaces, branch lengths, and internal node labels
    parseNewick(str) {
        // Remove trailing semicolon and all extra whitespace
        str = str.replace(/;?\s*$/, '').trim();
        // Normalize whitespace: remove spaces around structural characters
        str = str.replace(/\s*\(\s*/g, '(')
                 .replace(/\s*\)\s*/g, ')')
                 .replace(/\s*,\s*/g, ',')
                 .replace(/\s*:\s*/g, ':');

        if (!str || str.length === 0) return null;

        let pos = 0;

        const parseNode = () => {
            if (pos >= str.length) return null;

            if (str[pos] === '(') {
                // Internal node
                pos++; // skip '('

                const left = parseNode();
                if (!left) {
                    throw new Error(`Expected node after '(' at position ${pos}`);
                }

                if (pos >= str.length || str[pos] !== ',') {
                    throw new Error(`Expected ',' after first child at position ${pos}`);
                }
                pos++; // skip comma

                const right = parseNode();
                if (!right) {
                    throw new Error(`Expected node after ',' at position ${pos}`);
                }

                if (pos >= str.length || str[pos] !== ')') {
                    throw new Error(`Expected ')' at position ${pos}, found '${str[pos] || 'end of string'}'`);
                }
                pos++; // skip ')'

                // Read optional internal node label
                let name = '';
                while (pos < str.length && str[pos] !== ',' && str[pos] !== ')' && str[pos] !== ';' && str[pos] !== ':') {
                    name += str[pos];
                    pos++;
                }
                // Skip branch length if present
                if (pos < str.length && str[pos] === ':') {
                    pos++;
                    while (pos < str.length && str[pos] !== ',' && str[pos] !== ')' && str[pos] !== ';') {
                        pos++;
                    }
                }

                const node = { name: name || 'internal', left, right, father: null };
                if (left) left.father = node;
                if (right) right.father = node;
                return node;
            } else {
                // Leaf node - read name until delimiter
                let name = '';
                while (pos < str.length && str[pos] !== ',' && str[pos] !== ')' && str[pos] !== ';' && str[pos] !== ':' && str[pos] !== '(') {
                    name += str[pos];
                    pos++;
                }
                // Skip branch length if present
                if (pos < str.length && str[pos] === ':') {
                    pos++;
                    while (pos < str.length && str[pos] !== ',' && str[pos] !== ')' && str[pos] !== ';') {
                        pos++;
                    }
                }

                if (!name) {
                    throw new Error(`Empty species name at position ${pos}`);
                }
                return { name, left: null, right: null, father: null };
            }
        };

        try {
            const tree = parseNode();
            // Check we consumed the entire string
            if (pos < str.length) {
                throw new Error(`Unexpected characters after tree: '${str.substring(pos)}'`);
            }
            return tree;
        } catch (e) {
            throw e; // Re-throw to be caught by handleApplyNewick
        }
    }

    render() {
        return (
            <div>
              <div className="mapfile-box">
                <h2>Step 3: Create Control File</h2>

                {/* Map file upload or single species mode */}
                {!this.state.singleSpeciesMode ? (
                    <div className="map-options">
                        <MapFileUpload sequenceData={this.props.sequenceData} readFile={this.handleMapFileRead} />
                        <div className="single-species-toggle">
                            <span>or</span>
                            <button
                                type="button"
                                className="smallButton single-species-btn"
                                onClick={this.handleEnableSingleSpeciesMode}
                            >
                                Single Population Analysis
                            </button>
                            <span className="single-species-hint">(no map file needed)</span>
                        </div>
                    </div>
                ) : (
                    <div className="single-species-panel">
                        <div className="single-species-header">
                            <span className="single-species-label">Single Population Analysis</span>
                            <button
                                type="button"
                                className="smallButton back-button"
                                onClick={this.handleExitSingleSpeciesMode}
                            >
                                Back
                            </button>
                        </div>
                        <div className="single-species-form">
                            <label>Population name:</label>
                            <input
                                type="text"
                                value={this.state.singleSpeciesName}
                                onChange={this.handleSingleSpeciesNameChange}
                                placeholder="e.g., H or Human"
                                className="single-species-input"
                            />
                            <button
                                type="button"
                                className="smallButton"
                                onClick={this.handleApplySingleSpecies}
                                disabled={!this.state.singleSpeciesName.trim()}
                            >
                                Apply
                            </button>
                        </div>
                        {this.state.mapData.size > 0 && (
                            <div className="single-species-info">
                                Population "{this.state.speciesList[0]}" with {this.state.numberSeqs} sequences configured.
                            </div>
                        )}
                    </div>
                )}
                <ErrorBanner message={this.state.mapFileError} onDismiss={this.clearMapFileError} />
                <WarningBanner message={this.state.mapFileWarning} onDismiss={this.clearMapFileWarning} />

                {/* Control file preview - full width */}
                <CreateControlFile sequenceData={this.props.sequenceData} mapData={this.state.mapData} seqFileName={this.props.seqFileName}
                                   mapFileName={this.state.mapFileName} ctrlFileOpts={this.state.ctrlFileOpts} speciesList={this.state.speciesList}
                                   numberSeqs={this.state.numberSeqs} nTree={this.state.nTree} labeledNewick={this.state.labeledNewick}
                                   priors={this.state.priors} migrationConfig={this.state.migrationConfig}
                                   introgressionConfig={this.state.introgressionConfig}
                                   singleSpeciesMode={this.state.singleSpeciesMode}></CreateControlFile>

                {/* Options below - full width */}
                <CtrlFileOptions mapData={this.state.mapData} ctrlFileOpts={this.state.ctrlFileOpts}
                                 speciesList={this.state.speciesList}
                                 treeObject={this.state.treeObject}
                                 allNodeNames={this.state.allNodeNames}
                                 migrationConfig={this.state.migrationConfig}
                                 introgressionConfig={this.state.introgressionConfig}
                                 // Panel expanded states
                                 analysisExpanded={this.state.analysisExpanded}
                                 topologyExpanded={this.state.topologyExpanded}
                                 migrationExpanded={this.state.migrationExpanded}
                                 introgressionExpanded={this.state.introgressionExpanded}
                                 mcmcExpanded={this.state.mcmcExpanded}
                                 // Tree editing state
                                 treeEditMode={this.state.treeEditMode}
                                 sprSelectedNode={this.state.sprSelectedNode}
                                 newickInput={this.state.newickInput}
                                 newickError={this.state.newickError}
                                 nTree={this.state.nTree}
                                 // Handlers
                                 handleSpecDelimCheckbox={this.handleSpecDelimCheckbox}
                                 handleSpecTreeInfCheckbox={this.handleSpecTreeInfCheckbox}
                                 handleDiploidCheckbox={this.handleDiploidCheckbox}
                                 handleBurninSet={this.handleBurninSet}
                                 handleSampleFreqSet={this.handleSampleFreqSet}
                                 handleMcmcSamples={this.handleMcmcSamples}
                                 handleSeedSet={this.handleSeedSet}
                                 handleJobnameSet={this.handleJobnameSet}
                                 handleRandomTopology={this.handleRandomTopology}
                                 handleToggleMigration={this.handleToggleMigration}
                                 handleUpdateMigrationRoutes={this.handleUpdateMigrationRoutes}
                                 handleUpdateWprior={this.handleUpdateWprior}
                                 handleToggleIntrogression={this.handleToggleIntrogression}
                                 handleUpdateIntrogressionEvents={this.handleUpdateIntrogressionEvents}
                                 handleIntrogressionSectionToggle={this.handleIntrogressionSectionToggle}
                                 handleUpdateExtendedNewick={this.handleUpdateExtendedNewick}
                                 handleUpdatePhiprior={this.handleUpdatePhiprior}
                                 labeledNewick={this.state.labeledNewick}
                                 // Panel toggle handlers
                                 handleAnalysisSectionToggle={this.handleAnalysisSectionToggle}
                                 handleTopologySectionToggle={this.handleTopologySectionToggle}
                                 handleMigrationSectionToggle={this.handleMigrationSectionToggle}
                                 handleMcmcSectionToggle={this.handleMcmcSectionToggle}
                                 // Tree editing handlers
                                 handleToggleTreeEditMode={this.handleToggleTreeEditMode}
                                 handleSprNodeClick={this.handleSprNodeClick}
                                 handleCancelSpr={this.handleCancelSpr}
                                 handleNewickInputChange={this.handleNewickInputChange}
                                 handleApplyNewick={this.handleApplyNewick}/>
              </div>
            </div>
        );
    }
}

export default CtrlFile;
