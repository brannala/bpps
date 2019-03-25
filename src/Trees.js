
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

export { randomTree, newickFromTree }
