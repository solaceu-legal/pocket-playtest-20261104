(function(root){
'use strict';
const FOODS=['dumpling','shrimp','egg','greens','mushroom','corn'];
function random(seed){return function(){seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
function shuffle(a,rng=Math.random){for(let i=a.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
// Empty cells, including a one-cell border, may be crossed with at most two turns.
function connect(board,cols,rows,a,b){
 if(a===b||board[a]==null||board[a]!==board[b])return null;
 const w=cols+2,h=rows+2,s=[a%cols+1,Math.floor(a/cols)+1],t=[b%cols+1,Math.floor(b/cols)+1],dirs=[[1,0],[0,1],[-1,0],[0,-1]];
 const q=[{x:s[0],y:s[1],d:-1,turns:0,path:[s]}],best=new Map();
 for(let i=0;i<q.length;i++){
  const cur=q[i];
  for(let d=0;d<4;d++){
   const turns=cur.turns+(cur.d!==-1&&cur.d!==d?1:0);if(turns>2)continue;
   const x=cur.x+dirs[d][0],y=cur.y+dirs[d][1];if(x<0||x>=w||y<0||y>=h)continue;
   if(x===t[0]&&y===t[1])return [...cur.path,[x,y]];
   if(x===s[0]&&y===s[1])continue;
   if(x>0&&x<=cols&&y>0&&y<=rows&&board[(y-1)*cols+x-1]!=null)continue;
   const key=(y*w+x)*4+d;if(best.has(key)&&best.get(key)<=turns)continue;
   best.set(key,turns);q.push({x,y,d,turns,path:[...cur.path,[x,y]]});
  }
 }
 return null;
}
function findPair(board,cols,rows){for(let a=0;a<board.length;a++)if(board[a]!=null)for(let b=a+1;b<board.length;b++)if(board[a]===board[b]){const path=connect(board,cols,rows,a,b);if(path)return {a,b,path};}return null;}
// Authored layouts are calibrated offline and ship with a complete removal proof.
// Authored layouts are calibrated offline and ship with a complete removal proof.
const DRAWER_LEVELS=[{"name":"打开文具抽屉","cols":4,"rows":4,"holes":[],"kinds":4,"board":[0,1,2,1,0,1,3,2,0,3,2,3,3,2,0,1],"solution":[[1,5],[6,9],[3,15],[4,8],[10,13],[2,7],[0,14],[11,12]],"seed":982201,"tip":"先找相邻的相同物件，慢慢熟悉规则。","layoutVersion":"drawer-v2","difficulty":{"adjacent":3,"openingMoves":6,"openingMeanChoices":7.75,"meanPairDistance":2.5,"openingMeanTurns":0.75,"unlocks":8,"score":55.38,"rank":1}},{"name":"隔一格找搭档","cols":6,"rows":4,"holes":[],"kinds":5,"board":[1,1,3,0,2,0,0,3,0,4,3,0,1,4,2,1,4,2,3,1,0,2,4,1],"solution":[[16,22],[0,1],[2,7],[5,11],[3,8],[9,13],[12,19],[4,14],[17,21],[6,20],[10,18],[15,23]],"seed":986061,"tip":"搭档不一定挨着，隔着空格也能连。","layoutVersion":"drawer-v2","difficulty":{"adjacent":3,"openingMoves":6,"openingMeanChoices":8.6,"meanPairDistance":2.67,"openingMeanTurns":0.4,"unlocks":14,"score":68.74,"rank":2}},{"name":"拐个弯试试","cols":6,"rows":5,"holes":[],"kinds":6,"board":[2,5,3,0,4,2,4,1,0,2,0,5,0,1,2,3,1,2,1,5,4,5,3,3,2,0,1,0,4,1],"solution":[[7,13],[22,23],[11,21],[1,19],[3,25],[8,12],[9,14],[16,29],[4,6],[18,26],[10,27],[0,5],[2,15],[17,24],[20,28]],"seed":989968,"tip":"先消一对，让下一条连线露出来。","layoutVersion":"drawer-v2","difficulty":{"adjacent":2,"openingMoves":7,"openingMeanChoices":9.83,"meanPairDistance":3.53,"openingMeanTurns":1,"unlocks":16,"score":86.08,"rank":3}},{"name":"先从四角开始","cols":6,"rows":6,"holes":[0,5,30,35],"kinds":6,"board":[null,0,2,5,3,null,4,5,3,1,5,1,0,1,3,2,1,3,1,3,4,2,0,4,2,0,1,3,2,0,null,5,2,4,0,null],"solution":[[8,14],[15,21],[13,16],[19,27],[7,10],[12,25],[24,32],[29,34],[1,22],[3,31],[4,17],[6,20],[2,28],[9,11],[18,26],[23,33]],"seed":994251,"tip":"留意抽屉四角，外沿也可以绕线。","layoutVersion":"drawer-v2","difficulty":{"adjacent":2,"openingMoves":6,"openingMeanChoices":9.14,"meanPairDistance":3.38,"openingMeanTurns":1,"unlocks":20,"score":87.87,"rank":4}},{"name":"边缘藏着机会","cols":6,"rows":6,"holes":[],"kinds":7,"board":[2,4,5,2,1,5,1,2,3,3,0,2,3,0,1,0,1,6,1,4,3,5,2,1,6,0,4,3,0,6,0,2,3,5,6,4],"solution":[[8,9],[6,18],[10,15],[17,29],[2,21],[20,27],[7,22],[19,26],[13,25],[0,31],[3,11],[5,33],[24,34],[1,35],[4,14],[12,32],[16,23],[28,30]],"seed":998111,"tip":"先找边缘的搭档，给里面腾出空间。","layoutVersion":"drawer-v2","difficulty":{"adjacent":1,"openingMoves":5,"openingMeanChoices":9.25,"meanPairDistance":3.78,"openingMeanTurns":1.38,"unlocks":21,"score":101.72,"rank":5}},{"name":"先清出一个缺口","cols":6,"rows":6,"holes":[],"kinds":7,"board":[0,6,2,3,4,1,5,1,5,6,3,2,0,5,2,3,0,3,1,6,2,4,2,0,4,3,5,0,1,6,1,4,2,3,0,1],"solution":[[14,20],[8,13],[9,19],[3,10],[15,25],[0,12],[5,35],[23,34],[28,30],[22,32],[16,27],[7,18],[2,11],[4,21],[1,29],[6,26],[17,33],[24,31]],"seed":1001924,"tip":"先打开一个缺口，再找里面的搭档。","layoutVersion":"drawer-v2","difficulty":{"adjacent":1,"openingMoves":5,"openingMeanChoices":7.88,"meanPairDistance":3.67,"openingMeanTurns":1.38,"unlocks":20,"score":102.9,"rank":6}},{"name":"别急着消近处","cols":6,"rows":6,"holes":[],"kinds":8,"board":[3,1,6,1,0,1,0,3,4,2,7,6,1,2,5,3,0,1,6,5,6,7,1,0,5,0,4,0,7,4,7,5,2,4,2,3],"solution":[[1,3],[32,34],[5,17],[16,23],[28,30],[0,7],[9,13],[14,19],[4,25],[18,20],[2,11],[15,35],[10,21],[6,27],[8,26],[12,22],[24,31],[29,33]],"seed":1006677,"tip":"近处的物件不一定先消得掉，试试绕边。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":5,"openingMeanChoices":5.75,"meanPairDistance":3.33,"openingMeanTurns":1.63,"unlocks":18,"score":113.58,"rank":7}},{"name":"让空格连起来","cols":6,"rows":7,"holes":[0,5,36,41],"kinds":8,"board":[null,5,7,2,6,null,6,7,3,1,0,1,3,4,6,4,6,4,1,0,5,2,1,0,2,1,0,7,2,5,4,0,1,2,7,3,null,5,2,3,0,null],"solution":[[23,40],[11,22],[21,28],[1,37],[2,7],[3,24],[18,25],[19,26],[15,17],[14,16],[35,39],[33,38],[4,6],[8,12],[13,30],[10,31],[9,32],[20,29],[27,34]],"seed":1017117,"tip":"观察空格能连到哪里，再决定下一对。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":4,"openingMeanChoices":6.25,"meanPairDistance":3.53,"openingMeanTurns":1.5,"unlocks":15,"score":114.4,"rank":8}},{"name":"绕过中间的小物","cols":6,"rows":7,"holes":[20,21],"kinds":9,"board":[0,4,2,7,3,5,5,7,6,3,4,1,2,8,2,0,7,0,8,1,null,null,6,3,2,0,1,3,4,0,1,6,7,1,5,8,6,1,0,5,8,4],"solution":[[12,24],[17,29],[19,26],[28,41],[15,25],[22,31],[9,27],[33,37],[13,40],[3,7],[2,14],[1,10],[0,38],[5,6],[8,36],[18,35],[4,23],[11,30],[16,32],[34,39]],"seed":1017499,"tip":"没有相邻的一对了，找找能绕线的搭档。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":3,"openingMeanChoices":5.25,"meanPairDistance":4.4,"openingMeanTurns":1.5,"unlocks":19,"score":126.42,"rank":9}},{"name":"半程通道挑战","cols":6,"rows":7,"holes":[],"kinds":9,"board":[2,1,3,4,5,6,0,2,0,7,8,0,2,0,7,6,1,8,4,5,4,7,3,1,6,2,0,6,7,5,8,1,2,3,0,1,1,2,8,4,5,3],"solution":[[23,35],[11,34],[22,33],[0,12],[21,28],[1,36],[30,38],[6,13],[3,18],[10,17],[5,15],[9,14],[16,31],[19,40],[7,25],[8,26],[4,29],[2,41],[20,39],[24,27],[32,37]],"seed":1021547,"tip":"先清出一条通道，下一对就会出现。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":2,"openingMeanChoices":4.56,"meanPairDistance":3.86,"openingMeanTurns":1.78,"unlocks":15,"score":127.97,"rank":10}},{"name":"先后顺序很重要","cols":6,"rows":7,"holes":[],"kinds":10,"board":[8,5,3,9,6,4,9,0,1,6,2,0,5,8,0,3,7,9,2,7,2,9,4,1,8,4,7,5,0,6,4,6,5,3,1,0,7,1,2,0,3,8],"solution":[[11,35],[23,34],[0,24],[1,12],[25,30],[19,26],[27,32],[3,6],[4,9],[2,15],[7,28],[20,38],[14,39],[5,22],[16,36],[8,37],[33,40],[10,18],[13,41],[17,21],[29,31]],"seed":1024373,"tip":"点之前想一下：这一对能帮你腾开什么？","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":2,"openingMeanChoices":4.44,"meanPairDistance":4.05,"openingMeanTurns":1.56,"unlocks":17,"score":134.78,"rank":11}},{"name":"抽屉外沿的路","cols":6,"rows":8,"holes":[0,5,42,47],"kinds":10,"board":[null,1,2,3,8,null,0,5,3,4,5,0,6,1,8,6,1,3,0,2,5,7,0,4,9,1,7,4,1,9,4,9,8,2,6,7,8,0,1,9,0,6,null,2,7,3,5,null],"solution":[[6,18],[19,43],[7,20],[21,26],[14,32],[25,38],[22,37],[16,28],[23,30],[12,34],[8,17],[2,33],[11,40],[9,27],[35,44],[3,45],[4,36],[1,13],[10,46],[15,41],[24,29],[31,39]],"seed":1038996,"tip":"抽屉外沿和空格，都是可以借的路。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":2,"openingMeanChoices":4.78,"meanPairDistance":4.64,"openingMeanTurns":1.33,"unlocks":24,"score":136.59,"rank":12}},{"name":"留白也要会利用","cols":6,"rows":8,"holes":[20,21,26,27],"kinds":11,"board":[0,1,8,2,4,7,9,4,6,0,1,3,2,0,3,6,9,5,7,5,null,null,8,1,3,4,null,null,0,10,10,1,2,10,7,9,7,8,9,6,3,5,10,5,8,2,6,4],"solution":[[17,41],[18,36],[11,40],[10,23],[39,46],[16,38],[37,44],[30,33],[32,45],[14,24],[13,28],[8,15],[4,7],[3,12],[6,35],[19,43],[0,9],[1,31],[2,22],[5,34],[25,47],[29,42]],"seed":1057520,"tip":"留白连着哪里？先找能打开新通道的一对。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":3,"openingMeanChoices":3.33,"meanPairDistance":4.55,"openingMeanTurns":1.56,"unlocks":14,"score":145.79,"rank":13}},{"name":"从一对打开局面","cols":6,"rows":8,"holes":[20,27],"kinds":11,"board":[5,7,0,6,10,7,2,3,5,8,0,4,9,10,0,1,4,9,1,3,null,9,7,1,8,10,4,null,2,6,4,0,6,5,6,10,0,8,9,2,3,7,3,2,1,0,5,8],"solution":[[1,5],[4,35],[2,10],[29,34],[0,8],[11,16],[9,47],[33,46],[28,39],[21,38],[19,40],[13,25],[14,31],[24,37],[36,45],[23,44],[7,42],[3,32],[6,43],[12,17],[15,18],[22,41],[26,30]],"seed":1052779,"tip":"先从露出的搭档入手，逐步向里清空。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":2,"openingMeanChoices":2.4,"meanPairDistance":4.35,"openingMeanTurns":1.6,"unlocks":18,"score":147.7,"rank":14}},{"name":"给里面腾条路","cols":6,"rows":8,"holes":[],"kinds":12,"board":[5,1,11,3,2,4,8,9,4,9,10,2,0,5,6,7,5,11,4,2,1,5,0,1,11,3,6,2,7,6,8,11,8,10,3,0,7,8,0,6,9,3,1,4,10,9,7,10],"solution":[[6,30],[24,31],[32,37],[44,47],[18,43],[25,41],[35,38],[26,39],[19,27],[13,21],[15,28],[7,9],[3,34],[1,20],[10,33],[4,11],[0,16],[2,17],[14,29],[23,42],[36,46],[5,8],[12,22],[40,45]],"seed":1038732,"tip":"先消能打开通道的一对，再找内部物件。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":2,"openingMeanChoices":2.2,"meanPairDistance":4.08,"openingMeanTurns":1.6,"unlocks":17,"score":155.43,"rank":15}},{"name":"寻找跨区搭档","cols":6,"rows":8,"holes":[],"kinds":12,"board":[8,3,10,5,3,0,1,2,11,3,10,9,7,0,1,5,7,11,10,4,3,9,2,7,2,5,9,5,0,6,4,8,6,0,6,11,11,1,2,4,8,10,6,8,9,1,7,4],"solution":[[1,4],[17,35],[2,10],[29,34],[28,33],[16,23],[15,27],[21,26],[9,20],[19,39],[14,45],[5,13],[12,46],[40,43],[22,38],[3,25],[7,24],[0,31],[6,37],[8,36],[18,41],[11,44],[30,47],[32,42]],"seed":1057820,"tip":"有些搭档隔得很远，先观察两边的出口。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":2,"openingMeanChoices":2.6,"meanPairDistance":4.75,"openingMeanTurns":1.4,"unlocks":17,"score":156.19,"rank":16}},{"name":"看清再点下一对","cols":6,"rows":8,"holes":[],"kinds":13,"board":[0,2,6,9,3,10,4,8,2,3,12,4,10,5,7,9,0,7,3,8,4,7,8,10,9,0,2,6,1,4,5,9,6,7,11,1,12,1,11,8,6,5,2,5,10,0,1,3],"solution":[[11,29],[28,35],[5,23],[4,47],[41,43],[27,40],[21,33],[37,46],[22,39],[16,45],[34,38],[10,36],[3,15],[2,32],[1,8],[14,17],[26,42],[0,25],[6,20],[7,19],[24,31],[12,44],[9,18],[13,30]],"seed":1048473,"tip":"剩下的机会少了，先看连线能不能走通。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":2,"openingMeanChoices":1.9,"meanPairDistance":4.08,"openingMeanTurns":1.7,"unlocks":12,"score":163.16,"rank":17}},{"name":"一步一步向里走","cols":6,"rows":8,"holes":[],"kinds":14,"board":[2,12,4,8,3,0,8,9,7,0,1,6,2,8,3,6,4,1,13,11,0,9,5,9,9,4,6,7,10,7,6,0,2,4,1,12,3,7,13,5,3,5,11,2,1,8,5,10],"solution":[[0,12],[3,6],[7,24],[5,9],[11,15],[2,16],[10,17],[21,23],[27,29],[22,41],[14,40],[39,46],[34,44],[1,35],[4,36],[8,37],[18,38],[19,42],[32,43],[26,30],[20,31],[13,45],[25,33],[28,47]],"seed":1063190,"tip":"先找唯一能连起的一对，再看新露出的路。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":1,"openingMeanChoices":2.4,"meanPairDistance":4.17,"openingMeanTurns":1.9,"unlocks":17,"score":170.66,"rank":18}},{"name":"最后一条关键通道","cols":6,"rows":8,"holes":[],"kinds":15,"board":[13,8,6,3,4,10,11,5,9,7,5,6,4,8,1,6,9,7,2,7,5,14,0,6,0,4,0,4,11,13,8,1,3,12,7,14,1,3,0,2,1,2,10,2,3,12,8,5],"solution":[[11,23],[10,47],[41,43],[37,44],[31,36],[24,38],[12,25],[9,17],[8,16],[2,15],[14,40],[7,20],[22,26],[6,28],[4,27],[19,34],[0,29],[18,39],[33,45],[1,13],[3,32],[5,42],[21,35],[30,46]],"seed":1124672,"tip":"外沿还有一条路，找到它再向里推进。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":1,"openingMeanChoices":2.2,"meanPairDistance":4.58,"openingMeanTurns":1.6,"unlocks":12,"score":177.93,"rank":19}},{"name":"抽屉整理毕业礼","cols":6,"rows":8,"holes":[],"kinds":16,"board":[7,13,10,8,5,4,15,6,11,14,7,1,9,3,0,7,2,12,2,13,4,2,0,5,1,6,11,5,14,4,6,12,3,1,3,0,8,7,1,5,9,2,4,6,15,10,0,3],"solution":[[5,29],[4,23],[0,10],[22,35],[16,21],[9,28],[34,47],[11,33],[27,39],[8,26],[7,25],[24,38],[15,37],[2,45],[14,46],[13,32],[12,40],[1,19],[3,36],[30,43],[6,44],[17,31],[18,41],[20,42]],"seed":1065834,"tip":"搭档不再挨在一起，用每次清空接出下一条路。","layoutVersion":"drawer-v2","difficulty":{"adjacent":0,"openingMoves":1,"openingMeanChoices":1.5,"meanPairDistance":5,"openingMeanTurns":1.5,"unlocks":12,"score":186.55,"rank":20}}];
function makeDrawer(level){
 const cfg=DRAWER_LEVELS[level];
 if(!Number.isInteger(level)||!cfg)throw new RangeError('Unknown drawer level');
 return {...cfg,holes:cfg.holes.slice(),board:cfg.board.slice(),solution:cfg.solution.map(pair=>pair.slice()),difficulty:{...cfg.difficulty}};
}
function canLink(b,w,h,a,z){
 if(a===z||b[a]==null||b[a]!==b[z])return false;
 const ax=a%w+1,ay=Math.floor(a/w)+1,zx=z%w+1,zy=Math.floor(z/w)+1;
 const empty=(x,y)=>x===0||y===0||x===w+1||y===h+1||b[(y-1)*w+x-1]===null;
 function horizontal(x1,x2,y){if(x1>x2)[x1,x2]=[x2,x1];for(let x=x1+1;x<x2;x++)if(!empty(x,y))return false;return true;}
 function vertical(y1,y2,x){if(y1>y2)[y1,y2]=[y2,y1];for(let y=y1+1;y<y2;y++)if(!empty(x,y))return false;return true;}
 if(ax===zx&&vertical(ay,zy,ax)||ay===zy&&horizontal(ax,zx,ay))return true;
 if(empty(ax,zy)&&vertical(ay,zy,ax)&&horizontal(ax,zx,zy))return true;
 if(empty(zx,ay)&&horizontal(ax,zx,ay)&&vertical(ay,zy,zx))return true;
 for(let x=0;x<=w+1;x++)if(x!==ax&&x!==zx&&empty(x,ay)&&empty(x,zy)&&horizontal(ax,x,ay)&&vertical(ay,zy,x)&&horizontal(x,zx,zy))return true;
 for(let y=0;y<=h+1;y++)if(y!==ay&&y!==zy&&empty(ax,y)&&empty(zx,y)&&vertical(ay,y,ax)&&horizontal(ax,zx,y)&&vertical(y,zy,zx))return true;
 return false;
}
function drawerMoves(b,w,h){const out=[];for(let a=0;a<b.length;a++)if(b[a]!==null)for(let z=a+1;z<b.length;z++)if(b[a]===b[z]&&canLink(b,w,h,a,z))out.push([a,z]);return out;}
function solveDrawer(b,w,h,limit=20000){
 const work=b.slice(),seen=new Set();let nodes=0,exhausted=false;
 function visit(remaining,lo,hi){
  if(!remaining)return [];
  if(++nodes>limit){exhausted=true;return null;}
  const key=lo+':'+hi;if(seen.has(key))return null;seen.add(key);
  const choices=drawerMoves(work,w,h);choices.sort((p,q)=>{
   const local=i=>{let n=0;if(i%w&&work[i-1]!==null)n++;if(i%w<w-1&&work[i+1]!==null)n++;if(i>=w&&work[i-w]!==null)n++;if(i+w<work.length&&work[i+w]!==null)n++;return n;};
   return local(q[0])+local(q[1])-local(p[0])-local(p[1]);
  });
  for(const [a,z]of choices){const type=work[a];work[a]=work[z]=null;let l=lo,u=hi;for(const i of [a,z]){if(i<32)l=(l&~(1<<i))>>>0;else u=(u&~(1<<(i-32)))>>>0;}
   const rest=visit(remaining-2,l,u);work[a]=work[z]=type;if(rest)return [[a,z],...rest];if(exhausted)return null;
  }
  return null;
 }
 let lo=0,hi=0,n=0;for(let i=0;i<work.length;i++)if(work[i]!==null){n++;if(i<32)lo=(lo|(1<<i))>>>0;else hi=(hi|(1<<(i-32)))>>>0;}
 const path=visit(n,lo,hi);return {path,nodes,exhausted};
}
function adjacentDrawer(b,w){let n=0;for(let i=0;i<b.length;i++)if(b[i]!==null){if(i%w<w-1&&b[i]===b[i+1])n++;if(i+w<b.length&&b[i]===b[i+w])n++;}return n;}

