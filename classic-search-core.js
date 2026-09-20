(function(root){
 'use strict';
 const goal=[1,2,3,4,5,6,7,8,0];
 function legal(board){const z=board.indexOf(0);return board.map((v,i)=>i).filter(i=>Math.abs(Math.floor(i/3)-Math.floor(z/3))+Math.abs(i%3-z%3)===1);}
 function move(board,index){if(!legal(board).includes(index))return null;const next=[...board],z=next.indexOf(0);[next[z],next[index]]=[next[index],next[z]];return next;}
 const solved=board=>board.every((v,i)=>v===goal[i]);
 const presets={easy:[1,2,3,4,5,6,0,7,8],medium:[1,2,3,5,0,6,4,7,8]};
 // Deliberately selected six-city subgraph of the AIMA Romania example.
 const cities={Arad:[60,145],Sibiu:[215,145],Fagaras:[410,60],Rimnicu:[335,245],Pitesti:[510,245],Bucharest:[670,145]};
 const labels={Arad:'Arad',Sibiu:'Sibiu',Fagaras:'Fagaras',Rimnicu:'Rimnicu Vilcea',Pitesti:'Pitesti',Bucharest:'Bucharest'};
 const roads=[['Arad','Sibiu',140],['Sibiu','Fagaras',99],['Fagaras','Bucharest',211],['Sibiu','Rimnicu',80],['Rimnicu','Pitesti',97],['Pitesti','Bucharest',101]];
 const edge=(a,b,blocked=false)=>roads.find(e=>((e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a))&&!(blocked&&e[0]==='Sibiu'&&e[1]==='Rimnicu'));
 const neighbors=(city,blocked=false)=>roads.filter(e=>!(blocked&&e[0]==='Sibiu'&&e[1]==='Rimnicu')&&(e[0]===city||e[1]===city)).map(e=>({city:e[0]===city?e[1]:e[0],cost:e[2]}));
 function cost(path,blocked=false){let g=0;for(let i=1;i<path.length;i++){const e=edge(path[i-1],path[i],blocked);if(!e)return null;g+=e[2];}return g;}
 const api={goal,legal,move,solved,presets,cities,labels,roads,edge,neighbors,cost};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ClassicSearch=api;
})(typeof globalThis!=='undefined'?globalThis:this);
