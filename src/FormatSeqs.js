

function formatSeqs(seqData)
{
    const lociSummary = [];
    let i;
    for(i in seqData)
        lociSummary.push(getLocus(i,seqData));
    return lociSummary;
}

function whiteSpStrip(seqData)
{
    const whiteFreeSeqData = [];
    for(let i in seqData)
    {
        whiteFreeSeqData.push({noseqs: seqData[i].noseqs, nosites: seqData[i].nosites, sequences: []})
        for(let j in seqData[i].sequences)
            whiteFreeSeqData[i].sequences.push({seq: seqData[i].sequences[j].seq.replace(/\n|\r|\s/g, ""), seqname: seqData[i].sequences[j].seqname});
    }
    return whiteFreeSeqData;;
}

function getCounts(seqData)
{
    const locusCounts = [];
    for(let i in seqData)
        locusCounts.push({noseqs: seqData[i].noseqs, nosites: seqData[i].nosites});
    return(locusCounts);
}


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
  //  console.log("text: " + text);
    return text;
} 

function CheckData(paramCompare) {
        console.log(this.props.sequenceData[1]);
        for(let locus in this.props.sequenceData)
        {
            console.log(locus);
            
            paramCompare.push({ExpNoSeqs: this.props.sequenceData[locus].noseqs, ObsNoSeqs: this.props.sequenceData[locus].sequences.length });
        } 
    }

export {formatSeqs, whiteSpStrip, getCounts}