function reshuffleDrawer(board,cols,rows,seed){
 const rng=random(seed),positions=board.map((x,i)=>x===null?-1:i).filter(x=>x>=0),items=positions.map(i=>board[i]);
 if(!items.length)return board.slice();
 const cap=Math.min(2,adjacentDrawer(board,cols));
 for(let n=0;n<100;n++){
  shuffle(items,rng);const next=board.slice();positions.forEach((p,i)=>next[p]=items[i]);
  if(n<80&&adjacentDrawer(next,cols)>cap)continue;
  if(solveDrawer(next,cols,rows,3500).path)return next;
 }
 // Recovery must remain fully solvable even for unusual remaining empty-cell shapes.
 const pending=board.map(v=>v===null?null:0),next=board.map(()=>null),counts=new Map();
 for(const type of items)counts.set(type,(counts.get(type)||0)+1);
 const kinds=[];for(const [type,count]of counts)for(let i=0;i<count/2;i++)kinds.push(type);shuffle(kinds,rng);
 for(const type of kinds){
  const choices=drawerMoves(pending,cols,rows),spread=choices.filter(([a,b])=>Math.abs(a%cols-b%cols)+Math.abs(Math.floor(a/cols)-Math.floor(b/cols))>1),pool=spread.length?spread:choices;
  if(!pool.length)throw Error('No recovery route');
  const [a,b]=pool[Math.floor(rng()*pool.length)];pending[a]=pending[b]=null;next[a]=next[b]=type;
 }
 return next;
}
const clone=x=>JSON.parse(JSON.stringify(x));
function recipe(items,i){return {id:i,items:items.slice(),got:items.map(()=>false)};}
function initNight(level){const cfg=NIGHT_LEVELS[level];return {lanes:clone(cfg.lanes),orders:cfg.recipes.slice(0,3).map(recipe),next:3,buffer:[],completed:0,status:'playing'};}
function settle(state,cfg){
 let change=true;
 while(change){
  change=false;
  for(let i=0;i<state.orders.length;i++)if(state.orders[i]&&state.orders[i].got.every(Boolean)){
   state.completed++;state.orders[i]=state.next<cfg.recipes.length?recipe(cfg.recipes[state.next],state.next++):null;change=true;
  }
  for(let b=0;b<state.buffer.length;b++){
   const item=state.buffer[b];let used=false;
   for(const order of state.orders){if(!order)continue;const n=order.items.findIndex((v,i)=>v===item&&!order.got[i]);if(n>=0){order.got[n]=true;state.buffer.splice(b,1);b--;used=true;change=true;break;}}
   if(used)break;
  }
 }
 state.status=state.completed===cfg.recipes.length?'won':state.buffer.length>=4?'lost':'playing';
}
function takeNight(state,level,lane){
 if(state.status!=='playing'||!state.lanes[lane]?.length)return null;
 const next=clone(state),item=next.lanes[lane].shift();next.buffer.push(item);settle(next,NIGHT_LEVELS[level]);return {state:next,item,delivered:next.completed-state.completed,buffered:next.buffer.includes(item)};
}
function nightKey(s){return JSON.stringify([s.lanes.map(l=>l.length),s.next,s.buffer.slice().sort(),s.orders.map(o=>o?[o.id,o.got]:null)]);}
function solveNight(state,level,limit=70000){
 const seen=new Set();let count=0,exhausted=false;
 function visit(s){
  if(s.status==='won')return [];if(s.status==='lost')return null;if(++count>limit){exhausted=true;return null;}
  const key=nightKey(s);if(seen.has(key))return null;seen.add(key);
  let choices=s.lanes.map((l,i)=>i).filter(i=>s.lanes[i].length);
  choices.sort((a,b)=>Number(s.orders.some(o=>o&&o.items.some((v,i)=>v===s.lanes[b][0]&&!o.got[i])))-Number(s.orders.some(o=>o&&o.items.some((v,i)=>v===s.lanes[a][0]&&!o.got[i]))));
  for(const i of choices){const n=takeNight(s,level,i);const p=visit(n.state);if(p)return [i,...p];if(exhausted)return null;}
  return null;
 }
 const path=visit(state);return {path,visited:count,exhausted};
}
const NIGHT_LEVELS=[
 {name:'第一晚开张',subtitle:'先把三张订单做好',recipes:[['dumpling','egg','greens'],['shrimp','corn','greens'],['mushroom','egg','corn']],lanes:[['dumpling','shrimp','mushroom'],['egg','corn','egg'],['greens','greens','corn']]},
 {name:'小摊忙起来了',subtitle:'给下一张订单留一点空间',recipes:[['dumpling','dumpling','greens'],['egg','egg','corn'],['greens','corn','corn'],['shrimp','shrimp','mushroom'],['mushroom','mushroom','shrimp']],lanes:[["corn","shrimp","shrimp","egg"],["mushroom","corn","dumpling","greens"],["greens","mushroom","mushroom","egg"],["dumpling","shrimp","corn"]]},
 {name:'夜市小高峰',subtitle:'四格暂存，步步都要想一想',recipes:[['dumpling','dumpling','egg'],['greens','greens','corn'],['dumpling','corn','egg'],['shrimp','mushroom','shrimp'],['mushroom','mushroom','greens'],['shrimp','corn','egg'],['dumpling','greens','mushroom']],lanes:[["egg","greens","mushroom","shrimp","corn"],["dumpling","corn","mushroom","egg"],["shrimp","dumpling","egg","mushroom"],["shrimp","corn","greens","dumpling"],["mushroom","greens","greens","dumpling"]]}
];
const api={FOODS,DRAWER_LEVELS,random,shuffle,connect,findPair,makeDrawer,solveDrawer,drawerMoves,canLink,adjacentDrawer,reshuffleDrawer,NIGHT_LEVELS,initNight,takeNight,solveNight};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GameEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
