// functions that summarizing sequences for display

// create a vector with a string for each locus used to display sequence data
function formatSeqs(seqData)
{
    const lociSummary = [];
    let i;
    for(i in seqData)
        lociSummary.push(getLocus(i,seqData));
    return lociSummary;
}

// create a vector of objects with noseqs and nosites used for display 
function getCounts(seqData)
{
    const locusCounts = [];
    for(let i in seqData)
        locusCounts.push({noseqs: seqData[i].noseqs, nosites: seqData[i].nosites});
    return(locusCounts);
}

// create a formatted string of seqNames and sequences to display sequence data
function getLocus(locusNo,seqData)
{
    // create copy of seqData to sort in place
    const sData = {noseqs: seqData[locusNo].noseqs, nosites: seqData[locusNo].nosites, sequences: []};                                                              
        for(let j in seqData[locusNo].sequences)
            sData.sequences.push({seq: seqData[locusNo].sequences[j].seq, seqname: seqData[locusNo].sequences[j].seqname});                 
    // finds longest sequence name
    const longestName = sData.sequences.sort(function (a, b) { return b.seqname.length - a.seqname.length; })[0].seqname;
    // pad a name with whitespace until its length equals longestName
    const padName = (longName, currName) => { let newName=currName; let diff=longName.length - currName.length; for(let i=1; i<=diff; i++) newName += " "; return (newName); };
    // create a text string for displaying locus
    let text="";
    for(let i=0; i< seqData[locusNo].sequences.length; i++)
    {
        text += (padName(longestName,seqData[locusNo].sequences[i].seqname) + "  " + seqData[locusNo].sequences[i].seq );
        if(i !== seqData[locusNo].sequences.length -1)
            text += "\n";
    }
    return text;
} 

export {formatSeqs, getCounts}
