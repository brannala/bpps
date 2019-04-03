import { getSeqBySpecies } from '../PriorFunc';
import { getSpeciesList } from '../CtrlFunc';

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
locus0.sequences.push({seqname: 'specimen1', seq: 'AATTCGCTCC'});
locus0.sequences.push({seqname: 'specimen2', seq: 'AATTCGCTTC'});
locus0.sequences.push({seqname: 'specimen3', seq: 'AATTCGCTTG'});
sequenceData.push(locus0);
let locus1 = { noseqs: 3, nosites: 10, sequences: []};
locus1.sequences.push({seqname: 'specimen4', seq: 'AATTCGCTTA'});
locus1.sequences.push({seqname: 'specimen5', seq: 'AATTCGCTAA'});
locus1.sequences.push({seqname: 'specimen6', seq: 'AATTCGCTAG'});
locus1.sequences.push({seqname: 'specimen7', seq: 'AATTCGCTAC'});
sequenceData.push(locus1);

const sNL = ["species1","species2","species3"];
const sBS = [[['AATTCGCTCC','AATTCGCTTC','AATTCGCTTG']],[['AATTCGCTAC'],['AATTCGCTTA'],['AATTCGCTAA','AATTCGCTAG']]];

it('gets array of unique species names from mapData',
   () => {
       expect(getSpeciesList(mapData)).toEqual(sNL)});

it('gets matrix of sequences for each species at each locus',
   () => {
       expect(getSeqBySpecies(sequenceData,getSpeciesList(mapData),mapData)).toEqual(sBS)});
