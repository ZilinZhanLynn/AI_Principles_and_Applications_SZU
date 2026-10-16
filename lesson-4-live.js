(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const slides = [...document.querySelectorAll(".slide")];
  let current = Math.max(0, Math.min(slides.length - 1, Number(location.hash.replace("#p", "")) - 1 || 0));

  function updateNavigation(updateHash = true) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === current);
      slide.setAttribute("aria-current", i === current ? "page" : "false");
    });
    $("page-number").textContent = `${current + 1} / ${slides.length}`;
    $("progress").style.width = `${((current + 1) / slides.length) * 100}%`;
    $("prev").disabled = current === 0;
    $("next").disabled = current === slides.length - 1;
    if (updateHash) history.replaceState(null, "", `#p${current + 1}`);
    document.title = `第 4 课 · ${slides[current].querySelector("h1,h2")?.textContent || "盲目搜索"}`;
  }

  function showSlide(index, updateHash = true, behavior = "auto") {
    current = Math.max(0, Math.min(slides.length - 1, index));
    updateNavigation(updateHash);
    slides[current].querySelectorAll(":scope > .copy, :scope > aside").forEach((panel) => { panel.scrollTop = 0; });
    slides[current].scrollIntoView({behavior, block: "start"});
  }

  $("prev").addEventListener("click", () => showSlide(current - 1));
  $("next").addEventListener("click", () => showSlide(current + 1));
  window.addEventListener("hashchange", () => showSlide(Number(location.hash.replace("#p", "")) - 1, false));
  document.addEventListener("keydown", (event) => {
    const focused = document.activeElement;
    if (focused?.matches?.('input, textarea, select, button, a, [contenteditable="true"]')) return;
    if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) { event.preventDefault(); showSlide(current + 1); }
    if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); showSlide(current - 1); }
    if (event.key === "Home") showSlide(0);
    if (event.key === "End") showSlide(slides.length - 1);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = slides.indexOf(visible.target);
      if (index < 0 || index === current) return;
      current = index;
      updateNavigation(true);
    }, {threshold: [.55, .72]});
    slides.forEach((slide) => observer.observe(slide));
  }

  const fullscreenButton = $("fullscreen");
  const updateFullscreenLabel = () => { fullscreenButton.textContent = document.fullscreenElement ? "退出全屏" : "全屏"; };
  fullscreenButton.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_error) {
      fullscreenButton.textContent = "全屏不可用";
    }
  });
  document.addEventListener("fullscreenchange", updateFullscreenLabel);

  const setActive = (buttons, active) => buttons.forEach((button) => button.classList.toggle("active", button === active));
  const ns = "http://www.w3.org/2000/svg";
  function svgEl(name, attrs = {}) { const element = document.createElementNS(ns, name); Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value)); return element; }

  // P01 · definition contrast
  const searchModes = {
    informed: "有信息搜索：利用启发式函数 h(n) 估计非目标状态离目标的希望程度或代价，并据此决定先扩展哪个节点。",
    uninformed: "无信息搜索：只有问题的基本定义，没有目标位置的额外知识，只能按系统规则扩展节点。"
  };
  [$("search-mode-informed"), $("search-mode-uninformed")].forEach((button) => button.addEventListener("click", () => {
    const key = button.id.endsWith("informed") && !button.id.endsWith("uninformed") ? "informed" : "uninformed";
    $("search-mode-panel").textContent = searchModes[key];
    setActive([$("search-mode-informed"), $("search-mode-uninformed")], button);
  }));
  $("search-mode-uninformed").click();

  // P02 · FIFO
  const fifoStates = [
    { queue: ["A"], text: "初始状态 A 入队。" },
    { queue: ["B", "C", "D"], text: "A 从队首取出；B、C、D 依次进入队尾。" },
    { queue: ["C", "D", "E", "F"], text: "B 先入先出；B 的后继 E、F 加到队尾。" },
    { queue: ["D", "E", "F", "G"], text: "C 被取出；队首始终是最早进入边界的节点。" }
  ];
  let fifoStep = 0;
  let fifoTimer = null;
  function renderFifo() {
    $("bfs-queue-track").replaceChildren(...fifoStates[fifoStep].queue.map((name, i) => {
      const node = document.createElement("span"); node.className = `token${i === 0 ? " current" : ""}`; node.textContent = name; return node;
    }));
    $("bfs-queue-status").textContent = `队首 → ${fifoStates[fifoStep].queue.join("　")} ← 队尾。${fifoStates[fifoStep].text}`;
  }
  function stopFifo() { if (fifoTimer) { clearInterval(fifoTimer); fifoTimer = null; $("bfs-queue-auto").textContent = "自动播放"; } }
  $("bfs-queue-next").addEventListener("click", () => { fifoStep = Math.min(fifoStates.length - 1, fifoStep + 1); renderFifo(); });
  $("bfs-queue-auto").addEventListener("click", () => { if (fifoTimer) { stopFifo(); return; } if (fifoStep === fifoStates.length - 1) fifoStep = 0; $("bfs-queue-auto").textContent = "暂停"; renderFifo(); fifoTimer = setInterval(() => { if (fifoStep >= fifoStates.length - 1) { stopFifo(); return; } fifoStep++; renderFifo(); }, 800); });
  $("bfs-queue-reset").addEventListener("click", () => { stopFifo(); fifoStep = 0; renderFifo(); });
  renderFifo();

  // P03 · redrawn BFS layers
  const bfsLayerCaptions = ["先把初始状态放到边界上。", "扩展所有恰好一步可到达的状态。", "继续扩展所有恰好二步可到达的状态。", "继续扩展所有恰好三步可到达的状态。", "第 4 层出现目标节点。", "Solved! 找到从 START 到 GOAL 的路径。"];
  const bfsLayerNodes = { START:[80,255,0], d:[260,145,1], e:[260,255,1], p:[260,365,1], b:[450,70,2], c:[450,150,2], h:[450,245,2], q:[450,340,2], r:[450,425,2], a:[650,105,3], f:[650,370,3], GOAL:[830,245,4] };
  const bfsLayerEdges = [["START","d"],["START","e"],["START","p"],["d","b"],["d","c"],["e","c"],["e","h"],["e","r"],["p","h"],["p","q"],["b","a"],["c","a"],["r","f"],["f","GOAL"]];
  const bfsSolution = new Set(["START-e","e-r","r-f","f-GOAL"]);
  let bfsLayerStep = 0, bfsLayerTimer = null;
  function renderBfsLayer() {
    const svg=$("bfs-layer-graph"); svg.replaceChildren();
    const defs=svgEl("defs"), marker=svgEl("marker",{id:"bfs-arrow",viewBox:"0 0 10 10",refX:"9",refY:"5",markerWidth:"7",markerHeight:"7",orient:"auto"}); marker.append(svgEl("path",{d:"M0 0 L10 5 L0 10z",fill:"#003366"})); defs.append(marker); svg.append(defs);
    bfsLayerEdges.forEach(([a,b])=>{const [x1,y1,l1]=bfsLayerNodes[a],[x2,y2,l2]=bfsLayerNodes[b];if(l2>bfsLayerStep||l1>bfsLayerStep)return;const solved=bfsLayerStep===5&&bfsSolution.has(`${a}-${b}`);svg.append(svgEl("line",{x1,y1,x2,y2,class:`graph-edge${solved?" solution":""}`,"marker-end":"url(#bfs-arrow)"}));});
    Object.entries(bfsLayerNodes).forEach(([name,[x,y,layer]])=>{if(layer>bfsLayerStep)return;const g=svgEl("g",{class:`graph-node layer-${layer}${layer===bfsLayerStep&&bfsLayerStep<5?" frontier":""}${name==="GOAL"?" goal":""}`});g.append(svgEl("circle",{cx:x,cy:y,r:34}));const t=svgEl("text",{x,y});t.textContent=name;g.append(t);svg.append(g);});
    for(let i=0;i<=4;i++){const t=svgEl("text",{x:[80,260,450,650,830][i],y:495,class:"layer-label"});t.textContent=`第 ${i} 层`;svg.append(t);}
    $("bfs-layer-caption").textContent=bfsLayerCaptions[bfsLayerStep];
    const buttons=[...$("bfs-layer-steps").querySelectorAll("button")]; setActive(buttons,buttons[bfsLayerStep]);
  }
  function stopBfsLayer(){if(bfsLayerTimer){clearInterval(bfsLayerTimer);bfsLayerTimer=null;$("bfs-layer-auto").textContent="自动播放";}}
  [...$("bfs-layer-steps").querySelectorAll("button")].forEach((button,index)=>button.addEventListener("click",()=>{stopBfsLayer();bfsLayerStep=index;renderBfsLayer();}));
  $("bfs-layer-next").addEventListener("click",()=>{stopBfsLayer();bfsLayerStep=Math.min(5,bfsLayerStep+1);renderBfsLayer();});
  $("bfs-layer-auto").addEventListener("click",()=>{if(bfsLayerTimer){stopBfsLayer();return;}if(bfsLayerStep===5)bfsLayerStep=0;$("bfs-layer-auto").textContent="暂停";renderBfsLayer();bfsLayerTimer=setInterval(()=>{if(bfsLayerStep===5){stopBfsLayer();return;}bfsLayerStep++;renderBfsLayer();},900);});
  $("bfs-layer-reset").addEventListener("click",()=>{stopBfsLayer();bfsLayerStep=0;renderBfsLayer();});

  // P04 · functional water jugs and recorded frontier
  let jug = [0, 0];
  const jugHistory = [[0, 0]];
  function legalJugActions([a, b]) {
    return {
      "bfs-jug-empty-3": a > 0,
      "bfs-jug-empty-4": b > 0,
      "bfs-jug-fill-3": a < 3,
      "bfs-jug-fill-4": b < 4,
      "bfs-jug-pour-3-4": a > 0 && b < 4,
      "bfs-jug-pour-4-3": b > 0 && a < 3
    };
  }
  function renderJug(message = "请选择一个合法动作。") {
    $("bfs-jug-3").dataset.capacity = "3 Gallon"; $("bfs-jug-4").dataset.capacity = "4 Gallon";
    $("bfs-jug-3").querySelector("i").style.height = `${jug[0] / 3 * 100}%`;
    $("bfs-jug-4").querySelector("i").style.height = `${jug[1] / 4 * 100}%`;
    $("bfs-jug-3-amount").textContent = jug[0]; $("bfs-jug-4-amount").textContent = jug[1];
    $("bfs-jug-current-state").textContent = `(${jug[0]},${jug[1]})`;
    $("bfs-jug-history").textContent = jugHistory.map(s => `(${s.join(",")})`).join(" → ");
    const legal = legalJugActions(jug);
    Object.entries(legal).forEach(([id, allowed]) => { $(id).disabled = !allowed; });
    $("bfs-jug-status").textContent = message;
  }
  function applyJug(action) {
    let [a, b] = jug;
    if (action === "empty3") a = 0;
    if (action === "empty4") b = 0;
    if (action === "fill3") a = 3;
    if (action === "fill4") b = 4;
    if (action === "pour34") { const t = Math.min(a, 4 - b); a -= t; b += t; }
    if (action === "pour43") { const t = Math.min(b, 3 - a); b -= t; a += t; }
    jug = [a, b]; jugHistory.push([...jug]);
    renderJug(b === 2 ? "到了：4 Gallon 水罐中有 2 Gallon。" : "动作已执行。");
  }
  const jugBindings = { "bfs-jug-empty-3": "empty3", "bfs-jug-empty-4": "empty4", "bfs-jug-fill-3": "fill3", "bfs-jug-fill-4": "fill4", "bfs-jug-pour-3-4": "pour34", "bfs-jug-pour-4-3": "pour43" };
  Object.entries(jugBindings).forEach(([id, action]) => $(id).addEventListener("click", () => applyJug(action)));
  const bfsFrontiers = [
    ["<(0,0)>"],
    ["<(0,0),(3,0)>", "<(0,0),(0,4)>"],
    ["<(0,0),(0,4)>", "<(0,0),(3,0),(0,0)>", "<(0,0),(3,0),(3,4)>", "<(0,0),(3,0),(0,3)>"],
    ["<(0,0),(3,0),(0,0)>", "<(0,0),(3,0),(3,4)>", "<(0,0),(3,0),(0,3)>", "<(0,0),(0,4),(0,0)>", "<(0,0),(0,4),(3,4)>", "<(0,0),(0,4),(3,1)>"]
  ];
  let bfsFrontierStep = 0;
  function renderBfsFrontier() {
    $("bfs-frontier-list").replaceChildren(...bfsFrontiers[bfsFrontierStep].map((item, i) => {
      const row = document.createElement("div"); row.className = "frontier-item"; row.textContent = `${i === 0 ? "队首　" : ""}${item}`; return row;
    }));
    [...$("p04-boundary-steps").children].forEach((item,index)=>item.classList.toggle("active-step",index===bfsFrontierStep));
    $("bfs-frontier-step-label").textContent = `第 ${bfsFrontierStep + 1} / 4 步`;
    $("bfs-frontier-status").textContent = `队首路径先被取出；其后继加入队尾。`;
    $("bfs-frontier-prev").disabled = bfsFrontierStep === 0;
    $("bfs-frontier-next").disabled = bfsFrontierStep === 3;
  }
  function setBfsJugMode(mode) {
    const practice = mode === "practice";
    $("bfs-jug-practice").hidden = !practice;
    $("bfs-jug-queue").hidden = practice;
    $("bfs-jug-mode-practice").setAttribute("aria-selected", practice ? "true" : "false");
    $("bfs-jug-mode-queue").setAttribute("aria-selected", practice ? "false" : "true");
    setActive([$("bfs-jug-mode-practice"), $("bfs-jug-mode-queue")], practice ? $("bfs-jug-mode-practice") : $("bfs-jug-mode-queue"));
  }
  $("bfs-jug-mode-practice").addEventListener("click", () => setBfsJugMode("practice"));
  $("bfs-jug-mode-queue").addEventListener("click", () => setBfsJugMode("queue"));
  [...$("p04-boundary-steps").children].forEach((item, index) => {
    item.tabIndex = 0;
    item.addEventListener("click", () => { bfsFrontierStep = index; renderBfsFrontier(); setBfsJugMode("queue"); });
    item.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); item.click(); } });
  });
  $("bfs-frontier-prev").addEventListener("click", () => { bfsFrontierStep = Math.max(0, bfsFrontierStep - 1); renderBfsFrontier(); });
  $("bfs-frontier-next").addEventListener("click", () => { bfsFrontierStep = Math.min(3, bfsFrontierStep + 1); renderBfsFrontier(); });
  $("bfs-frontier-reset").addEventListener("click", () => { bfsFrontierStep = 0; jug = [0,0]; jugHistory.splice(0, jugHistory.length, [0,0]); renderBfsFrontier(); renderJug("已重置。"); });
  renderBfsFrontier(); renderJug(); setBfsJugMode("practice");

  // P05–P06 · complexity controls
  function renderComplexity() {
    const b = Number($("bfs-branching").value), d = Number($("bfs-depth").value);
    const total = (Math.pow(b, d + 1) - 1) / (b - 1);
    $("bfs-node-total").innerHTML = `b = ${b}，d = ${d}<br>1 + b + … + b<sup>d</sup> = ${total.toLocaleString("zh-CN")} 个节点`;
  }
  $("bfs-branching").addEventListener("input", renderComplexity); $("bfs-depth").addEventListener("input", renderComplexity); renderComplexity();
  const memoryRows = {
    1: ["1", "0.01 毫秒", "100 bytes", 2], 2: ["10²", "1 毫秒", "10 KB", 12], 3: ["10³", "0.01 秒", "100 KB", 22],
    4: ["10⁴", "0.1 秒", "1 MB", 32], 5: ["10⁵", "1 秒", "10 MB", 44], 6: ["10⁶", "10 秒", "100 MB", 56],
    7: ["10⁷", "1.7 分钟", "1 GB", 68], 8: ["10⁸", "17 分钟", "10 GB", 82], 9: ["10⁹", "3 小时", "100 GB", 100]
  };
  function renderMemory() {
    const d = Number($("bfs-memory-depth").value), [nodes, time, space, width] = memoryRows[d];
    $("bfs-memory-nodes").textContent = nodes; $("bfs-memory-time").textContent = time; $("bfs-memory-space").textContent = space;
    $("bfs-memory-bar").style.width = `${width}%`;
    $("bfs-memory-warning").textContent = d >= 8 ? "内存首先成为瓶颈。" : "拖动深度，观察指数增长。";
  }
  $("bfs-memory-depth").addEventListener("input", renderMemory); renderMemory();

  // P07 · LIFO/FIFO comparison
  const structures = {
    lifo: [
      [["A"], "A 入栈。"], [["B","C","D"], "A 出栈；B、C、D 入栈。"], [["B","C","G","F"], "D 最后进入，最先取出；继续沿 D 的分支深入。"]
    ],
    fifo: [
      [["A"], "A 入队。"], [["B","C","D"], "A 出队；B、C、D 入队。"], [["C","D","E","F"], "B 最早进入，最先取出；继续逐层扩展。"]
    ]
  };
  let structureMode = "lifo", structureStep = 0;
  let structureTimer = null;
  function renderStructure() {
    const [items, text] = structures[structureMode][structureStep];
    $("dfs-stack-track").replaceChildren(...items.map((name, i) => { const n=document.createElement("span"); n.className=`token${(structureMode==="lifo" ? i===items.length-1 : i===0) ? " current" : ""}`; n.textContent=name; return n; }));
    $("dfs-stack-status").textContent = `${structureMode === "lifo" ? "栈底 → 栈顶" : "队首 → 队尾"}：${text}`;
  }
  function stopStructure(){if(structureTimer){clearInterval(structureTimer);structureTimer=null;$("dfs-stack-auto").textContent="自动播放";}}
  $("dfs-mode-lifo").addEventListener("click", () => { structureMode="lifo"; structureStep=0; setActive([$("dfs-mode-lifo"),$("dfs-mode-fifo")],$("dfs-mode-lifo")); renderStructure(); });
  $("dfs-mode-fifo").addEventListener("click", () => { structureMode="fifo"; structureStep=0; setActive([$("dfs-mode-lifo"),$("dfs-mode-fifo")],$("dfs-mode-fifo")); renderStructure(); });
  $("dfs-stack-next").addEventListener("click",()=>{stopStructure();structureStep=Math.min(2,structureStep+1);renderStructure();});
  $("dfs-stack-auto").addEventListener("click",()=>{if(structureTimer){stopStructure();return;}if(structureStep===2)structureStep=0;$("dfs-stack-auto").textContent="暂停";renderStructure();structureTimer=setInterval(()=>{if(structureStep===2){stopStructure();return;}structureStep++;renderStructure();},800);});
  $("dfs-stack-reset").addEventListener("click",()=>{stopStructure();structureStep=0;renderStructure();}); $("dfs-mode-lifo").click();

  // P08 · DFS frontier
  const dfsFrontiers = [
    ["<(0,0)>"],
    ["<(0,0),(3,0)>", "<(0,0),(0,4)>"],
    ["<(0,0),(3,0),(0,0)>", "<(0,0),(3,0),(3,4)>", "<(0,0),(3,0),(0,3)>", "<(0,0),(0,4)>"],
    ["<(0,0),(3,0),(0,0),(3,0)>", "<(0,0),(3,0),(0,0),(0,4)>", "<(0,0),(3,0),(3,4)>", "<(0,0),(3,0),(0,3)>", "<(0,0),(0,4)>"]
  ];
  let dfsFrontierStep = 0;
  const dfsMainPath = [0, 1, 3, 6];
  function buildDfsJugTree(){
    const svg=$("dfs-jug-tree");svg.replaceChildren();
    const points=[{s:"(0,0)",x:380,y:55,d:0},{s:"(3,0)",x:235,y:155,d:1},{s:"(0,4)",x:535,y:155,d:1,b:true},{s:"(0,0)",x:155,y:270,d:2},{s:"(3,4)",x:300,y:270,d:2,b:true},{s:"(0,3)",x:445,y:270,d:2,b:true},{s:"(3,0)",x:105,y:380,d:3},{s:"(0,4)",x:255,y:380,d:3,b:true}];
    const edges=[[0,1],[0,2],[1,3],[1,4],[1,5],[3,6],[3,7]];
    edges.forEach(([a,b])=>{const p=points[a],q=points[b];svg.append(svgEl("line",{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:"graph-edge","data-depth":q.d,"data-child":b}));});
    points.forEach((p,i)=>{const g=svgEl("g",{class:`graph-node${p.b?" backtrack":""}`,"data-depth":p.d,"data-node-index":i});g.append(svgEl("circle",{cx:p.x,cy:p.y,r:38}));const t=svgEl("text",{x:p.x,y:p.y});t.textContent=p.s;g.append(t);svg.append(g);});
    const legend=svgEl("g",{class:"dfs-legend",transform:"translate(425 342)"});legend.append(svgEl("circle",{cx:18,cy:18,r:14}));const legendText=svgEl("text",{x:46,y:25});legendText.textContent="回溯点";legend.append(legendText);svg.append(legend);
  }
  function renderDfsFrontier(){
    $("dfs-frontier-list").replaceChildren(...dfsFrontiers[dfsFrontierStep].map((x,i)=>{const r=document.createElement("div");r.className=`frontier-item${i===0?" current":" backtrack"}`;r.textContent=x;return r;}));
    $("dfs-frontier-step-label").textContent=`第 ${dfsFrontierStep+1} / 4 步`;
    $("dfs-frontier-status").textContent=`栈顶路径下一次被取出；红色结点保留在边界上，等待回溯。`;
    document.querySelectorAll('#dfs-jug-tree [data-depth]').forEach(n=>n.classList.toggle('revealed',Number(n.dataset.depth)<=dfsFrontierStep));
    document.querySelectorAll('#dfs-jug-tree [data-node-index]').forEach(n=>n.classList.toggle('active',Number(n.dataset.nodeIndex)===dfsMainPath[dfsFrontierStep]));
    [...$("dfs-frontier-steps").querySelectorAll("button")].forEach((button,index)=>button.classList.toggle("active",index===dfsFrontierStep));
    $("dfs-frontier-prev").disabled=dfsFrontierStep===0;
    $("dfs-frontier-next").disabled=dfsFrontierStep===3;
  }
  [...$("dfs-frontier-steps").querySelectorAll("button")].forEach(button=>button.addEventListener("click",()=>{dfsFrontierStep=Number(button.dataset.dfsStep);renderDfsFrontier();}));
  $("dfs-frontier-prev").addEventListener("click",()=>{dfsFrontierStep=Math.max(0,dfsFrontierStep-1);renderDfsFrontier();});
  $("dfs-frontier-next").addEventListener("click",()=>{dfsFrontierStep=Math.min(3,dfsFrontierStep+1);renderDfsFrontier();});
  $("dfs-frontier-reset").addEventListener("click",()=>{dfsFrontierStep=0;renderDfsFrontier();}); buildDfsJugTree();renderDfsFrontier();

  // P09 · DFS/BFS grid
  const walls = new Set([6,7,11,16,17,18,23]);
  const dfsOrder = [25,26,27,28,29,24,19,14,9,4];
  const bfsOrder = [25,20,26,15,21,27,10,22,28,5,29,24,19,14,9,4];
  let gridMode="DFS", gridIndex=0, gridTimer=null;
  function buildGrid(){ const cells=[]; for(let i=0;i<30;i++){const c=document.createElement("div");c.className=`grid-cell${walls.has(i)?" wall":""}${i===25?" start":""}${i===4?" goal":""}`;c.dataset.index=i;c.textContent=walls.has(i)?"":(i===25?"START":i===4?"GOAL":"");cells.push(c);} $("dfs-grid").replaceChildren(...cells); renderGrid(); }
  function renderGrid(){ const order=gridMode==="DFS"?dfsOrder:bfsOrder; [...$("dfs-grid").children].forEach(c=>c.classList.remove("visited","current")); order.slice(0,gridIndex+1).forEach((idx,i)=>{const c=$("dfs-grid").children[idx];c.classList.add("visited");if(i===gridIndex)c.classList.add("current");}); $("dfs-grid-status").textContent=`${gridMode}：已访问 ${gridIndex+1} 个状态；当前格 ${order[gridIndex]}. ${order[gridIndex]===4?"到达 GOAL。":""}`; }
  function stopGrid(){if(gridTimer){clearInterval(gridTimer);gridTimer=null;$("dfs-grid-auto").textContent="自动播放";}}
  $("dfs-grid-next").addEventListener("click",()=>{stopGrid();const o=gridMode==="DFS"?dfsOrder:bfsOrder;gridIndex=Math.min(o.length-1,gridIndex+1);renderGrid();});
  $("dfs-grid-auto").addEventListener("click",()=>{if(gridTimer){stopGrid();return;}$("dfs-grid-auto").textContent="暂停";gridTimer=setInterval(()=>{const o=gridMode==="DFS"?dfsOrder:bfsOrder;if(gridIndex>=o.length-1){stopGrid();return;}gridIndex++;renderGrid();},550);});
  $("dfs-grid-bfs").addEventListener("click",()=>{stopGrid();gridMode=gridMode==="DFS"?"BFS":"DFS";gridIndex=0;$("dfs-grid-bfs").textContent=gridMode==="DFS"?"BFS 对比":"DFS 对比";renderGrid();});
  $("dfs-grid-reset").addEventListener("click",()=>{stopGrid();gridMode="DFS";gridIndex=0;$("dfs-grid-bfs").textContent="BFS 对比";renderGrid();}); buildGrid();

  // P10 · derivation buttons
  const spaceText = {
    "dfs-space-path":"当前路径最深可达 m 层，因此路径上的节点需要 O(m) 空间。",
    "dfs-space-siblings":"每一层最多还有 b−1 个未展开的兄弟节点，等待回溯。",
    "dfs-space-total":"m 层 × 每层约 b 个节点，合计空间复杂度 O(bm)。"
  };
  function buildDfsSpace(){const svg=$("dfs-space-visual");svg.replaceChildren();for(let level=0;level<5;level++){const y=65+level*100;for(let j=0;j<3;j++){const x=250+j*150;const g=svgEl("g",{class:`space-node ${j===1?"path":"sibling"}`,"data-space-part":j===1?"path":"siblings"});g.append(svgEl("circle",{cx:x,cy:y,r:30}));const t=svgEl("text",{x,y});t.textContent=j===1?`n${level}`:"兄弟";g.append(t);svg.append(g);if(j===1&&level<4)svg.append(svgEl("line",{x1:x,y1:y+30,x2:x,y2:y+70,class:"graph-edge"}));}}const label=svgEl("text",{x:410,y:525,class:"space-total-label","data-space-part":"total"});label.textContent="O(m) + (b−1)m = O(bm)";svg.append(label);}
  function renderSpace(part){document.querySelectorAll('#dfs-space-visual [data-space-part]').forEach(node=>node.classList.toggle('emphasis',node.dataset.spacePart===part||(part==='total')));}
  Object.keys(spaceText).forEach(id=>$(id).addEventListener("click",()=>{const part=id.replace('dfs-space-','');$("dfs-space-status").textContent=spaceText[id];setActive(Object.keys(spaceText).map($),$(id));renderSpace(part);})); buildDfsSpace();$("dfs-space-path").click();

  // P11 · DLS tree and pseudocode trace
  let dlsStep=0;
  function renderDlsTree(){ const limit=Number($("dls-limit").value); const box=document.createElement("div");box.className="tree-levels";for(let depth=0;depth<=3;depth++){const row=document.createElement("div");row.className="tree-level";for(let i=0;i<Math.min(Math.pow(2,depth),8);i++){const n=document.createElement("span");n.className=`tree-node${depth>limit?" cut":""}`;n.textContent=depth>limit?"×":`${depth}.${i+1}`;row.append(n);}box.append(row);}$("dls-tree").replaceChildren(box);$("dls-status").textContent=`ℓ = ${limit}：深度 ${limit} 的节点仍会检查，但不再生成后继。`; }
  function highlightDls(){for(let i=1;i<=11;i++)$("dls-line-"+i).classList.toggle("active",i===dlsStep+1);$("dls-status").textContent=`伪代码第 ${dlsStep+1} 行：${$("dls-line-"+(dlsStep+1)).textContent.trim()}`;}
  $("dls-limit").addEventListener("input",renderDlsTree);$("dls-next").addEventListener("click",()=>{dlsStep=Math.min(10,dlsStep+1);highlightDls();});$("dls-reset").addEventListener("click",()=>{dlsStep=0;renderDlsTree();for(let i=1;i<=11;i++)$("dls-line-"+i).classList.remove("active");});renderDlsTree();

  // P12 · IDS reruns DLS from the root and accumulates generated nodes.
  let idsLimit=0, idsTimer=null;
  function idsRoundNodes(limit){return (Math.pow(4,limit+1)-1)/3;}
  function idsTotalNodes(limit){let sum=0;for(let l=0;l<=limit;l++)sum+=idsRoundNodes(l);return sum;}
  function renderIdsTree(){
    const svg=$("ids-tree");svg.replaceChildren();
    const shown=Math.min(idsLimit,3),levels=[[450],[210,370,530,690],[130,230,330,430,530,630,730,830],[130,230,330,430,530,630,730,830]];
    for(let level=0;level<=3;level++){
      const band=svgEl("rect",{x:64,y:20+level*108,width:800,height:92,rx:10,class:`ids-level-band${level<=shown?" reached":""}`});svg.append(band);
      const label=svgEl("text",{x:20,y:78+level*108,class:"ids-level-label"});label.textContent=`${level}`;svg.append(label);
    }
    for(let l=0;l<=shown;l++){
      const y=66+l*108;
      levels[l].forEach((x,i)=>{
        if(l>0){const parentX=levels[l-1][Math.min(levels[l-1].length-1,Math.floor(i*levels[l-1].length/levels[l].length))];svg.append(svgEl("line",{x1:parentX,y1:66+(l-1)*108+27,x2:x,y2:y-27,class:"graph-edge"}));}
        const g=svgEl("g",{class:`graph-node${l===shown?" frontier":""}`});g.append(svgEl("circle",{cx:x,cy:y,r:27}));const t=svgEl("text",{x,y});t.textContent=l===0?"根":`${l}`;g.append(t);svg.append(g);
      });
    }
    const limitY=112+shown*108;
    svg.append(svgEl("line",{x1:64,y1:limitY,x2:864,y2:limitY,class:"ids-limit-line"}));
    const limitText=svgEl("text",{x:770,y:limitY-10,class:"ids-limit-label"});limitText.textContent=`ℓ = ${idsLimit}`;svg.append(limitText);
    if(idsLimit>3){const ell=svgEl("text",{x:450,y:445,class:"ids-ellipsis"});ell.textContent=`… 继续到 ℓ = ${idsLimit}`;svg.append(ell);}
    $("ids-current-limit").textContent=`ℓ = ${idsLimit}`;
    $("ids-round-label").textContent=`第 ${idsLimit+1} / 11 轮`;
    $("ids-round-nodes").textContent=idsRoundNodes(idsLimit).toLocaleString('zh-CN');
    $("ids-total-nodes").textContent=idsTotalNodes(idsLimit).toLocaleString('zh-CN');
    $("ids-status").textContent=idsLimit===10?"b=4、d=10：累计产生 1,864,131 个状态；BFS 产生 5,592,401 个状态。":`第 ${idsLimit+1} 轮从根重新开始，深度限制 ℓ = ${idsLimit}。`;
    [...$("ids-round-strip").querySelectorAll("button")].forEach(button=>button.classList.toggle("active",Number(button.dataset.idsLimit)===idsLimit));
    $("ids-prev").disabled=idsLimit===0;$("ids-next").disabled=idsLimit===10;
  }
  function stopIds(){if(idsTimer){clearInterval(idsTimer);idsTimer=null;$("ids-auto").textContent="自动播放";}}
  [...$("ids-round-strip").querySelectorAll("button")].forEach(button=>button.addEventListener("click",()=>{stopIds();idsLimit=Number(button.dataset.idsLimit);renderIdsTree();}));
  $("ids-prev").addEventListener("click",()=>{stopIds();idsLimit=Math.max(0,idsLimit-1);renderIdsTree();});
  $("ids-next").addEventListener("click",()=>{stopIds();idsLimit=Math.min(10,idsLimit+1);renderIdsTree();});$("ids-auto").addEventListener("click",()=>{if(idsTimer){stopIds();return;}if(idsLimit===10)idsLimit=0;$("ids-auto").textContent="暂停";renderIdsTree();idsTimer=setInterval(()=>{if(idsLimit===10){stopIds();return;}idsLimit++;renderIdsTree();},650);});$("ids-reset").addEventListener("click",()=>{stopIds();idsLimit=0;renderIdsTree();});

  // P13 · BFS/UCS comparison
  const compare={order:"BFS 按生成顺序出队；UCS 按累计代价从小到大出队。",goal:"BFS 保证最浅解；UCS 在非负动作代价下保证最小代价解。",structure:"BFS 使用普通 FIFO 队列；UCS 使用优先队列。",example:"每步代价相同可用 BFS；每步代价不同应按累计代价选择 UCS。"};
  ["order","goal","structure","example"].forEach((key,index)=>$("ucs-compare-"+key).addEventListener("click",()=>{$("ucs-comparison-status").textContent=compare[key];setActive([...$("ucs-comparison").querySelectorAll("button")],$("ucs-compare-"+key));document.querySelectorAll('.slide[data-slide="14"] tbody tr').forEach((row,rowIndex)=>row.classList.toggle("active",rowIndex===index));}));$("ucs-compare-order").click();

  // P14 · UCS graph and priority queue
  const ucsSteps=[
    ["—",[["START",0]]],["START",[["p",1],["d",3],["e",9]]],["p",[["d",3],["e",9],["q",16]]],
    ["d",[["b",4],["e",5],["c",11],["q",16]]],["b",[["e",5],["a",6],["c",11],["q",16]]],
    ["e",[["h",6],["a",6],["c",11],["r",14],["q",16]]],["h",[["a",6],["q",10],["c",11],["r",14]]],
    ["a",[["q",10],["c",11],["r",14]]],["q",[["c",11],["r",13]]],["c",[["r",13]]],
    ["r",[["t",18]]],["t",[["GOAL",23]]],["GOAL",[]]
  ];
  const graphNodes={START:[70,225],p:[190,70],d:[190,225],e:[335,390],b:[335,145],c:[335,275],a:[500,105],h:[500,335],q:[625,180],r:[735,315],t:[835,315],GOAL:[930,225]};
  const graphEdges=[["START","p",1],["START","d",3],["START","e",9],["p","q",15],["d","b",1],["d","e",2],["d","c",8],["b","a",2],["e","h",1],["e","r",9],["h","q",4],["q","r",3],["c","r",2],["r","t",5],["t","GOAL",5]];
  const ucsEdgeCurves={"START-e":34,"p-q":-34,"d-b":-12,"d-e":24,"d-c":10,"b-a":-12,"e-h":8,"e-r":48,"h-q":-8,"q-r":-16,"c-r":-34,"t-GOAL":-12};
  function addUcsMarker(defs,id,color){const marker=svgEl("marker",{id,viewBox:"0 0 10 10",refX:"9",refY:"5",markerWidth:"6",markerHeight:"6",orient:"auto"});marker.append(svgEl("path",{d:"M 0 0 L 10 5 L 0 10 z",fill:color}));defs.append(marker);}
  function buildUcsIntroGraph(){
    const svg=$("ucs-intro-graph");svg.replaceChildren();
    const defs=svgEl("defs");addUcsMarker(defs,"intro-arrow","#003366");svg.append(defs);
    const start=[105,145],children=[{name:"p",cost:1,x:555,y:55},{name:"d",cost:3,x:555,y:145},{name:"e",cost:9,x:555,y:235}];
    children.forEach(child=>{
      svg.append(svgEl("line",{x1:start[0]+42,y1:start[1],x2:child.x-42,y2:child.y,class:"intro-edge","marker-end":"url(#intro-arrow)"}));
      const weight=svgEl("g",{class:"intro-weight",transform:`translate(335 ${(start[1]+child.y)/2})`});weight.append(svgEl("rect",{x:-24,y:-18,width:48,height:36,rx:8}));const wt=svgEl("text",{x:0,y:1});wt.textContent=child.cost;weight.append(wt);svg.append(weight);
    });
    [{name:"START",x:start[0],y:start[1]},...children].forEach(node=>{const g=svgEl("g",{class:"ucs-node"});g.append(svgEl("circle",{cx:node.x,cy:node.y,r:38,class:"node"}));const label=svgEl("text",{x:node.x,y:node.y,class:"ucs-node-label"});label.textContent=node.name;g.append(label);svg.append(g);});
    const queueItems=(target,withCost)=>{$(target).replaceChildren(...children.map(child=>{const item=document.createElement("span");item.className="queue-item";item.textContent=withCost?`${child.name} · ${child.cost}`:child.name;return item;}));};
    queueItems("ucs-fifo-track",false);queueItems("ucs-priority-track",true);
  }
  function ucsEdgeGeometry(from,to,curve=0){const [x1,y1]=graphNodes[from],[x2,y2]=graphNodes[to],dx=x2-x1,dy=y2-y1,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length,cx=(x1+x2)/2+nx*curve,cy=(y1+y2)/2+ny*curve,r=37,startLength=Math.hypot(cx-x1,cy-y1)||1,endLength=Math.hypot(cx-x2,cy-y2)||1,sx=x1+(cx-x1)/startLength*r,sy=y1+(cy-y1)/startLength*r,tx=x2+(cx-x2)/endLength*r,ty=y2+(cy-y2)/endLength*r,labelX=.25*sx+.5*cx+.25*tx,labelY=.25*sy+.5*cy+.25*ty;return {d:`M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`,labelX,labelY};}
  function buildUcsGraph(targetId="ucs-graph",arrowId="arrow"){
    const svg=$(targetId);svg.replaceChildren();
    const defs=svgEl("defs");
    addUcsMarker(defs,`${arrowId}-default`,"#6F879E");
    addUcsMarker(defs,`${arrowId}-traversed`,"#003366");
    addUcsMarker(defs,`${arrowId}-active`,"#950040");
    svg.append(defs);
    const edgeLayer=svgEl("g",{class:"ucs-edge-layer"});
    graphEdges.forEach(([from,to,weight])=>{
      const key=`${from}-${to}`,geometry=ucsEdgeGeometry(from,to,ucsEdgeCurves[key]||0);
      const path=svgEl("path",{d:geometry.d,class:"edge","data-from":from,"data-to":to,"marker-end":`url(#${arrowId}-default)`});
      edgeLayer.append(path);
      const label=svgEl("g",{class:"edge-label","data-from":from,"data-to":to,transform:`translate(${geometry.labelX} ${geometry.labelY})`});
      const labelWidth=String(weight).length>1?48:38;
      label.append(svgEl("rect",{x:-labelWidth/2,y:-18,width:labelWidth,height:36,rx:10}));
      const text=svgEl("text",{x:0,y:1});text.textContent=weight;label.append(text);edgeLayer.append(label);
    });
    svg.append(edgeLayer);
    const nodeLayer=svgEl("g",{class:"ucs-node-layer"});
    Object.entries(graphNodes).forEach(([name,[x,y]])=>{
      const g=svgEl("g",{class:"ucs-node","data-node":name});
      g.append(svgEl("circle",{cx:x,cy:y,r:31,class:"node"}));
      const text=svgEl("text",{x,y,class:"ucs-node-label"});text.textContent=name;g.append(text);nodeLayer.append(g);
    });
    svg.append(nodeLayer);
  }
  let ucsStep=0;
  function renderUcs(){
    const [popped,frontier]=ucsSteps[ucsStep],frontierNames=new Set(frontier.map(([name])=>name)),expandedNames=new Set(ucsSteps.slice(1,ucsStep).map(([name])=>name));
    $("ucs-frontier").replaceChildren(...frontier.map(([name,cost])=>{const n=document.createElement("div");n.className="frontier-item";n.textContent=`${name} · ${cost}`;return n;}));
    document.querySelectorAll("#ucs-steps-table tr").forEach(row=>row.classList.toggle("active",Number(row.dataset.ucsStep)===ucsStep));
    document.querySelectorAll("#ucs-graph .ucs-node").forEach(node=>{const name=node.dataset.node;node.classList.toggle("active",name===popped);node.classList.toggle("frontier",frontierNames.has(name));node.classList.toggle("expanded",expandedNames.has(name)&&name!==popped);});
    document.querySelectorAll("#ucs-graph .edge").forEach(edge=>{const active=edge.dataset.from===popped,traversed=expandedNames.has(edge.dataset.from);edge.classList.toggle("done",active);edge.classList.toggle("traversed",!active&&traversed);edge.setAttribute("marker-end",`url(#arrow-${active?"active":traversed?"traversed":"default"})`);});
    document.querySelectorAll("#ucs-graph .edge-label").forEach(label=>{const active=label.dataset.from===popped,traversed=expandedNames.has(label.dataset.from);label.classList.toggle("active",active);label.classList.toggle("traversed",!active&&traversed);});
    $("ucs-status").textContent=ucsStep===0?"初始边界只有 START。":ucsStep===12?"GOAL 从优先队列中取出：返回总代价 23 的解。":`弹出 ${popped}；边界按累计代价升序排列。`;
  }
  $("ucs-next").addEventListener("click",()=>{ucsStep=Math.min(12,ucsStep+1);renderUcs();});$("ucs-reset").addEventListener("click",()=>{ucsStep=0;renderUcs();});buildUcsIntroGraph();buildUcsGraph();renderUcs();

  // P15 · proof
  const proof={premise:"前提：所有动作代价非负。",reason:"推理：UCS 始终先扩展累计路径代价最小的节点。",conclusion:"结论：目标第一次从优先队列中取出时，其路径代价已经最小。"};
  ["premise","reason","conclusion"].forEach(key=>$("ucs-proof-"+key).addEventListener("click",()=>{$("ucs-proof-status").textContent=proof[key];setActive([$("ucs-proof-premise"),$("ucs-proof-reason"),$("ucs-proof-conclusion")],$("ucs-proof-"+key));}));$("ucs-proof-premise").click();

  // P16 · framework SVG and navigation
  function buildFramework(){
    const svg=$("search-framework");
    const columns=[
      {x:130,title:"定义",items:[["状态空间"],["初始/目标状态"],["动作（集）与","转移模型"],["路径代价"]]},
      {x:390,title:"搜索类型",items:[["盲目搜索","（无信息搜索）"],["只用深度和","路径代价"],["启发式搜索","（有信息搜索）"],["树搜索 / 图搜索","→ 已达、边界"]]},
      {x:650,title:"评估函数",items:[["完备性"],["代价最优性"],["时间复杂度"],["空间复杂度"]]}
    ];
    const addText=(parent,x,y,lines,className="",size=28)=>{const text=svgEl("text",{x,y,"font-size":size,class:className});lines.forEach((line,index)=>{const span=svgEl("tspan",{x,dy:index===0?(lines.length===1?0:-13):26});span.textContent=line;text.append(span);});parent.append(text);};
    columns.forEach(({x,title,items},col)=>{
      svg.append(svgEl("rect",{x:x-115,y:38,width:230,height:530,rx:22,fill:"#FFFFFF",stroke:"#003366","stroke-width":5}));
      svg.append(svgEl("rect",{x:x-115,y:38,width:230,height:82,rx:22,fill:"#950040"}));
      addText(svg,x,85,[title],"framework-heading",34);
      items.forEach((lines,i)=>{const y=175+i*92;const attrs=col===1&&i===0?{class:"framework-branch",role:"button",tabindex:"0","data-framework":"uninformed"}:{class:"framework-item"};const g=svgEl("g",attrs);g.append(svgEl("rect",{x:x-100,y:y-40,width:200,height:74,rx:12,fill:col===1&&i===0?"#F1F3F5":"#FFFFFF",stroke:"#003366","stroke-width":3}));addText(g,x,y,lines,"",lines.length>1?23:27);svg.append(g);});
    });
    const branch=svg.querySelector('[data-framework="uninformed"]');
    const toggle=()=>{$("framework-algorithms").hidden=!$("framework-algorithms").hidden;branch.classList.toggle('active',!$("framework-algorithms").hidden);};
    branch.addEventListener('click',toggle);
    branch.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});
  }
  buildFramework();
  document.querySelectorAll("[data-target-slide]").forEach(button=>button.addEventListener("click",()=>showSlide(Number(button.dataset.targetSlide)-1)));

  // P17 · transform the fixed source into a real, one-question-at-a-time quiz.
  const quizSpec={
    1:{type:"one",options:["A","B","C","D"],answer:["B"],why:"B。先入队的节点先被取出扩展。"},
    2:{type:"many",options:["A","B","C","D"],answer:["A","B"],why:"A、B。DFS 使用栈（LIFO），或用递归实现。"},
    3:{type:"one",options:["对","错"],answer:["对"],why:"对。单位代价下，最浅解也是最小代价解。"},
    4:{type:"one",options:["对","错"],answer:["对"],why:"对。无限深路径可能使 DFS 永远无法回溯。"},
    5:{type:"one",options:["对","错"],answer:["对"],why:"对。DLS 只能找到深度 ≤ ℓ 的解；更深的解会导致 DLS 失败。"},
    6:{type:"one",options:["对","错"],answer:["对"],why:"对。解存在且深度已知上限时，IDS 一定找到最浅解。"},
    7:{type:"one",options:["A","B","C","D"],answer:["A"],why:"A。时间复杂度 O(bᵈ)，空间复杂度 O(bd)。"},
    8:{type:"compound",groups:[{label:"UCS 始终取出的节点",options:["A","B","C","D"],answer:"B"},{label:"动作代价都相同时，UCS 等价于 BFS",options:["对","错"],answer:"对"}],why:"UCS 取累计路径代价最小节点；动作代价相同时等价于 BFS。"},
    9:{type:"one",options:["对","错"],answer:["错"],why:"错。UCS 的代价最优性要求动作代价非负。"},
    10:{type:"one",options:["对","错"],answer:["对"],why:"对。必须等目标节点被从边界（优先队列）中取出。"},
    11:{type:"one",options:["5 步","6 步","7 步","8 步"],answer:["6 步"],why:"最短解为 6 步；可以展开题目中的示例路径并播放。"},
    12:{type:"compound",groups:[{label:"生成状态更多的算法",options:["A","B","C","D"],answer:"A"},{label:"IDS 的状态数 = 1,864,131",options:["对","错"],answer:"对"}],why:"IDS = 1,864,131；BFS = 5,592,401，BFS 更多。"}
  };
  const quizState={};
  let quizCurrent=1;
  function norm(s){return String(s).toLowerCase().replace(/[，,\s（）()]/g,"").replace(/≤/g,"<=").replace(/ℓ/g,"l").replace(/\^/g,"").replace(/[⁰₀]/g,"0").replace(/[¹₁]/g,"1").replace(/[²₂]/g,"2").replace(/[³₃]/g,"3").replace(/[⁴₄]/g,"4").replace(/[⁵₅]/g,"5").replace(/[⁶₆]/g,"6").replace(/[⁷₇]/g,"7").replace(/[⁸₈]/g,"8").replace(/[⁹₉]/g,"9").replace(/ᵈ/g,"d");}
  function updateQuizSummary(){
    const done=Object.keys(quizState).length,correct=Object.values(quizState).filter(Boolean).length,wrong=done-correct;
    $("lesson4-quiz-progress").textContent=`已完成 ${done} / 12 题 · 答对 ${correct} 题 · 需要复习 ${wrong} 题`;
    $("lesson4-quiz-summary").textContent=done===12?`最终得分：${correct} / 12。点击上方题号可以返回检查。`:`当前记录：${correct} 题正确，${wrong} 题需要复习。`;
    const strip=$("lesson4-quiz-status-strip");strip.replaceChildren();
    for(let n=1;n<=12;n++){
      const button=document.createElement("button"),answered=Object.prototype.hasOwnProperty.call(quizState,n),correctAnswer=quizState[n]===true;
      button.type="button";button.className=`quiz-status-item${quizCurrent===n?" current":""}${answered?(correctAnswer?" correct":" wrong"):" unanswered"}`;
      button.textContent=`${n} ${answered?(correctAnswer?"✓":"×"):"○"}`;
      button.setAttribute("aria-label",`第 ${n} 题：${answered?(correctAnswer?"正确":"错误或需要复习"):"未答"}`);
      button.addEventListener("click",()=>{quizCurrent=n;renderQuizPage();});strip.append(button);
    }
  }
  function renderQuizPage(){
    document.querySelectorAll("#lesson4-quiz details").forEach(details=>{const active=Number(details.dataset.quiz)===quizCurrent;details.hidden=!active;details.open=active;});
    $("lesson4-quiz-prev").disabled=quizCurrent===1;$("lesson4-quiz-next").disabled=quizCurrent===12;
    updateQuizSummary();
  }
  function initQuiz(){
    document.querySelectorAll("#lesson4-quiz details").forEach(details=>{
      const n=Number(details.dataset.quiz),spec=quizSpec[n],summary=details.querySelector("summary");
      summary.addEventListener("click",event=>event.preventDefault());
      const mark=document.createElement("span");mark.className="mark";mark.setAttribute("aria-label","作答状态");summary.append(mark);
      [...details.children].filter(el=>el!==summary).forEach(el=>{if(el.id!=="quiz-jug-autoplay"&&el.id!=="quiz-jug-demo"){el.hidden=true;el.classList.add("source-answer");}});
      const answers=document.createElement("div");answers.className="answers";
      const addChoiceGroup=(options,type,label="")=>{const group=document.createElement("fieldset");group.className="answer-group";if(label){const legend=document.createElement("legend");legend.textContent=label;group.append(legend);}options.forEach(option=>{const b=document.createElement("button");b.type="button";b.textContent=option;b.dataset.value=option;b.addEventListener("click",()=>{if(type!=="many")group.querySelectorAll("button[data-value]").forEach(x=>x.classList.remove("selected"));b.classList.toggle("selected");});group.append(b);});answers.append(group);};
      if(spec.type==="one"||spec.type==="many")addChoiceGroup(spec.options,spec.type);else if(spec.type==="compound")spec.groups.forEach(group=>addChoiceGroup(group.options,"one",group.label));
      const check=document.createElement("button");check.type="button";check.textContent="核对答案";
      const feedback=document.createElement("p");feedback.className="feedback";feedback.setAttribute("role","status");
      check.addEventListener("click",()=>{
        let ok=false;
        if(spec.type==="one"||spec.type==="many"){const values=[...answers.querySelectorAll("button.selected")].map(b=>b.dataset.value);ok=values.length===spec.answer.length&&spec.answer.every((a,i)=>norm(values[i])===norm(a));}
        else{const groups=[...answers.querySelectorAll(".answer-group")];ok=groups.length===spec.groups.length&&groups.every((group,i)=>norm(group.querySelector('button.selected')?.dataset.value||'')===norm(spec.groups[i].answer));}
        quizState[n]=ok;details.classList.toggle("correct",ok);details.classList.toggle("wrong",!ok);mark.textContent=ok?"✓":"✗";feedback.textContent=`${ok?"回答正确。":"回答不正确。"} ${spec.why}`;details.querySelectorAll(":scope > .source-answer").forEach(el=>el.hidden=false);updateQuizSummary();
      });
      answers.append(check,feedback);summary.after(answers);
    });
    $("lesson4-quiz-prev").addEventListener("click",()=>{quizCurrent=Math.max(1,quizCurrent-1);renderQuizPage();});
    $("lesson4-quiz-next").addEventListener("click",()=>{quizCurrent=Math.min(12,quizCurrent+1);renderQuizPage();});
    renderQuizPage();
  }
  let jugSolutionTimer=null;
  $("quiz-jug-autoplay").addEventListener("click",()=>{if(jugSolutionTimer)clearInterval(jugSolutionTimer);const path=["(0,0)","满-3 → (3,0)","转3→4 → (0,3)","满-3 → (3,3)","转3→4 → (2,4)","空-4 → (2,0)","转3→4 → (0,2)"],shown=[];let i=0;$("quiz-jug-demo").textContent="";jugSolutionTimer=setInterval(()=>{shown.push(path[i]);$("quiz-jug-demo").textContent=shown.join("　→　");i++;if(i===path.length){clearInterval(jugSolutionTimer);jugSolutionTimer=null;}},650);});
  renderBfsLayer(); renderIdsTree(); initQuiz();
  showSlide(current, false);
})();
