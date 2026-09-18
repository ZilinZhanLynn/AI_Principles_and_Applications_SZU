(function (root) {
  'use strict';
  const labels = {fillA:'装满 A',fillB:'装满 B',pourAB:'A → B 倒水',pourBA:'B → A 倒水',emptyA:'倒空 A',emptyB:'倒空 B'};
  function transition(state, action) {
    const [a,b] = state;
    switch (action) {
      case 'fillA': return [3,b];
      case 'fillB': return [a,4];
      case 'emptyA': return [0,b];
      case 'emptyB': return [a,0];
      case 'pourAB': {const t=Math.min(a,4-b); return [a-t,b+t];}
      case 'pourBA': {const t=Math.min(b,3-a); return [a+t,b-t];}
      default: throw new Error('Unknown action');
    }
  }
  const equal=(a,b)=>a[0]===b[0]&&a[1]===b[1];
  const isGoal=s=>s[1]===2;
  function shortestPath(start) {
    const queue=[{state:start,path:[]}], seen=new Set([start.join(',')]);
    for(let i=0;i<queue.length;i++) {
      const {state,path}=queue[i];
      if(isGoal(state)) return path;
      for(const action of Object.keys(labels)) {
        const next=transition(state,action), key=next.join(',');
        if(!seen.has(key)) {seen.add(key);queue.push({state:next,path:[...path,action]});}
      }
    }
    return null;
  }
  const api={labels,transition,equal,isGoal,shortestPath};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.Jug=api;
})(typeof globalThis!=='undefined'?globalThis:this);
