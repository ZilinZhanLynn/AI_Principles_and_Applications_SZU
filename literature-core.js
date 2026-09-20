(function(root){
  'use strict';
  const papers=[
    {id:'A',title:'数字金融与家庭消费',abstract:'讨论数字金融与家庭消费的关系；摘要声称使用家庭调查数据。',evidence:'模拟原文第 2 页：本文使用家庭调查数据，报告数字金融指标与消费之间的正相关关系；不能仅凭这一描述认定因果关系。',relevant:true},
    {id:'B',title:'支付服务与家庭支出',abstract:'讨论支付服务与家庭支出；摘要未说明识别方法。',evidence:'模拟原文第 3 页：本文比较不同支付使用情况的家庭支出。原文片段没有说明因果识别方法，应记为“材料未提供”。',relevant:true},
    {id:'C',title:'数字化与企业库存',abstract:'讨论企业库存管理，研究对象是企业而非家庭。',evidence:'模拟原文第 1 页：研究对象是制造企业的库存周转，不直接回答本练习的家庭消费问题。',relevant:false}
  ];
  const initial=()=>({current:'A',read:[],verified:[],included:[],cost:0});
  function act(state,action,id=state.current){
    const s={...state,read:[...state.read],verified:[...state.verified],included:[...state.included]};
    const p=papers.find(x=>x.id===id);
    if(!p)return {state:s,message:'未知材料。'};
    if(action==='open'){s.current=id;return {state:s,message:`打开 ${id}，集合不变。本模型切换材料代价为 0。`};}
    const key={read:'read',verify:'verified',include:'included'}[action];
    if(!key)return {state:s,message:'未知动作。'};
    if(id!==s.current)return {state:s,message:'请先打开这篇材料。'};
    if(s[key].includes(id))return {state:s,message:'这项操作已经完成，不重复计费。'};
    if(action==='verify'&&!s.read.includes(id))return {state:s,message:'先阅读摘要，再核验原文。'};
    if(action==='include'&&!s.verified.includes(id))return {state:s,message:'尚未核验原文，不能纳入。'};
    if(action==='include'&&!p.relevant)return {state:s,message:'原文已核验，但主题不符合要求，不能纳入。'};
    s[key].push(id);s.cost+=({read:1,verify:2,include:1})[action];
    return {state:s,message:({read:'已读摘要；它不等于原文核验。',verify:'已查看模拟原文；是否相关仍需单独判断。',include:'已纳入一条相关且核验通过的材料。'})[action]};
  }
  const goal=(s,count)=>s.included.length>=count&&s.included.every(id=>s.verified.includes(id)&&papers.find(p=>p.id===id)?.relevant);
  const api={papers,initial,act,goal};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LiteratureCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
