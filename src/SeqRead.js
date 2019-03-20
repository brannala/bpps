// parses text in bpp format to create sequenceData object

function SeqRead(input) {

    let specs; 
    let modInput;
    const sequenceData = [];
    let locusNo = 0;
    
    const errorResult = (err) => { return { sequenceData: [], error: `error: unexpected input: ${err}` }; };
    // check for correct number of sites in each sequence 
    function checkSequences(sData) {
        for(let i=0; i< sData.length; i++)
            for(let j in sData[i].sequences)
                if(Number(sData[i].nosites) !== sData[i].sequences[j].seq.length)
                    return {error: true, error_message: `expected ${sData[i].nosites} sites in sequence ${Number(j)+1} at locus ${i+1} but observed ${sData[i].sequences[j].seq.length} sites`}; 
        return {error: false};
    };
    
    modInput = input.trim();  //remove whitespace from ends of string
    while(modInput.length>0)
    {
        specs=modInput.split(/\s+/,2);  // get noseqs and nosites 
        if((specs[0].match(/[^\d]+/)!==null)||(specs[1].match(/[^\d]+/)!==null)) // if not numbers throw error
            return errorResult(`missing number of sequences (or sites) at locus ${locusNo+1}` );
        modInput = (modInput.replace(/\d+\s+\d+/,"")).trim(); // trim off noseqs and nosites
        sequenceData.push({noseqs: specs[0], nosites: specs[1], sequences: []});
        for(let i = 0; i < Number(specs[0]); i++)
        {
            let sname,seq;
            sname=modInput.split(/\s+/,1);  // extract sequence name
            if((sname[0]===null)||(sname[0].match(/[^/d+].*/)===null))
                return errorResult(`unexpected input at locus ${locusNo+1} near ${sname}`);
            modInput = (modInput.replace(/[^\d][^\s]+/,"")).trim(); // trim off sequence name
            seq=modInput.split(/\n|\r/,1);  //extract sequence
            if(seq[0]===null)
                return errorResult(`missing sequence at locus ${locusNo+1}`);
            seq[0] = seq[0].replace(/\s/g,''); // remove whitespace from interveaved sequences
            if(seq[0].match(/[\d]+/)!==null)
            {
                return errorResult(`sequence ${i+1} at locus ${locusNo+1} contains a number!`);
            }
            sequenceData[locusNo].sequences.push({seqname: sname[0], seq: seq[0]});
            if(modInput.match(/(\n|\r)+/)===null)
                modInput=modInput.replace(/.*/,"");  // trim off sequence
            else
                modInput = (modInput.replace(/.*(\n|\r)/,"")).trim(); //trim off last sequence in input file
        } 
        locusNo++;
    }
    let checkResult = checkSequences(sequenceData);
    if(checkResult.error)
        return errorResult(checkResult.error_message);
    else
        return {sequenceData: sequenceData, error: null};
}

export default SeqRead;
