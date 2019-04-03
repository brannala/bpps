let unphasedDistances = new Map();
unphasedDistances.set('aa',0.0);
unphasedDistances.set('ac',1.0);
unphasedDistances.set('ag',1.0);
unphasedDistances.set('at',1.0);
unphasedDistances.set('cc',0.0);
unphasedDistances.set('cg',1.0);
unphasedDistances.set('ct',1.0);
unphasedDistances.set('gg',0.0);
unphasedDistances.set('gt',1.0);
unphasedDistances.set('tt',0.0);
unphasedDistances.set('ar',0.500);
unphasedDistances.set('ay',1.0);
unphasedDistances.set('as',1.0);
unphasedDistances.set('aw',0.500);
unphasedDistances.set('ak',1.0);
unphasedDistances.set('am',0.500);
unphasedDistances.set('ab',1.0);
unphasedDistances.set('ad',0.333);
unphasedDistances.set('ah',0.333);
unphasedDistances.set('av',0.333);
unphasedDistances.set('cr',1.0);
unphasedDistances.set('cy',0.500);
unphasedDistances.set('cs',0.500);
unphasedDistances.set('cw',1.0);
unphasedDistances.set('ck',1.0);
unphasedDistances.set('cm',0.500);
unphasedDistances.set('bc',0.333);
unphasedDistances.set('cd',1.0);
unphasedDistances.set('ch',0.333);
unphasedDistances.set('cv',0.333);
unphasedDistances.set('gr',0.500);
unphasedDistances.set('gy',1.0);
unphasedDistances.set('gs',0.500);
unphasedDistances.set('gw',1.0);
unphasedDistances.set('gk',0.500);
unphasedDistances.set('gm',1.0);
unphasedDistances.set('bg',0.333);
unphasedDistances.set('dg',0.333);
unphasedDistances.set('gh',1.0);
unphasedDistances.set('gv',0.333);
unphasedDistances.set('rt',1.0);
unphasedDistances.set('ty',0.500);
unphasedDistances.set('st',1.0);
unphasedDistances.set('tw',0.500);
unphasedDistances.set('kt',0.500);
unphasedDistances.set('mt',1.0);
unphasedDistances.set('bt',0.333);
unphasedDistances.set('dt',0.333);
unphasedDistances.set('ht',0.333);
unphasedDistances.set('tv',1.0);
unphasedDistances.set('rr',0.500);
unphasedDistances.set('ry',1.0);
unphasedDistances.set('rs',0.250);
unphasedDistances.set('rw',0.250);
unphasedDistances.set('kr',0.250);
unphasedDistances.set('mr',0.250);
unphasedDistances.set('br',0.167);
unphasedDistances.set('dr',0.333);
unphasedDistances.set('hr',0.250);
unphasedDistances.set('rv',0.333);
unphasedDistances.set('yy',0.500);
unphasedDistances.set('sy',0.250);
unphasedDistances.set('wy',0.250);
unphasedDistances.set('ky',0.250);
unphasedDistances.set('my',0.250);
unphasedDistances.set('by',0.333);
unphasedDistances.set('dy',0.167);
unphasedDistances.set('hy',0.333);
unphasedDistances.set('vy',0.167);
unphasedDistances.set('ss',0.500);
unphasedDistances.set('sw',1.0);
unphasedDistances.set('ks',0.250);
unphasedDistances.set('ms',0.250);
unphasedDistances.set('bs',0.333);
unphasedDistances.set('ds',0.167);
unphasedDistances.set('hs',0.167);
unphasedDistances.set('sv',0.333);
unphasedDistances.set('ww',0.500);
unphasedDistances.set('kw',0.250);
unphasedDistances.set('mw',0.250);
unphasedDistances.set('bw',0.167);
unphasedDistances.set('dw',0.333);
unphasedDistances.set('hw',0.333);
unphasedDistances.set('vw',0.167);
unphasedDistances.set('kk',0.500);
unphasedDistances.set('km',1.0);
unphasedDistances.set('bk',0.333);
unphasedDistances.set('dk',0.333);
unphasedDistances.set('hk',0.167);
unphasedDistances.set('kv',0.167);
unphasedDistances.set('mm',0.500);
unphasedDistances.set('bm',0.167);
unphasedDistances.set('dm',0.167);
unphasedDistances.set('hm',0.333);
unphasedDistances.set('mv',0.333);
unphasedDistances.set('bb',0.333);
unphasedDistances.set('bd',0.222);
unphasedDistances.set('bh',0.222);
unphasedDistances.set('bv',0.222);
unphasedDistances.set('dd',0.333);
unphasedDistances.set('dh',0.222);
unphasedDistances.set('dv',0.222);
unphasedDistances.set('hh',0.333);
unphasedDistances.set('hv',0.222);
unphasedDistances.set('vv',0.333);


