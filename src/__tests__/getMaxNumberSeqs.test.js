import { getMaxNumberSeqs } from '../PriorFunc';


let mapData = new Map();
mapData.set("specimen1","species1");
mapData.set("specimen2","species1");
mapData.set("specimen3","species1");
mapData.set("specimen4","species2");
mapData.set("specimen5","species3");
mapData.set("specimen6","species3");
mapData.set("specimen7","species1");

let sequenceData = [];
let locus0 = { noseqs: 3, nosites: 10, sequences: []};
locus0.sequences.push({seqname: 'specimen1', seq: 'AATTCGCTTT'});
locus0.sequences.push({seqname: 'specimen2', seq: 'AATTCGCTTT'});
locus0.sequences.push({seqname: 'specimen3', seq: 'AATTCGCTTT'});
sequenceData.push(locus0);
let locus1 = { noseqs: 3, nosites: 10, sequences: []};
locus1.sequences.push({seqname: 'specimen4', seq: 'AATTCGCTTT'});
locus1.sequences.push({seqname: 'specimen5', seq: 'AATTCGCTTT'});
locus1.sequences.push({seqname: 'specimen6', seq: 'AATTCGCTTT'});
locus1.sequences.push({seqname: 'specimen7', seq: 'AATTCGCTTT'});
sequenceData.push(locus1);

it('finds maximum number of sequences at any locus given a species name, sequence data and map data',
   () => {
       expect(getMaxNumberSeqs('species1',sequenceData,mapData)).toBe(3);
   });
