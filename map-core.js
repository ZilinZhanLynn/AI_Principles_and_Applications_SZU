(function(root){
  'use strict';
  const nodes={S:[0,1],A:[1,0],B:[1,1],C:[1,2],D:[2,0],E:[2,1],F:[2,2],G:[3,1]};
  const names={bfs:'BFS',dfs:'DFS',ucs:'UCS',greedy:'贪心',astar:'A*',dls:'深度受限',ids:'迭代加深'};
  function edges(options={}) {
    const cost=Number(options.cost??8);
    if(!Number.isFinite(cost)||cost<1||cost>12)throw new Error('代价须在 1–12 之间');
    return [['S','A',2],['S','B',1],['S','C',4],['A','D',2],['B','D',5],['B','E',cost],['C','F',2],['D','E',1],['E','G',2],['F','G',2]].filter(e=>!(options.blocked&&e[0]==='D'&&e[1]==='E'));
  }
  const distance=(a,b)=>Math.abs(nodes[a][0]-nodes[b][0])+Math.abs(nodes[a][1]-nodes[b][1]);
  function heuristic(id,mode,es) {
    if(mode==='zero')return 0;
    const unit=Math.min(...es.map(([a,b,c])=>c/distance(a,b)));
    return distance(id,'G')*unit*(mode==='inflated'?4:1);
  }
  function trace(algorithm='bfs',options={}) {
    if(!names[algorithm])throw new Error('未知算法');
    const es=edges(options),hmode=options.h||'distance',adj=id=>es.filter(e=>e[0]===id).sort((a,b)=>options.reverse?b[1].localeCompare(a[1]):a[1].localeCompare(b[1]));
    const result=[];let expanded=0,taken=0,seq=0;
    const make=(id,g,path)=>({id,g,path,depth:path.length-1,h:heuristic(id,hmode,es),seq:seq++});
    const snap=(current,frontier,message,done=false,extra={})=>result.push({current:current?.id??null,frontier:frontier.map(n=>({...n,f:n.g+n.h,path:[...n.path]})),expanded,taken,message,done,path:done&&current?.id==='G'?[...current.path]:[],cost:done&&current?.id==='G'?current.g:null,...extra});
    if(algorithm==='dls'||algorithm==='ids') {
      const limit=Number(options.limit??3);
      if(!Number.isInteger(limit)||limit<0||limit>7)throw new Error('深度限制须为 0–7');
      for(let round=algorithm==='ids'?0:limit;round<=limit;round++) {
        const frontier=[make('S',0,['S'])];let cutoff=false;
        snap(null,frontier,`深度限制 L=${round}：从 S 重新开始。只排除当前路径上的环。`,false,{round});
        while(frontier.length){const node=frontier.shift();taken++;
          if(node.id==='G'){snap(node,frontier,`取出目标 G；本轮深度 ${node.depth}，代价 ${node.g}。`,true,{round,status:'success'});return result;}
          const next=adj(node.id).filter(e=>!node.path.includes(e[1]));
          if(node.depth>=round){if(next.length)cutoff=true;snap(node,frontier,next.length?`到达深度限制，${node.id} 的后继暂不展开（截断）。`:`${node.id} 无可用后继。`,false,{round});}
          else {expanded++;frontier.unshift(...next.map(e=>make(e[1],node.g+e[2],[...node.path,e[1]])));snap(node,frontier,`扩展 ${node.id}，较${options.reverse?'后':'前'}字母优先深入。`,false,{round});}
        }
        if(algorithm==='dls'||!cutoff||round===limit){snap(null,[],cutoff?'本轮截断；不能据此宣布问题无解。可提高深度上限。':'已穷尽本轮可行路径，没有找到目标。',true,{round,status:cutoff?'cutoff':'failure'});return result;}
      }
    }
    const frontier=[make('S',0,['S'])],best=new Map([['S',0]]),discovered=new Set(['S']);
    const weighted=['ucs','astar','greedy'].includes(algorithm);
    const score=n=>algorithm==='ucs'?n.g:algorithm==='greedy'?n.h:n.g+n.h;
    snap(null,frontier,'起点 S 已加入边界表。先预测下一次取出谁。');
    while(frontier.length){
      if(weighted)frontier.sort((a,b)=>score(a)-score(b)||a.seq-b.seq);
      const node=frontier.shift();taken++;
      if(node.id==='G'){snap(node,frontier,`取出目标 G。返回路径 ${node.path.join(' → ')}；代价 ${node.g}。`,true,{status:'success'});return result;}
      expanded++;const children=[],changes=[];
      for(const [from,to,cost] of adj(node.id)){
        const g=node.g+cost,known=best.get(to);
        if(weighted?known===undefined||g<known:!discovered.has(to)){
          const existing=frontier.findIndex(n=>n.id===to);if(existing>=0)frontier.splice(existing,1);
          children.push(make(to,g,[...node.path,to]));best.set(to,g);discovered.add(to);
          changes.push(known===undefined?`${to}(g=${g})`:`${to} 的 g：${known} → ${g}`);
        }
      }
      algorithm==='dfs'?frontier.unshift(...children):frontier.push(...children);
      if(weighted)frontier.sort((a,b)=>score(a)-score(b)||a.seq-b.seq);
      snap(node,frontier,`扩展 ${node.id}。${changes.length?'加入或更新：'+changes.join('；'):'没有需要加入的更优或新路径'}。`);
    }
    snap(null,[],'边界表已空，没有找到目标。',true,{status:'failure'});return result;
  }
  const api={nodes,names,edges,heuristic,trace};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CourseMap=api;
})(typeof globalThis!=='undefined'?globalThis:this);