function isSpName(seqName,spName,mapData)
{
    if(mapData.get(seqName)===spName)
        return true;
    return false;
}

// gets the maximum number of seequences for each species at any locus
function getMaxNumberSeqs(spName,sequenceData,mapData)
{
    let seqMaxCount = 0;
    for(let locus of sequenceData)
    {
        let sequenceCount=0;
        for(let sequences of locus.sequences)
            if(isSpName(getSpecimen(sequences.seqname),spName,mapData))
                sequenceCount++;
        if(sequenceCount > seqMaxCount)
            seqMaxCount = sequenceCount;
    }
    return seqMaxCount;
}

function getSpecimen(seqName)
{
    return seqName.substr(seqName.indexOf('^')+1);
}

// collects sequences into seqBySpec[locus][species][seqs]
function getSeqBySpecies (sequenceData,speciesList,mapData) {
    const seqBySpec=[];
    for(let locus of sequenceData)
        seqBySpec.push([]);
    let l=0;
    for(let locus of sequenceData)
    {
        for(let species of speciesList)
        {
            let seqs = [];
            let seqsEmpty=true;
            for(let sequences of locus.sequences)
            {
//                console.log(mapData[getSpecimen(sequences.seqname)]+ " " + species);
                if(isSpName(getSpecimen(sequences.seqname),species,mapData))
                {
                    seqs.push(sequences.seq); seqsEmpty=false;
//                    console.log(getSpecimen(sequences.seqname) + " " + species); 
                }
            }
            if(!seqsEmpty)
                seqBySpec[l].push(seqs); 
        }
        l++;
    }
        return seqBySpec;
}

function pairwiseDistance(seq1,seq2)
{
    let p2Dist = 0.0;
    let missing=0;
    for(let i in seq1)
    {
	if(siteMismatchProb(seq1[i],seq2[i])===-1)
	{
	    --missing;
//	    console.log('missing at: '+ i);
	}
	else
	{
            p2Dist += siteMismatchProb(seq1[i],seq2[i]);
//	    console.log(`p2Dist at ${i} is ${p2Dist}`);
	}	}
    return p2Dist/(seq1.length + missing);
};

function siteMismatchProb(site1,site2)
{
    const duplet_array = [site1.toLowerCase(),site2.toLowerCase()];
    let duplet_string = duplet_array.sort().join('');
    const missingData = new Set();
    missingData.add('-');
    missingData.add('?');
    missingData.add('n');
    if(!missingData.has(site1)&&!missingData.has(site2))
        return unphasedDistances.get(duplet_string);
    return -1;
}


function avgDistance(sequences)
{
    let sumDist=0.0;
    if(sequences.length <= 1)
        return 0;
    for(let i=0; i < (sequences.length-1); i++)
        for (let j=i+1; j < sequences.length; j++)
    {
        sumDist += pairwiseDistance(sequences[i],sequences[j]);
    }
    return (2.0*sumDist)/(sequences.length*(sequences.length-1));
}

function maxDistance(sequences)
{
    let maxDist=0.0;
    let combinedSeqs = [];
    for(let locus of sequences)
    {
        let allSeqs=[];
        for(let seqs of locus)
            allSeqs = allSeqs.concat(seqs);
        combinedSeqs.push(allSeqs);
    }
 //   console.log(combinedSeqs);
    for(let locus of combinedSeqs)
        for(let k=0; k < (locus.length - 1); k++)
            for(let j=k; j < locus.length; j++)
                if(pairwiseDistance(locus[k],locus[j]) > maxDist)
                    maxDist = pairwiseDistance(locus[k],locus[j]);
    return maxDist;
}

function priorFromSeqs(sequences)
{
    let priorMeanTheta=0;
    let priorRootAge=0;
    let totalSpecies=0;
    for(let locus of sequences)
    {
        totalSpecies += locus.length;
        for(let species of locus)
            priorMeanTheta += avgDistance(species);
    }
    priorMeanTheta = priorMeanTheta/totalSpecies;
    priorRootAge=maxDistance(sequences);
    const priorTheta = { a: 3.0, b: priorMeanTheta*2.0 }
    const priorTau = { a: 3.0, b:priorRootAge*2.0 }
    return { priorTheta: priorTheta, priorTau: priorTau }; 
}


export { getSeqBySpecies, pairwiseDistance, avgDistance, priorFromSeqs, maxDistance, getMaxNumberSeqs }
