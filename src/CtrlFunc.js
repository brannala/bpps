
function pairwiseDistance(seq1,seq2)
{
    let p2Dist = 0.0;
    for(let i in seq1)
    {
        if(seq1[i]!==seq2[i]) p2Dist += 1;
    }
    return p2Dist/seq1.length;
}

export { pairwiseDistance }
