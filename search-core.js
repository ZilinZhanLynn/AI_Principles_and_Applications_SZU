(function(root){
'use strict';
const graph={S:['A','B'],A:['C','D'],B:['D'],C:['G'],D:['G'],G:[]};
function searchTrace(algorithm){
 const frontier=['S'],visited=[],parents={S:null},trace=[];let count=0;
 const snapshot=(current,message,done=false)=>trace.push({current,frontier:[...frontier],visited:[...visited],parents:{...parents},count,message,done});
 snapshot(null,'从 S 开始。边界表的左端先取；后继按图中的字母顺序优先。');
 while(frontier.length){const current=frontier.shift();count++;
  if(current==='G'){snapshot(current,`取出目标 G，搜索结束。共取出 ${count} 个节点，其中 ${visited.length} 个被扩展；G 不再扩展。`,true);break;}
  visited.push(current);
  const next=graph[current].filter(n=>!Object.prototype.hasOwnProperty.call(parents,n));
  next.forEach(n=>parents[n]=current);
  if(algorithm==='bfs')frontier.push(...next);else frontier.unshift(...next);
  snapshot(current,`扩展 ${current}：${next.length?'新加入 '+next.join('、'):'没有尚未发现的后继'}。${algorithm==='bfs'?'加到队尾。':'放到栈顶，较前字母先取。'}`);
 }
 return trace;
}
function gameTrace(pruning,options={}){
 const leafValues=options.values||[3,5,2,9];
 if(leafValues.length!==4||!leafValues.every(Number.isFinite))throw new Error('需要四个有限终局值');
 const tree={id:'root',max:true,children:[{id:'L',max:false,children:[{id:'l1',value:leafValues[0]},{id:'l2',value:leafValues[1]}]},{id:'R',max:false,children:[{id:'r1',value:leafValues[2]},{id:'r2',value:leafValues[3]}]}]};
 if(options.reverse){tree.children.reverse();tree.children.forEach(n=>n.children.reverse());}
 const trace=[],values={root:'MAX',L:'MIN',R:'MIN'},visited=[],pruned=[];
 const snap=(current,alpha,beta,message,done=false)=>trace.push({current,alpha,beta,message,done,values:{...values},visited:[...visited],pruned:[...pruned]});
 snap(null,-Infinity,Infinity,`根为 MAX，两侧为 MIN；按从${options.reverse?'右到左':'左到右'}访问。先预测子树回传什么。`);
 function solve(node,a,b){
  if('value' in node){visited.push(node.id);values[node.id]=String(node.value);snap(node.id,a,b,`访问终局叶子 ${node.value}；这是一个精确效用值。`);return node.value;}
  let v=node.max?-Infinity:Infinity,cut=false;
  for(let i=0;i<node.children.length;i++){
   const child=node.children[i],cv=solve(child,a,b);v=node.max?Math.max(v,cv):Math.min(v,cv);
   if(pruning){if(node.max)a=Math.max(a,v);else b=Math.min(b,v);}
   values[node.id]=pruning?(node.max?'≥':'≤')+v:'计算中';
   if(pruning&&b<=a&&i<node.children.length-1){
    function skip(n){pruned.push(n.id);if(n.children)n.children.forEach(skip);}
    node.children.slice(i+1).forEach(skip);cut=true;
    snap(node.id,a,b,`β=${b} ≤ α=${a}，跳过剩余分支。${node.id==='L'?'左':'右'} MIN 的真实值只知≤${v}，它无法优于根已有的选择。`);break;
   }
   if(i<node.children.length-1)snap(node.id,a,b,node.max?`根已有至少 ${v} 的选择，继续考察另一个分支。`:`MIN 已看到 ${v}，继续访问下一个终局。`);
  }
  if(!cut){values[node.id]=String(v);snap(node.id,a,b,node.id==='root'?`根的精确值为 ${v}。访问了 ${visited.length} 个叶子，剪去 ${pruned.length} 个叶子；根据子树回传值选择分支，同值时可任选。`:`${node.id==='L'?'左':'右'} MIN 已看完所有孩子，精确回传 ${v}。`,node.id==='root');}
  return v;
 }
 solve(tree,-Infinity,Infinity);return trace;
}
const api={searchTrace,gameTrace};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SearchCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
