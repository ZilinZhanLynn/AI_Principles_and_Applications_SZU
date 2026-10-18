(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  // Page navigation and fullscreen use course-live.js.

  // Keep the manuscript on the page while revealing dense review material at the teaching pace.
  document.querySelectorAll("#p1 .review-cards article").forEach(card=>{
    const answer=card.querySelector("p"), prompt=card.querySelector("small");
    answer.hidden=true;
    const button=document.createElement("button");button.type="button";button.textContent="核对答案";
    button.setAttribute("aria-expanded","false");card.append(button);
    button.addEventListener("click",()=>{const open=answer.hidden;answer.hidden=!open;prompt.hidden=open;button.textContent=open?"收起答案":"核对答案";button.setAttribute("aria-expanded",String(open));});
  });
  const distanceNote=document.createElement("p");distanceNote.className="diagram-note";
  distanceNote.textContent="虚线表示从当前位置到目标的估计距离 h(n)；实线表示实际路线，代价要沿路线计算。";
  document.querySelector("#p2 .distance-legend").after(distanceNote);
  const scopeButton=document.createElement("button");scopeButton.type="button";scopeButton.className="explain-toggle";scopeButton.textContent="“不完备”适用于什么情况？";scopeButton.setAttribute("aria-expanded","false");
  const scopeNote=document.createElement("p");scopeNote.className="scope-note";scopeNote.hidden=true;
  scopeNote.textContent="这里说的不完备，指没有充分处理重复状态时，搜索可能在环路或无限状态空间中停不下来。在本课有限地图且正确去重的图搜索中，不能据此断言贪心一定找不到解。";
  scopeButton.addEventListener("click",()=>{scopeNote.hidden=!scopeNote.hidden;scopeButton.setAttribute("aria-expanded",String(!scopeNote.hidden));});
  document.querySelector("#p5 .copy ul").after(scopeButton,scopeNote);
  [["#p5 .copy blockquote","展开知识卡片"],["#p5 .interaction-panel table","查看属性对比"]].forEach(([selector,label])=>{
    const content=document.querySelector(selector),button=document.createElement("button");
    button.type="button";button.className="explain-toggle";button.textContent=label;button.setAttribute("aria-expanded","false");
    content.before(button);content.hidden=true;
    button.addEventListener("click",()=>{content.hidden=!content.hidden;button.setAttribute("aria-expanded",String(!content.hidden));button.textContent=content.hidden?label:"收起"+label.slice(2);});
  });
  const formulaCards=[...document.querySelectorAll("#p6 .formula-compare article")];
  const formulaButton=document.createElement("button");formulaButton.type="button";formulaButton.className="explain-toggle";formulaButton.textContent="依次看 g、h、f";
  document.querySelector("#p6 .formula-compare").after(formulaButton);
  let formulaStep=-1;formulaButton.addEventListener("click",()=>{formulaStep=(formulaStep+1)%formulaCards.length;formulaCards.forEach((card,index)=>card.classList.toggle("is-focused",index===formulaStep));formulaButton.textContent=formulaStep===2?"从 g 重新看":"下一项";});
  const counterexample=document.createElement("div");counterexample.className="counterexample";
  counterexample.innerHTML="<b>高估反例</b><span>真实剩余代价：2</span><span>估计 h(n)：6</span><strong>6 &gt; 2，误把这条路看得更贵</strong>";
  document.querySelector("#p10 .admissible-demo").append(counterexample);
  document.querySelectorAll("#p11 .property-icons article").forEach(card=>{
    const detail=card.querySelector("p"),button=document.createElement("button");button.type="button";button.textContent="看适用条件";button.setAttribute("aria-expanded","false");
    detail.hidden=true;card.append(button);button.addEventListener("click",()=>{detail.hidden=!detail.hidden;button.textContent=detail.hidden?"看适用条件":"收起条件";button.setAttribute("aria-expanded",String(!detail.hidden));});
  });
  const frontierCard=document.querySelector("#p13 .frontier-card");
  const frontierToggle=document.createElement("button");frontierToggle.type="button";frontierToggle.className="explain-toggle";frontierToggle.textContent="展开前沿研究";
  frontierCard.before(frontierToggle);frontierCard.hidden=true;frontierToggle.setAttribute("aria-expanded","false");
  frontierToggle.addEventListener("click",()=>{frontierCard.hidden=!frontierCard.hidden;frontierToggle.textContent=frontierCard.hidden?"展开前沿研究":"收起前沿研究";frontierToggle.setAttribute("aria-expanded",String(!frontierCard.hidden));});
  const reviewItems=[...document.querySelectorAll("#p14 .review-summary li")];
  if(reviewItems.length===8){
    const controls=document.createElement("div");controls.className="review-controls";
    [["核心概念 1–4",0],["应用与延伸 5–8",1]].forEach(([label,group])=>{const button=document.createElement("button");button.type="button";button.textContent=label;button.addEventListener("click",()=>showReview(group));controls.append(button);});
    document.querySelector("#p14 .review-summary").before(controls);
    function showReview(group){reviewItems.forEach((item,index)=>{item.hidden=Math.floor(index/4)!==group;});[...controls.children].forEach((button,index)=>button.classList.toggle("selected",index===group));}
    showReview(0);
  }

  const ns="http://www.w3.org/2000/svg";
  const svgEl=(name,attrs={})=>{const e=document.createElementNS(ns,name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e;};
  const cities={Arad:[78,218],Zerind:[180,98],Timisoara:[190,365],Sibiu:[300,210],Oradea:[400,92],Rimnicu:[430,318],Fagaras:[520,190],Craiova:[550,414],Pitesti:[625,312],Bucharest:[670,205]};
  const mapEdges=[["Arad","Zerind",75],["Arad","Sibiu",140],["Arad","Timisoara",118],["Zerind","Oradea",71],["Oradea","Sibiu",151],["Sibiu","Fagaras",99],["Sibiu","Rimnicu",80],["Rimnicu","Craiova",146],["Rimnicu","Pitesti",97],["Fagaras","Bucharest",211],["Pitesti","Bucharest",101]];
  const heuristic={Arad:366,Sibiu:253,Timisoara:329,Zerind:374,Fagaras:176,"Rimnicu Vilcea":193,Rimnicu:193,Oradea:380,Bucharest:0,Pitesti:100,Craiova:160};
  const frontierOrder=(entries)=>entries.map(([name,value])=>({name,value}));
  const mapSteps={
    gbfs:[
      {node:"Arad",rows:["展开 Arad → Sibiu h=253、Timisoara h=329、Zerind h=374"],edges:["Arad-Zerind","Arad-Sibiu","Arad-Timisoara"],frontier:frontierOrder([["Sibiu",253],["Timisoara",329],["Zerind",374]])},
      {node:"Sibiu",rows:["展开 Sibiu → Fagaras h=176、Rimnicu h=193、Oradea h=380"],edges:["Sibiu-Fagaras","Sibiu-Rimnicu","Sibiu-Oradea"],frontier:frontierOrder([["Fagaras",176],["Rimnicu",193],["Timisoara",329],["Zerind",374],["Oradea",380]])},
      {node:"Fagaras",rows:["展开 Fagaras → Bucharest h=0"],edges:["Fagaras-Bucharest"],frontier:frontierOrder([["Bucharest",0],["Rimnicu",193],["Timisoara",329],["Zerind",374],["Oradea",380]])},
      {node:"Bucharest",rows:["取出目标 Bucharest，到目标！"],edges:[],frontier:[],done:"贪心路径：Arad→Sibiu→Fagaras→Bucharest，代价 450"}
    ],
    astar:[
      {node:"Arad",rows:["展开 Arad → Sibiu f=140+253=393","Timisoara f=118+329=447","Zerind f=75+374=449"],edges:["Arad-Sibiu","Arad-Timisoara","Arad-Zerind"],frontier:frontierOrder([["Sibiu",393],["Timisoara",447],["Zerind",449]])},
      {node:"Sibiu",rows:["Rimnicu f=220+193=413","Fagaras f=239+176=415","Oradea f=291+380=671"],edges:["Sibiu-Rimnicu","Sibiu-Fagaras","Sibiu-Oradea"],frontier:frontierOrder([["Rimnicu",413],["Fagaras",415],["Timisoara",447],["Zerind",449],["Oradea",671]])},
      {node:"Rimnicu",rows:["Pitesti f=317+100=417","Craiova f=366+160=526"],edges:["Rimnicu-Pitesti","Rimnicu-Craiova"],frontier:frontierOrder([["Fagaras",415],["Pitesti",417],["Timisoara",447],["Zerind",449],["Craiova",526],["Oradea",671]])},
      {node:"Fagaras",rows:["展开 Fagaras → Bucharest f=450+0=450","边界里还有 Pitesti f=417，继续！"],edges:["Fagaras-Bucharest"],frontier:frontierOrder([["Pitesti",417],["Timisoara",447],["Zerind",449],["Bucharest",450],["Craiova",526],["Oradea",671]])},
      {node:"Pitesti",rows:["展开 Pitesti → Bucharest f=418+0=418","目标现在仍在边界中；下一步取出它"],edges:["Pitesti-Bucharest"],frontier:frontierOrder([["Bucharest",418],["Timisoara",447],["Zerind",449],["Craiova",526],["Oradea",671]])},
      {node:"Bucharest",rows:["取出目标 Bucharest（f=418），目标出队，结束"],edges:[],frontier:[],done:"最优路径：Arad → Sibiu → Rimnicu Vilcea → Pitesti → Bucharest，代价 418"}
    ]
  };
  function initMap(type) {
    const map=$(type+"-map"), score=$(type+"-score-list"), path=$(type+"-path"), button=$(type+"-next");
    const scoreboard=score.parentElement;
    const oldTitle=scoreboard.querySelector("h3"); oldTitle.textContent="展开记录";
    const frontierTitle=document.createElement("h3");frontierTitle.textContent="当前待选节点（边界）";
    const frontier=document.createElement("div");frontier.className="frontier-list";frontier.setAttribute("aria-live","polite");
    scoreboard.insertBefore(frontierTitle,oldTitle);scoreboard.insertBefore(frontier,oldTitle);
    map.replaceChildren(); mapEdges.forEach(([a,b,miles])=>{const [x1,y1]=cities[a],[x2,y2]=cities[b],key=`${a}-${b}`;map.append(svgEl("line",{x1,y1,x2,y2,class:"map-edge","data-edge":key}));const distance=svgEl("text",{x:(x1+x2)/2,y:(y1+y2)/2-8,class:"map-weight","data-edge":key,"aria-hidden":"true"});distance.textContent=String(miles);map.append(distance);});
    const gbfsLabels=new Set(["Arad","Sibiu","Timisoara","Zerind","Fagaras","Rimnicu","Oradea","Bucharest"]);
    Object.entries(cities).forEach(([name,[x,y]])=>{const g=svgEl("g",{class:"map-city","data-city":name});g.append(svgEl("circle",{cx:x,cy:y,r:16}));const label=svgEl("text",{x,y:y-32});label.textContent=name;g.append(label);const h=heuristic[name]??"";if(h!==""&&(type!=="gbfs"||gbfsLabels.has(name))){const t=svgEl("text",{x,y:y+34,class:"h-label"});t.textContent=`h=${h}`;g.append(t);}map.append(g);});
    let step=0; const data=mapSteps[type], scoreHistory=[], seen=new Set(), generatedEdges=new Set();
    const lessonSteps=type==="astar"?[...$("astar-steps").children]:[];
    const lessonSlide=type==="astar"?$("p7"):null;
    const lessonConclusion=lessonSlide?.querySelector(".lead");
    const compareButton=type==="astar"?$("compare-greedy"):null;
    if(lessonSlide){lessonSlide.classList.add("is-enhanced");compareButton.disabled=true;}
    const render=()=>{
      if(step>=data.length){
        step=0; scoreHistory.length=0; seen.clear(); generatedEdges.clear();
        map.querySelectorAll(".map-city").forEach(g=>{g.classList.remove("active","neighbor");});
        map.querySelectorAll(".map-edge").forEach(e=>{e.classList.remove("active","generated");});
        map.querySelectorAll(".map-weight").forEach(e=>e.classList.remove("active"));
        score.replaceChildren(); frontier.replaceChildren(); path.hidden=true; path.textContent="";
        lessonSteps.forEach(line=>line.classList.remove("is-revealed","is-current"));
        lessonConclusion?.classList.remove("is-revealed");
        if(compareButton){compareButton.disabled=true;$("astar-compare").textContent="";}
        button.textContent="下一步";
        return;
      }
      const currentStep=step,item=data[currentStep];
      seen.add(item.node);
      mapEdges.forEach(([a,b])=>{if(item.edges.includes(`${a}-${b}`)||item.edges.includes(`${b}-${a}`))seen.add(a===item.node?b:a);});
      map.querySelectorAll(".map-city").forEach(g=>{g.classList.toggle("active",g.dataset.city===item.node);g.classList.toggle("next",g.dataset.city===item.frontier[0]?.name);g.classList.toggle("neighbor",seen.has(g.dataset.city)&&g.dataset.city!==item.node);});
      item.edges.forEach(edge=>generatedEdges.add(edge));
      map.querySelectorAll(".map-edge").forEach(e=>{
        const key=e.dataset.edge, reverse=key.split("-").reverse().join("-");
        e.classList.toggle("active",item.edges.includes(key)||item.edges.includes(reverse));
        e.classList.toggle("generated",generatedEdges.has(key)||generatedEdges.has(reverse));
      });
      map.querySelectorAll(".map-weight").forEach(e=>{const key=e.dataset.edge,reverse=key.split("-").reverse().join("-");e.classList.toggle("active",item.edges.includes(key)||item.edges.includes(reverse));});
      item.rows.forEach(text=>scoreHistory.push({text,step:currentStep}));
      frontier.replaceChildren(...item.frontier.map(({name,value},index)=>{const row=document.createElement("p");row.className=`frontier-row${index===0?" next-choice":""}`;row.textContent=`${index===0?"下一步 · ":""}${name} · ${type==="astar"?"f":"h"}=${value}`;return row;}));
      if(item.frontier.length===0){const row=document.createElement("p");row.className="frontier-row complete";row.textContent="目标已取出，搜索结束";frontier.append(row);}
      score.replaceChildren(...scoreHistory.map(({text,step:rowStep})=>{const p=document.createElement("p");p.className=`score-row${rowStep===currentStep?" selected":""}${type==="astar"&&rowStep===3&&text.includes("Pitesti f=417")?" is-warning":""}`;p.textContent=text;return p;}));
      lessonSteps.forEach((line,index)=>{line.classList.toggle("is-revealed",index<=currentStep);line.classList.toggle("is-current",index===Math.min(currentStep,lessonSteps.length-1));});
      if(item.done){path.hidden=false;path.textContent=item.done;button.textContent="重新开始";lessonConclusion?.classList.add("is-revealed");if(compareButton)compareButton.disabled=false;}
      else{path.hidden=true;path.textContent="";button.textContent=currentStep===data.length-2?"取出终点":"下一步";}
      step++;
    };
    button.addEventListener("click",render);
  }
  initMap("gbfs"); initMap("astar");
  $("compare-greedy").addEventListener("click",()=>{$("astar-compare").innerHTML="贪心找到：450<br>A* 找到：<b>418 ✅</b>";});

  const codeLines=[...document.querySelectorAll(".code-line")];
  const codeMap=svgEl("svg",{class:"code-progress-map",viewBox:"0 0 640 160",role:"img","aria-label":"答对填空后逐步点亮 A* 的取节点、判断目标、生成后继三个步骤"});
  document.querySelector(".code-quiz").prepend(codeMap);
  const codeStages=[["取 f 最小",95],["判断目标",320],["否则生成后继",545]];
  function renderCodeMap(){
    const correct=codeLines.map(line=>line.classList.contains("is-correct"));
    codeMap.replaceChildren();
    codeStages.forEach(([,x])=>codeMap.append(svgEl("circle",{class:"placeholder",cx:x,cy:76,r:20,"aria-hidden":"true"})));
    for(let i=1;i<codeStages.length;i++)codeMap.append(svgEl("line",{class:`route${correct[i-1]&&correct[i]?" is-revealed":""}`,x1:codeStages[i-1][1]+20,y1:76,x2:codeStages[i][1]-20,y2:76}));
    codeStages.forEach(([name,x],index)=>{const city=svgEl("g",{class:`city${correct[index]?" is-revealed":""}`});city.append(svgEl("circle",{cx:x,cy:76,r:20}));const number=svgEl("text",{x,y:84,class:"stage-number"});number.textContent=String(index+1);city.append(number);const label=svgEl("text",{x,y:128});label.textContent=name;city.append(label);codeMap.append(city);});
  }
  codeLines.forEach((line,index)=>line.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{
    const correct=["small","return","frontier"][index], ok=button.dataset.answer===correct;
    line.querySelectorAll("button").forEach(b=>b.classList.remove("selected","correct","wrong"));button.classList.add("selected",ok?"correct":"wrong");
    line.classList.toggle("is-correct",ok);line.classList.toggle("is-wrong",!ok);
    const result=line.querySelector("b");result.textContent=ok?"✓":"✗";result.setAttribute("role","status");result.setAttribute("aria-label",ok?"回答正确":"回答不正确");
    if(!ok){line.classList.remove("shake");void line.offsetWidth;line.classList.add("shake");}
    else line.classList.remove("shake");
    renderCodeMap();
  })));
  renderCodeMap();

  const relax=$("relax-graph"), relaxNodes={Start:[80,170],A:[270,75],B:[270,265],C:[475,170],Goal:[640,170]};
  function drawRelax(route="B") {
    relax.replaceChildren();
    const activeEdges=route==="A"?new Set(["Start-A","A-C"]):new Set(["Start-B","B-C"]);
    [["Start","A"],["Start","B"],["A","C"],["B","C"],["C","Goal"]].forEach(([a,b])=>{const [x1,y1]=relaxNodes[a],[x2,y2]=relaxNodes[b];relax.append(svgEl("line",{x1,y1,x2,y2,class:activeEdges.has(`${a}-${b}`)?"active":""}));});
    Object.entries(relaxNodes).forEach(([name,[x,y]])=>{const g=svgEl("g",{class:`diagram-node${name===route||name==="C"?" active":""}`});g.append(svgEl("circle",{cx:x,cy:y,r:34}));const t=svgEl("text",{x,y});t.textContent=name;g.append(t);relax.append(g);});
    const c=svgEl("text",{x:475,y:225});c.textContent=route==="A"?"g=7.5  h=2  f=9.5":"g=8  h=2  f=10";relax.append(c);
    $("relax-a").classList.toggle("selected",route==="A");$("relax-b").classList.toggle("selected",route==="B");
  }
  drawRelax();
  $("relax-a").disabled=true;
  $("relax-status").textContent="先记录经 B 到 C 的代价，再比较经 A 到 C。";
  $("relax-b").addEventListener("click",()=>{drawRelax("B");$("relax-a").disabled=false;$("relax-status").textContent="原记录：经 B 到 C，g(C)=8，h(C)=2，f(C)=10。现在可以检查另一条路。";});
  $("relax-a").addEventListener("click",()=>{drawRelax("A");$("relax-status").textContent="发现更便宜的路，更新！C 的记录：g 从 8 降到 7.5；h(C)=2 不变；f 从 10 降到 9.5。";});

  const contour=$("contour-map"), contourNodes={Arad:{x:100,y:220,f:366},Sibiu:{x:255,y:145,f:393},Rimnicu:{x:390,y:235,f:413},Fagaras:{x:420,y:92,f:415},Pitesti:{x:530,y:245,f:417},Bucharest:{x:650,y:150,f:418}};
  const contourLevels=[380,400,420], contourLabels=["f ≤ 380：Arad","f ≤ 400：Arad、Sibiu","f ≤ 420：包括 Bucharest（最优路径 f=418）"];
  let contourStep=0;
  function drawContour(){
    contour.replaceChildren();
    const label=svgEl("text",{x:360,y:28,class:"contour-threshold"});
    label.textContent=contourStep?`当前阈值：f ≤ ${contourLevels[contourStep-1]}`:"逐步提高 f 阈值";contour.append(label);
    [["Arad","Sibiu"],["Sibiu","Rimnicu"],["Sibiu","Fagaras"],["Rimnicu","Pitesti"],["Fagaras","Bucharest"],["Pitesti","Bucharest"]].forEach(([a,b])=>{
      const start=contourNodes[a],end=contourNodes[b];contour.append(svgEl("line",{x1:start.x,y1:start.y,x2:end.x,y2:end.y}));
    });
    Object.entries(contourNodes).forEach(([name,{x,y,f}])=>{
      const reached=contourStep>0&&f<=contourLevels[contourStep-1];
      contour.append(svgEl("circle",{cx:x,cy:y,r:name==="Bucharest"?22:17,class:`contour-node${reached?" reached":""}${name==="Bucharest"&&reached?" goal":""}`}));
      const title=svgEl("text",{x,y:y+36});title.textContent=name;contour.append(title);
      const value=svgEl("text",{x,y:y+61,class:"f-value"});value.textContent=`f=${f}`;contour.append(value);
    });
    $("contour-status").textContent=contourStep?contourLabels[contourStep-1]:"选择“下一步”，查看 f 阈值如何扩展。";
    $("contour-next").textContent=contourStep===3?"重新开始":"下一步";
  }
  $("contour-next").addEventListener("click",()=>{contourStep=contourStep===3?0:contourStep+1;drawContour();});drawContour();

  const questions=[
    {type:"choice",q:"【单选】启发函数 h(n) 是什么？",options:["A. 从起点到 n 的真实代价","B. 从 n 到目标的估计代价","C. n 的子节点个数","D. 随机数"],answer:1},
    {type:"choice",q:"【单选】贪心搜索每次选什么样的节点？",options:["A. g(n) 最小","B. h(n) 最小","C. f(n) 最小","D. 深度最大"],answer:1},
    {type:"choice",q:"【单选】A* 每次选什么样的节点？",options:["A. g(n) 最小","B. h(n) 最小","C. f=g+h 最小","D. 深度最大"],answer:2},
    {type:"choice",q:"【单选】A* 保证最优还需要注意什么？",options:["A. h 尽可能大","B. 树搜索的 h 可采纳；图搜索还需 h 一致或正确重新打开节点","C. 图越大越好","D. g=0"],answer:1},
    {type:"choice",q:"【判断】贪心找到的路径一定最短。",options:["正确","错误"],answer:1},
    {type:"choice",q:"【判断】h(n)=0 时，A* 退化为一致代价搜索。",options:["正确","错误"],answer:0},
    {type:"short",q:"【简答】为什么直线距离是可采纳的启发函数？",answer:"真实道路是弯的，实际路程 ≥ 直线距离，所以 h(n) ≤ 真实代价，永不高估。"},
    {type:"short",q:"【简答】罗马尼亚地图上，贪心找到 450，A* 找到 418，为什么？",answer:"贪心只看 h，被 Fagaras（h=176）吸引走次优路；A* 算 g+h 总账，发现 Rimnicu-Pitesti 路 f 更小，拿到最优 418。"}
  ];
  let quizIndex=0;
  const quizState=Array(questions.length).fill(null);
  const quizStrip=document.createElement("nav");
  quizStrip.className="quiz-status-strip";
  quizStrip.setAttribute("aria-label","各题作答结果");
  $("quiz-card").before(quizStrip);

  function resultAt(index) {
    const state=quizState[index];
    if(!state?.checked) return null;
    return questions[index].type==="choice" ? state.choice===questions[index].answer : state.selfCorrect;
  }

  function syncQuizProgress() {
    quizStrip.replaceChildren();
    questions.forEach((question,index)=>{
      const result=resultAt(index), button=document.createElement("button");
      button.type="button";
      button.textContent=`${index+1} ${result===null?"○":result?"✓":"✗"}`;
      button.setAttribute("aria-label",`第 ${index+1} 题，${result===null?"未完成":result?"正确":"需复习"}${question.type==="short"?"（自评）":""}`);
      if(index===quizIndex) button.setAttribute("aria-current","step");
      if(result!==null) button.classList.add(result?"correct":"wrong");
      button.addEventListener("click",()=>{quizIndex=index;renderQuiz();quizStrip.children[index].focus();});
      quizStrip.append(button);
    });
    const objectiveCorrect=questions.slice(0,6).filter((_,i)=>resultAt(i)===true).length;
    const objectiveWrong=questions.slice(0,6).filter((_,i)=>resultAt(i)===false).length;
    const shortReviewed=questions.slice(6).filter((_,i)=>resultAt(i+6)!==null).length;
    const shortPositive=questions.slice(6).filter((_,i)=>resultAt(i+6)===true).length;
    $("quiz-count").textContent=`第 ${quizIndex+1} / 8 题`;
    $("quiz-score").textContent=`客观题 ${objectiveCorrect} / 6 正确`;
    $("quiz-total").textContent=`客观题：${objectiveCorrect} / 6 正确，${objectiveWrong} 题需复习 · 简答题：${shortReviewed} / 2 已自评（其中 ${shortPositive} 题自认答到要点）`;
    $("quiz-prev").disabled=quizIndex===0;
    $("quiz-next").disabled=quizIndex===7;
  }

  function renderQuiz() {
    const q=questions[quizIndex], state=quizState[quizIndex], card=$("quiz-card");
    card.replaceChildren();
    const title=document.createElement("h3");title.textContent=q.q;card.append(title);
    if(q.type==="choice") {
      const options=document.createElement("div");options.className="quiz-options";
      q.options.forEach((text,i)=>{
        const button=document.createElement("button");button.type="button";button.textContent=text;
        button.setAttribute("aria-pressed",String(state?.choice===i));
        if(state?.choice===i) button.classList.add("selected");
        if(state?.checked&&i===q.answer) button.classList.add("correct");
        if(state?.checked&&state.choice===i&&i!==q.answer) button.classList.add("wrong");
        button.addEventListener("click",()=>{
          quizState[quizIndex]={choice:i,checked:false};renderQuiz();
          card.querySelectorAll(".quiz-options button")[i].focus();
        });
        options.append(button);
      });
      card.append(options);
      const check=document.createElement("button");check.type="button";check.className="quiz-check";check.textContent="查看答案";
      check.disabled=state?.choice===undefined;
      check.addEventListener("click",()=>{
        quizState[quizIndex]={choice:state.choice,checked:true};renderQuiz();
        card.querySelectorAll(".quiz-options button")[state.choice].focus();
      });
      card.append(check);
      if(state?.checked) {
        const ok=state.choice===q.answer, feedback=document.createElement("p");
        feedback.className=`quiz-feedback ${ok?"correct":"wrong"}`;
        feedback.setAttribute("role","status");
        feedback.textContent=`${ok?"✓ 回答正确":"✗ 回答不正确"}。正确答案：${q.options[q.answer]}`;
        card.append(feedback);
      }
    } else {
      const input=document.createElement("textarea");input.rows=3;
      input.placeholder="写下你的答案，再查看参考答案。";
      input.setAttribute("aria-label",q.q);
      input.value=state?.text||"";
      const reference=document.createElement("div");
      input.addEventListener("input",()=>{
        quizState[quizIndex]={text:input.value,checked:false,selfCorrect:null};
        reference.replaceChildren();syncQuizProgress();
      });
      card.append(input);
      const check=document.createElement("button");check.type="button";check.textContent="查看答案";
      check.addEventListener("click",()=>{quizState[quizIndex]={text:input.value,checked:true,selfCorrect:null};renderQuiz();});
      card.append(check,reference);
      if(state?.checked) {
        const feedback=document.createElement("p");feedback.className="quiz-feedback";feedback.textContent=`参考：${q.answer}`;
        const assess=document.createElement("div");assess.className="quiz-options self-check";
        [[true,"我答到了要点"],[false,"我还要修改"]].forEach(([value,text])=>{
          const button=document.createElement("button");button.type="button";button.textContent=text;
          if(state.selfCorrect===value) button.classList.add(value?"correct":"wrong");
          button.addEventListener("click",()=>{state.selfCorrect=value;renderQuiz();});assess.append(button);
        });
        reference.append(feedback,assess);
        if(state.selfCorrect!==null) {
          const result=document.createElement("p");result.className=`quiz-feedback ${state.selfCorrect?"correct":"wrong"}`;
          result.textContent=state.selfCorrect?"✓ 自评正确。":"✗ 继续对照参考答案修改。";
          result.setAttribute("role","status");reference.append(result);
        }
      }
    }
    syncQuizProgress();
  }
  $("quiz-prev").addEventListener("click",()=>{quizIndex=Math.max(0,quizIndex-1);renderQuiz();});
  $("quiz-next").addEventListener("click",()=>{quizIndex=Math.min(7,quizIndex+1);renderQuiz();});
  renderQuiz();
})();
