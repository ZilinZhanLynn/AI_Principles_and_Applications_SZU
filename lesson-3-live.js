'use strict';

(() => {
  const $ = (selector, root = document) => root?.querySelector?.(selector) ?? null;
  const $$ = (selector, root = document) => root?.querySelectorAll ? [...root.querySelectorAll(selector)] : [];
  const listen = (element, event, handler, options) => {
    if (element?.addEventListener) element.addEventListener(event, handler, options);
  };
  const setText = (element, value) => {
    if (element) element.textContent = value;
  };
  const setHeight = (element, value) => {
    if (element) element.style.height = value;
  };
  const svgNS = 'http://www.w3.org/2000/svg';

  /* ---------- 全局放映控制 ---------- */
  const slides = $$('.slide');
  const previousButton = $('#prev');
  const nextButton = $('#next');
  const pageNumber = $('#page-number');
  const progressBar = $('#progress');
  let activeSlide = 0;

  const pageLabel = slide => slide?.dataset?.pageLabel || `${slide?.dataset?.slide || activeSlide + 1} / 20`;

  const updateNavigation = () => {
    slides.forEach((slide, index) => slide.classList.toggle('is-active', index === activeSlide));
    if (previousButton) previousButton.disabled = activeSlide === 0;
    if (nextButton) nextButton.disabled = activeSlide >= slides.length - 1;
    setText(pageNumber, slides.length ? pageLabel(slides[activeSlide]) : '0 / 0');
    if (progressBar) progressBar.style.width = slides.length ? `${((activeSlide + 1) / slides.length) * 100}%` : '0%';
  };

  const showSlide = index => {
    if (!slides.length) return;
    activeSlide = Math.max(0, Math.min(index, slides.length - 1));
    updateNavigation();
    slides[activeSlide]?.scrollIntoView?.({behavior: 'auto', block: 'start'});
  };

  listen(previousButton, 'click', () => showSlide(activeSlide - 1));
  listen(nextButton, 'click', () => showSlide(activeSlide + 1));
  listen(document, 'keydown', event => {
    const focused = document.activeElement;
    const tagName = focused?.tagName ?? '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName) || focused?.isContentEditable) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key)) {
      event.preventDefault();
      showSlide(activeSlide + 1);
    }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      showSlide(activeSlide - 1);
    }
  });

  if (slides.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = slides.indexOf(visible.target);
      if (index < 0) return;
      activeSlide = index;
      updateNavigation();
    }, {threshold: [.55, .72]});
    slides.forEach(slide => observer.observe(slide));
  }

  const fullscreenButton = $('#fullscreen');
  const updateFullscreenLabel = () => setText(fullscreenButton, document.fullscreenElement ? '退出全屏' : '全屏');
  listen(fullscreenButton, 'click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
      else await document.documentElement.requestFullscreen?.();
    } catch (_error) {
      setText(fullscreenButton, '全屏不可用');
      return;
    }
    updateFullscreenLabel();
  });
  listen(document, 'fullscreenchange', updateFullscreenLabel);

  /* ---------- 第 1 页：四个搜索案例 ---------- */
  const caseDescriptions = {
    nav: '导航：“状态＝位置；动作＝左转 / 直行；目标＝北站”',
    maze: '迷宫：“状态＝格子；动作＝走一格；目标＝出口”',
    cube: '魔方：“状态＝六面颜色；动作＝拧一下；目标＝六面同色”',
    huarong: '华容道：“状态＝摆法；动作＝滑一步；目标＝曹操出来”'
  };
  const caseNote = $('#case-note');
  const caseButtons = $$('[data-case]');
  caseButtons.forEach(button => listen(button, 'click', () => {
    caseButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    setText(caseNote, caseDescriptions[button.dataset.case] ?? '');
  }));

  /* ---------- 第 3 页：补充材料 ---------- */
  $$('[data-reveal]').forEach(button => listen(button, 'click', () => {
    const panelId = button.dataset.reveal;
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;
    panel.hidden = !panel.hidden;
    button.setAttribute('aria-expanded', String(!panel.hidden));
    button.closest('.slide')?.classList.toggle('reveal-open', !panel.hidden);
    button.textContent = panel.hidden
      ? (button.dataset.openLabel || '展开看看')
      : (button.dataset.closeLabel || '收起');
  }));

  /* ---------- 罗马尼亚地图公共数据 ---------- */
  const cities = {
    Oradea: [121, 30], Neamt: [683, 95], Zerind: [75, 105], Iasi: [821, 153],
    Arad: [40, 181], Sibiu: [277, 246], Fagaras: [480, 261], Vaslui: [894, 270],
    'Rimnicu Vilcea': [329, 336], Timisoara: [45, 336], Lugoj: [190, 396],
    Pitesti: [509, 418], Hirsova: [943, 450], Urziceni: [787, 450], Mehadia: [196, 470],
    Bucharest: [671, 493], Drobeta: [190, 546], Eforie: [1000, 557],
    Craiova: [369, 568], Giurgiu: [618, 600]
  };
  const roads = [
    ['Arad', 'Zerind', 75], ['Arad', 'Sibiu', 140], ['Arad', 'Timisoara', 118],
    ['Zerind', 'Oradea', 71], ['Oradea', 'Sibiu', 151], ['Timisoara', 'Lugoj', 111],
    ['Lugoj', 'Mehadia', 70], ['Mehadia', 'Drobeta', 75], ['Drobeta', 'Craiova', 120],
    ['Craiova', 'Rimnicu Vilcea', 146], ['Craiova', 'Pitesti', 138],
    ['Sibiu', 'Rimnicu Vilcea', 80], ['Sibiu', 'Fagaras', 99],
    ['Rimnicu Vilcea', 'Pitesti', 97], ['Fagaras', 'Bucharest', 211],
    ['Pitesti', 'Bucharest', 101], ['Bucharest', 'Giurgiu', 90],
    ['Bucharest', 'Urziceni', 85], ['Urziceni', 'Hirsova', 98],
    ['Hirsova', 'Eforie', 86], ['Urziceni', 'Vaslui', 142],
    ['Vaslui', 'Iasi', 92], ['Iasi', 'Neamt', 87]
  ];
  const roadKey = (a, b) => [a, b].sort().join('|');

  const createMapNode = (name, x, y, className = 'city') => {
    const group = document.createElementNS(svgNS, 'g');
    group.classList.add(className);
    group.dataset.city = name;
    group.setAttribute('transform', `translate(${x} ${y})`);

    const hit = document.createElementNS(svgNS, 'rect');
    hit.classList.add('hit');
    hit.setAttribute('x', '-24');
    hit.setAttribute('y', '-24');
    hit.setAttribute('width', '48');
    hit.setAttribute('height', '48');
    hit.setAttribute('fill', 'transparent');
    hit.setAttribute('stroke', 'none');

    const node = document.createElementNS(svgNS, 'rect');
    node.classList.add('node');
    const size = name === 'Bucharest' ? 24 : 18;
    node.setAttribute('x', String(-size / 2));
    node.setAttribute('y', String(-size / 2));
    node.setAttribute('width', String(size));
    node.setAttribute('height', String(size));

    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('y', '-17');
    label.textContent = name;
    group.append(hit, node, label);
    return group;
  };

  const drawRoadMap = (svg, nodeClass = 'city') => {
    if (!svg) return;
    svg.replaceChildren();
    roads.forEach(([a, b, distance]) => {
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', String(cities[a][0]));
      line.setAttribute('y1', String(cities[a][1]));
      line.setAttribute('x2', String(cities[b][0]));
      line.setAttribute('y2', String(cities[b][1]));
      line.dataset.edge = roadKey(a, b);
      svg.append(line);

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', String((cities[a][0] + cities[b][0]) / 2));
      label.setAttribute('y', String((cities[a][1] + cities[b][1]) / 2 - 7));
      label.textContent = String(distance);
      svg.append(label);
    });
    Object.entries(cities).forEach(([name, [x, y]]) => svg.append(createMapNode(name, x, y, nodeClass)));
  };

  const paintRoadMapState = (svg, {
    expandedNodes = [], frontierNodes = [], rejectedNodes = [], expandedEdges = []
  } = {}) => {
    if (!svg) return;
    const expandedNodeSet = new Set(expandedNodes);
    const frontierNodeSet = new Set(frontierNodes);
    const rejectedNodeSet = new Set(rejectedNodes);
    const expandedEdgeSet = new Set(expandedEdges.map(edge => Array.isArray(edge) ? roadKey(edge[0], edge[1]) : edge));

    $$('line[data-edge]', svg).forEach(line => {
      const expanded = expandedEdgeSet.has(line.dataset.edge);
      line.classList.toggle('expanded-edge', expanded);
      line.style.stroke = expanded ? '#FF0000' : '#212834';
      line.style.strokeWidth = expanded ? '8' : '2';
      line.style.opacity = expanded ? '1' : '.45';
      const distanceLabel = line.nextElementSibling;
      if (distanceLabel?.tagName?.toLowerCase() === 'text') {
        distanceLabel.style.fill = expanded ? '#FF0000' : '#212834';
        distanceLabel.style.fontWeight = expanded ? '900' : '600';
        distanceLabel.style.opacity = expanded ? '1' : '.7';
      }
    });

    $$('g[data-city]', svg).forEach(group => {
      const name = group.dataset.city || '';
      const expanded = expandedNodeSet.has(name);
      const frontier = frontierNodeSet.has(name);
      const rejected = rejectedNodeSet.has(name);
      group.classList.toggle('expanded', expanded);
      group.classList.toggle('frontier', frontier);
      group.classList.toggle('rejected', rejected);
      group.classList.toggle('walked', expanded || frontier || rejected);
      const node = $('.node', group);
      const label = $('text', group);
      if (node) {
        node.style.fill = expanded ? '#FF0000' : '#F1F3F5';
        node.style.stroke = expanded ? '#FF0000' : rejected ? '#212834' : frontier ? '#00AD00' : '#212834';
        node.style.strokeWidth = expanded || frontier || rejected ? '6' : '2';
      }
      if (label) {
        label.style.fill = expanded ? '#FF0000' : frontier ? '#00AD00' : '#212834';
        label.style.fontWeight = expanded || frontier || rejected ? '900' : '600';
        label.style.opacity = expanded || frontier || rejected ? '1' : '.68';
      }
    });
  };

  /* ---------- 第 6—8 页：三个案例的六要素逐条核对 ---------- */
  $$('[data-romania-answer], [data-case-answer]').forEach(button => {
    const article = button.closest('article');
    const answer = article?.querySelector('span');
    if (!answer) return;
    button.setAttribute('aria-expanded', String(!answer.hidden));
    listen(button, 'click', () => {
      answer.hidden = !answer.hidden;
      article?.classList.toggle('checked', !answer.hidden);
      button.setAttribute('aria-expanded', String(!answer.hidden));
      button.textContent = answer.hidden ? '核对答案' : '✓ 已核对';
    });
  });

  /* ---------- 第 6 页：在教材地图上自己从 Arad 走到 Bucharest ---------- */
  const romaniaMap = $('#romania-map');
  const romaniaCurrent = $('#romania-current');
  const romaniaDistance = $('#romania-distance');
  const romaniaPath = $('#romania-path');
  const romaniaNextCities = $('#romania-next-cities');
  const romaniaReset = $('#romania-reset');
  const romaniaRouteFeedback = $('#romania-route-feedback');
  let romaniaRoute = ['Arad'];
  let romaniaMiles = 0;

  const roadFromTo = (from, to) => roads.find(([a, b]) =>
    (a === from && b === to) || (a === to && b === from));

  const neighbouringCities = city => roads.flatMap(([a, b, distance]) => {
    if (a === city) return [{city: b, distance}];
    if (b === city) return [{city: a, distance}];
    return [];
  });

  const chooseRomaniaCity = destination => {
    const current = romaniaRoute.at(-1);
    if (!current || current === 'Bucharest') return;
    const road = roadFromTo(current, destination);
    if (!road) {
      setText(romaniaRouteFeedback, `${destination} 与 ${current} 不直接相连，请从绿色标出的相邻城市中选择。`);
      romaniaRouteFeedback?.classList.add('wrong');
      return;
    }
    romaniaRoute.push(destination);
    romaniaMiles += road[2];
    renderRomaniaRoute();
  };

  const renderRomaniaRoute = () => {
    const current = romaniaRoute.at(-1) || 'Arad';
    const choices = current === 'Bucharest' ? [] : neighbouringCities(current);
    const choiceNames = new Set(choices.map(choice => choice.city));
    const walkedEdges = new Set(romaniaRoute.slice(1).map((city, index) => roadKey(romaniaRoute[index], city)));

    setText(romaniaCurrent, current);
    setText(romaniaDistance, String(romaniaMiles));
    setText(romaniaPath, romaniaRoute.join(' → '));
    if (romaniaReset) romaniaReset.disabled = romaniaRoute.length === 1;

    if (romaniaNextCities) {
      romaniaNextCities.replaceChildren();
      choices.forEach(({city, distance}) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.romaniaNext = city;
        button.textContent = `${city}（${distance} 英里）`;
        listen(button, 'click', () => chooseRomaniaCity(city));
        romaniaNextCities.append(button);
      });
    }

    $$('line[data-edge]', romaniaMap).forEach(line => {
      line.classList.toggle('walked', walkedEdges.has(line.dataset.edge));
    });
    $$('.city', romaniaMap).forEach(group => {
      const name = group.dataset.city || '';
      const available = choiceNames.has(name);
      group.classList.toggle('current', name === current);
      group.classList.toggle('goal', name === 'Bucharest');
      group.classList.toggle('available', available);
      group.classList.toggle('visited', romaniaRoute.includes(name));
      group.setAttribute('role', 'button');
      group.setAttribute('tabindex', available ? '0' : '-1');
      group.setAttribute('aria-disabled', String(!available));
      group.setAttribute('aria-label', available
        ? `前往 ${name}，距离 ${roadFromTo(current, name)?.[2] ?? ''} 英里`
        : name);
    });

    if (current === 'Bucharest') {
      setText(romaniaRouteFeedback, `✓ 到了！已到达 Bucharest：共走 ${romaniaRoute.length - 1} 步，累计 ${romaniaMiles} 英里。`);
      romaniaRouteFeedback?.classList.add('correct');
      romaniaRouteFeedback?.classList.remove('wrong');
    } else {
      setText(romaniaRouteFeedback, `从 ${current} 可以前往：${choices.map(choice => choice.city).join('、')}。`);
      romaniaRouteFeedback?.classList.remove('correct', 'wrong');
    }
  };

  if (romaniaMap) {
    drawRoadMap(romaniaMap);
    $$('.city', romaniaMap).forEach(group => {
      listen(group, 'click', () => chooseRomaniaCity(group.dataset.city || ''));
      listen(group, 'keydown', event => {
        if (!['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        chooseRomaniaCity(group.dataset.city || '');
      });
    });
    renderRomaniaRoute();
  }
  listen(romaniaReset, 'click', () => {
    romaniaRoute = ['Arad'];
    romaniaMiles = 0;
    renderRomaniaRoute();
  });

  /* ---------- 第 7 页：可操作八数码与两题自测 ---------- */
  const puzzleInitial = [7, 2, 4, 5, 0, 6, 8, 3, 1];
  const puzzleGoal = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const puzzleBoard = $('#puzzle-play-board');
  const puzzleReset = $('#puzzle-reset');
  const puzzlePlayFeedback = $('#puzzle-play-feedback');
  const puzzleStepCount = $('#puzzle-step-count');
  const puzzleMoveHistory = $('#puzzle-move-history');
  let puzzleState = [...puzzleInitial];
  let puzzleMoves = [];

  const puzzleStateLabel = state => state.map(value => value || '_').join(' ');
  const puzzleSolved = () => puzzleState.every((value, index) => value === puzzleGoal[index]);

  const renderPuzzlePlay = () => {
    if (puzzleBoard) {
      puzzleBoard.replaceChildren();
      puzzleState.forEach((value, index) => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.dataset.puzzleIndex = String(index);
        tile.setAttribute('role', 'gridcell');
        if (value === 0) {
          tile.className = 'blank';
          tile.disabled = true;
          tile.setAttribute('aria-label', '空格');
          tile.textContent = '□';
        } else {
          tile.textContent = String(value);
          tile.setAttribute('aria-label', `数字 ${value}`);
          listen(tile, 'click', () => movePuzzleTile(index));
        }
        puzzleBoard.append(tile);
      });
    }

    setText(puzzleStepCount, `已走 ${puzzleMoves.length} 步`);
    if (puzzleReset) puzzleReset.disabled = puzzleMoves.length === 0;
    if (puzzleMoveHistory) {
      puzzleMoveHistory.replaceChildren();
      if (!puzzleMoves.length) {
        const item = document.createElement('li');
        item.textContent = '尚未移动。';
        puzzleMoveHistory.append(item);
      } else {
        puzzleMoves.forEach((move, index) => {
          const item = document.createElement('li');
          item.textContent = `${index + 1}. 空格 ${move.direction}（数字 ${move.tile} 滑入空格）→ ${move.state}`;
          puzzleMoveHistory.append(item);
        });
      }
    }
  };

  const movePuzzleTile = index => {
    const blank = puzzleState.indexOf(0);
    const blankRow = Math.floor(blank / 3);
    const blankColumn = blank % 3;
    const tileRow = Math.floor(index / 3);
    const tileColumn = index % 3;
    const adjacent = Math.abs(blankRow - tileRow) + Math.abs(blankColumn - tileColumn) === 1;
    if (!adjacent) {
      setText(puzzlePlayFeedback, `数字 ${puzzleState[index]} 不与空格相邻，这一步不能走。`);
      puzzlePlayFeedback?.classList.add('wrong');
      puzzlePlayFeedback?.classList.remove('correct');
      return;
    }

    const direction = tileRow === blankRow
      ? (tileColumn < blankColumn ? 'Left' : 'Right')
      : (tileRow < blankRow ? 'Up' : 'Down');
    const tile = puzzleState[index];
    [puzzleState[blank], puzzleState[index]] = [puzzleState[index], puzzleState[blank]];
    puzzleMoves.push({direction, tile, state: puzzleStateLabel(puzzleState)});
    if (puzzleSolved()) {
      setText(puzzlePlayFeedback, `✓ 已到达目标状态，共走 ${puzzleMoves.length} 步。`);
      puzzlePlayFeedback?.classList.add('correct');
      puzzlePlayFeedback?.classList.remove('wrong');
    } else {
      setText(puzzlePlayFeedback, `合法动作：空格 ${direction}。继续选择与空格相邻的数字块。`);
      puzzlePlayFeedback?.classList.remove('correct', 'wrong');
    }
    renderPuzzlePlay();
  };

  listen(puzzleReset, 'click', () => {
    puzzleState = [...puzzleInitial];
    puzzleMoves = [];
    setText(puzzlePlayFeedback, '已恢复初始状态。请选择与空格相邻的数字块。');
    puzzlePlayFeedback?.classList.remove('correct', 'wrong');
    renderPuzzlePlay();
  });
  renderPuzzlePlay();

  const puzzleChoices = $$('[data-puzzle-choice]');
  const puzzleFeedback = $('#puzzle-quiz-feedback');
  let puzzleChoice = '';

  const selectPuzzleChoice = button => {
    puzzleChoice = button?.dataset.puzzleChoice ?? '';
    puzzleChoices.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    const correct = puzzleChoice === 'B';
    setText(puzzleFeedback, correct
      ? '✓ 正确：把动作定义为空格的移动。'
      : '再想想：动作应定义为空格的移动。');
    puzzleFeedback?.classList.toggle('correct', correct);
    puzzleFeedback?.classList.toggle('wrong', !correct);
  };
  puzzleChoices.forEach(button => listen(button, 'click', () => selectPuzzleChoice(button)));
  if (puzzleFeedback) puzzleFeedback.textContent = '请选择一个答案。';

  /* ---------- 第 8、9 页：水罐与后继共用状态 ---------- */
  const jugActionNames = {
    fill3: '装满 3L', empty3: '倒空 3L', fill4: '装满 4L',
    empty4: '倒空 4L', pour34: '3L → 4L', pour43: '4L → 3L'
  };
  let jugState = [0, 0];
  let jugHistory = [];
  let successorsVisible = false;

  const jugMoves = (state = jugState) => {
    const [amount3, amount4] = state;
    const transfer34 = Math.min(amount3, 4 - amount4);
    const transfer43 = Math.min(amount4, 3 - amount3);
    return [
      {id: 'fill3', state: [3, amount4], valid: amount3 < 3},
      {id: 'empty3', state: [0, amount4], valid: amount3 > 0},
      {id: 'fill4', state: [amount3, 4], valid: amount4 < 4},
      {id: 'empty4', state: [amount3, 0], valid: amount4 > 0},
      {id: 'pour34', state: [amount3 - transfer34, amount4 + transfer34], valid: transfer34 > 0},
      {id: 'pour43', state: [amount3 + transfer43, amount4 - transfer43], valid: transfer43 > 0}
    ].filter(move => move.valid);
  };

  const stateLabel = state => `(${state[0]},${state[1]})`;
  const jugLog = $('#jug-log');
  const jugPanel = jugLog?.closest('.lab-panel') ?? null;

  const renderSuccessors = () => {
    const list = $('#successor-list');
    if (!list) return;
    list.replaceChildren();
    const moves = jugMoves();
    if (!moves.length) {
      const empty = document.createElement('p');
      empty.textContent = '当前没有会得到新状态的动作。';
      list.append(empty);
      return;
    }
    moves.forEach(move => {
      const button = document.createElement('button');
      button.type = 'button';
      const name = document.createElement('b');
      name.textContent = jugActionNames[move.id];
      const result = document.createElement('span');
      result.textContent = ` → 新状态 ${stateLabel(move.state)}`;
      button.append(name, result);
      listen(button, 'click', () => performJugAction(move.id));
      list.append(button);
    });
  };

  const renderJug = () => {
    const [amount3, amount4] = jugState;
    setText($('#amount3'), `${amount3}L`);
    setText($('#amount4'), `${amount4}L`);
    setHeight($('#water3'), `${(amount3 / 3) * 100}%`);
    setHeight($('#water4'), `${(amount4 / 4) * 100}%`);
    setText($('#jug-count'), `已走 ${jugHistory.length} 步`);

    setText($('#successor-state'), stateLabel(jugState));
    setText($('#successor-amount3'), `${amount3}L / 3L`);
    setText($('#successor-amount4'), `${amount4}L / 4L`);
    setHeight($('#successor-water3'), `${(amount3 / 3) * 100}%`);
    setHeight($('#successor-water4'), `${(amount4 / 4) * 100}%`);

    const validIds = new Set(jugMoves().map(move => move.id));
    $$('[data-jug]').forEach(button => {
      const action = button.dataset.jug;
      if (action === 'reset') {
        button.disabled = jugHistory.length === 0 && amount3 === 0 && amount4 === 0;
        return;
      }
      button.disabled = !validIds.has(action);
      button.setAttribute('aria-disabled', String(button.disabled));
    });

    const history = $('#jug-history');
    if (history) {
      history.replaceChildren();
      if (!jugHistory.length) {
        const item = document.createElement('li');
        item.textContent = '尚未执行动作。';
        history.append(item);
      } else {
        jugHistory.forEach((step, index) => {
          const item = document.createElement('li');
          const action = document.createElement('b');
          action.textContent = `${index + 1}. ${step.name}`;
          const transition = document.createElement('span');
          transition.textContent = `${step.before} → ${step.after}`;
          item.append(action, transition);
          history.append(item);
        });
      }
    }

    const reachedGoal = amount3 === 0 && amount4 === 2;
    jugPanel?.classList.toggle('goal-reached', reachedGoal);
    jugLog?.classList.toggle('correct', reachedGoal);
    if (jugLog) jugLog.dataset.status = reachedGoal ? 'goal' : 'active';
    if (successorsVisible) renderSuccessors();
  };

  function performJugAction(actionId) {
    if (actionId === 'reset') {
      jugState = [0, 0];
      jugHistory = [];
      setText(jugLog, '已经重置，当前状态是 (0,0)。');
      renderJug();
      return;
    }
    const move = jugMoves().find(item => item.id === actionId);
    if (!move) {
      setText(jugLog, '这个动作在当前状态下不会改变水量。');
      return;
    }
    const before = stateLabel(jugState);
    jugState = [...move.state];
    const after = stateLabel(jugState);
    jugHistory.push({id: actionId, name: jugActionNames[actionId], before, after});
    if (jugState[0] === 0 && jugState[1] === 2) {
      setText(jugLog, `✓ 到达目标状态 (0,2)！共 ${jugHistory.length} 步：${jugHistory.map(step => step.name).join(' → ')}。`);
      jugLog?.setAttribute('aria-live', 'assertive');
    } else {
      setText(jugLog, `第 ${jugHistory.length} 步：${jugActionNames[actionId]}，${before} → ${after}。`);
      jugLog?.setAttribute('aria-live', 'polite');
    }
    renderJug();
  }

  $$('[data-jug]').forEach(button => listen(button, 'click', () => performJugAction(button.dataset.jug)));
  const jugAnswerButtons = $$('[data-jug-answer]');
  const jugAnswerFeedback = $('#jug-answer-feedback');
  jugAnswerButtons.forEach(button => listen(button, 'click', () => {
    const correct = button.dataset.jugAnswer === 'B';
    jugAnswerButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.classList.toggle('correct', selected && correct);
      item.classList.toggle('wrong', selected && !correct);
      item.setAttribute('aria-pressed', String(selected));
    });
    setText(jugAnswerFeedback, correct
      ? '✓ 正确：(0,2) 表示 3 升罐为空、4 升罐里有 2 升。'
      : '再看一眼数字对的顺序：先写 3 升罐，再写 4 升罐。');
  }));

  listen($('#list-successors'), 'click', () => {
    successorsVisible = true;
    renderSuccessors();
  });
  renderJug();

  /* ---------- 第 10 页：边界中的搜索树 ---------- */
  const firstExpansionEdges = [
    ['Arad', 'Zerind'], ['Arad', 'Timisoara'], ['Arad', 'Sibiu']
  ];
  const treeContextMap = $('#tree-context-map');
  if (treeContextMap) {
    treeContextMap.setAttribute('viewBox', '0 0 1040 630');
    drawRoadMap(treeContextMap, 'tree-context-city');
    paintRoadMapState(treeContextMap, {
      expandedNodes: ['Arad'],
      frontierNodes: ['Zerind', 'Timisoara', 'Sibiu'],
      expandedEdges: firstExpansionEdges
    });
  }

  const cycleContextMap = $('#cycle-context-map');
  if (cycleContextMap) {
    cycleContextMap.setAttribute('viewBox', '0 0 1040 630');
    drawRoadMap(cycleContextMap, 'cycle-context-city');
    paintRoadMapState(cycleContextMap, {
      expandedNodes: ['Arad', 'Sibiu'],
      expandedEdges: [['Arad', 'Sibiu']]
    });
    cycleContextMap.setAttribute('aria-label', '罗马尼亚完整地图；Arad 与 Sibiu 之间的往返环路用红色突出');
  }

  const treeStages = [
    {
      nodes: [{name: 'Arad', x: 520, y: 70}], lines: [], boundary: ['Arad'], expanded: [], fresh: ['Arad'],
      note: '起点 Arad 已生成，正在边界中等待展开。',
      branch: '图中的圆表示节点，连线表示动作。展开 Arad 后会看到它的分支因子。'
    },
    {
      nodes: [{name: 'Arad', x: 520, y: 70}, {name: 'Sibiu', x: 180, y: 270}, {name: 'Timisoara', x: 520, y: 270}, {name: 'Zerind', x: 860, y: 270}],
      lines: [
        {from: [520, 102], to: [180, 238], label: '到 Sibiu', labelAt: [338, 145]},
        {from: [520, 102], to: [520, 238], label: '到 Timisoara', labelAt: [620, 178]},
        {from: [520, 102], to: [860, 238], label: '到 Zerind', labelAt: [706, 145]}
      ],
      boundary: ['Sibiu', 'Timisoara', 'Zerind'], expanded: ['Arad'], fresh: ['Sibiu', 'Timisoara', 'Zerind'],
      note: '展开 Arad，一次生成 Sibiu、Timisoara、Zerind。',
      branch: 'Arad 生成 3 个子节点，所以这里的分支因子 b = 3。'
    },
    {
      nodes: [
        {name: 'Arad', x: 520, y: 70}, {name: 'Sibiu', x: 180, y: 270},
        {name: 'Timisoara', x: 520, y: 270}, {name: 'Zerind', x: 860, y: 270},
        {name: 'Rimnicu Vilcea', x: 82, y: 540, lines: ['Rimnicu', 'Vilcea']},
        {name: 'Fagaras', x: 280, y: 540}, {name: 'Oradea', x: 478, y: 540}
      ],
      lines: [
        {from: [520, 102], to: [180, 238], label: '到 Sibiu', labelAt: [338, 145]},
        {from: [520, 102], to: [520, 238], label: '到 Timisoara', labelAt: [620, 178]},
        {from: [520, 102], to: [860, 238], label: '到 Zerind', labelAt: [706, 145]},
        {from: [180, 302], to: [82, 501], label: '到 Rimnicu', labelAt: [92, 405]},
        {from: [180, 302], to: [280, 508], label: '到 Fagaras', labelAt: [273, 395]},
        {from: [180, 302], to: [478, 508], label: '到 Oradea', labelAt: [435, 430]}
      ],
      boundary: ['Timisoara', 'Zerind', 'Rimnicu Vilcea', 'Fagaras', 'Oradea'], expanded: ['Arad', 'Sibiu'], fresh: ['Rimnicu Vilcea', 'Fagaras', 'Oradea'],
      note: '按教材顺序挑 Sibiu 展开，再生成 Rimnicu Vilcea、Fagaras、Oradea。',
      branch: '边界中现在有 5 个节点；先取哪一个，取决于搜索策略。'
    }
  ];
  let treeStep = 0;
  const treeSvg = $('#tree-svg');
  const treeNext = $('#tree-next');

  const appendTreeEdge = (edge) => {
    const line = document.createElementNS(svgNS, 'line');
    line.classList.add('expanded-edge');
    line.setAttribute('x1', String(edge.from[0]));
    line.setAttribute('y1', String(edge.from[1]));
    line.setAttribute('x2', String(edge.to[0]));
    line.setAttribute('y2', String(edge.to[1]));
    line.setAttribute('style', 'stroke:#FF0000;stroke-width:8;opacity:1');
    treeSvg.append(line);

    // Keep action labels readable without letting adjacent pills collide.
    const width = Math.max(116, edge.label.length * 16);
    const pill = document.createElementNS(svgNS, 'rect');
    pill.classList.add('edge-label-bg');
    pill.setAttribute('x', String(edge.labelAt[0] - width / 2));
    pill.setAttribute('y', String(edge.labelAt[1] - 24));
    pill.setAttribute('width', String(width));
    pill.setAttribute('height', '38');
    pill.setAttribute('rx', '10');
    pill.setAttribute('fill', '#F1F3F5');
    pill.setAttribute('stroke', '#003366');
    pill.setAttribute('stroke-width', '2');
    pill.setAttribute('style', 'fill:#F1F3F5;stroke:#FF0000;stroke-width:2');
    treeSvg.append(pill);

    const label = document.createElementNS(svgNS, 'text');
    label.classList.add('edge-label');
    label.setAttribute('x', String(edge.labelAt[0]));
    label.setAttribute('y', String(edge.labelAt[1] + 3));
    label.setAttribute('style', 'font-size:22px;fill:#FF0000;font-weight:900');
    label.textContent = edge.label;
    treeSvg.append(label);
  };

  const appendTreeNode = (node, stage) => {
    const group = document.createElementNS(svgNS, 'g');
    group.classList.add('tree-node');
    group.setAttribute('transform', `translate(${node.x} ${node.y})`);
    if (stage.expanded.includes(node.name)) group.classList.add('expanded');
    if (stage.boundary.includes(node.name)) group.classList.add('frontier');
    if (stage.fresh.includes(node.name)) group.classList.add('fresh');

    const expanded = stage.expanded.includes(node.name);
    const frontier = stage.boundary.includes(node.name);
    const fill = expanded ? '#FF0000' : frontier ? '#F1F3F5' : '#FFFFFF';
    const stroke = expanded ? '#FF0000' : frontier ? '#00AD00' : '#003366';
    const shape = document.createElementNS(svgNS, 'ellipse');
    shape.setAttribute('rx', '86');
    shape.setAttribute('ry', node.lines ? '42' : '34');
    shape.setAttribute('fill', fill);
    shape.setAttribute('stroke', stroke);
    shape.setAttribute('stroke-width', expanded ? '8' : frontier ? '7' : '5');
    shape.setAttribute('style', `fill:${fill};stroke:${stroke};stroke-width:${expanded ? 8 : frontier ? 7 : 5}`);

    const label = document.createElementNS(svgNS, 'text');
    label.setAttribute('style', `font-size:${node.lines ? 20 : 23}px;fill:${expanded ? '#FFFFFF' : frontier ? '#00AD00' : '#003366'};font-weight:900`);
    if (node.lines) {
      node.lines.forEach((part, index) => {
        const tspan = document.createElementNS(svgNS, 'tspan');
        tspan.setAttribute('x', '0');
        tspan.setAttribute('y', index === 0 ? '-5' : '23');
        tspan.textContent = part;
        label.append(tspan);
      });
    } else {
      label.setAttribute('y', '8');
      label.textContent = node.name;
    }
    group.append(shape, label);
    treeSvg.append(group);
  };

  const drawTree = () => {
    if (!treeSvg || !treeStages.length) return;
    const stage = treeStages[treeStep];
    treeSvg.replaceChildren();
    stage.lines.forEach(appendTreeEdge);
    stage.nodes.forEach(node => appendTreeNode(node, stage));
    if (treeStep === 1) {
      const label = document.createElementNS(svgNS, 'text');
      label.classList.add('branch-label');
      label.setAttribute('x', '520');
      label.setAttribute('y', '390');
      label.setAttribute('style', 'font-size:26px');
      label.textContent = 'Arad 的 3 条分支：b = 3';
      treeSvg.append(label);
    }
    const boxes = $('#frontier-boxes');
    if (boxes) {
      boxes.replaceChildren();
      stage.boundary.forEach(name => {
        const item = document.createElement('i');
        item.textContent = name;
        boxes.append(item);
      });
    }
    setText($('#tree-step-note'), stage.note);
    setText($('#branch-factor-note'), stage.branch);
    setText(treeNext, treeStep === 0 ? '第一步：展开 Arad' : treeStep === 1 ? '第二步：挑 Sibiu 展开' : '重新演示');
  };
  listen(treeNext, 'click', () => {
    treeStep = treeStep === treeStages.length - 1 ? 0 : treeStep + 1;
    drawTree();
  });
  drawTree();

  /* ---------- 第 11 页：两条路线动画 ---------- */
  const routeMap = $('#route-map');
  const routeOutput = $('#route-total');
  const routeOneButton = $('#route-one');
  const routeTwoButton = $('#route-two');
  const routeCompareButton = $('#route-compare');
  const routeChoice = $('#route-choice');
  const routeOneCard = $('#route-card-one');
  const routeTwoCard = $('#route-card-two');
  const routeOne = ['Arad', 'Sibiu', 'Fagaras', 'Bucharest'];
  const routeTwo = ['Arad', 'Sibiu', 'Rimnicu Vilcea', 'Pitesti', 'Bucharest'];
  let routeTimers = [];

  const clearRouteTimers = () => {
    routeTimers.forEach(timer => window.clearTimeout(timer));
    routeTimers = [];
  };
  const drawRouteMap = (routes = []) => {
    if (!routeMap) return;
    drawRoadMap(routeMap, 'route-city');
    routes.forEach(({path, className, upto = path.length - 1}) => {
      for (let index = 1; index <= upto; index += 1) {
        const key = roadKey(path[index - 1], path[index]);
        const line = $$('line', routeMap).find(item => item.dataset.edge === key);
        line?.classList.add(className);
      }
      path.slice(0, upto + 1).forEach(city => {
        const node = $$('.route-city', routeMap).find(item => item.dataset.city === city);
        node?.classList.add(className.replace('-line', '-city'));
      });
    });
  };
  const animateRoute = ({path, costs, className, label, baseRoutes = [], onDone}) => {
    clearRouteTimers();
    if (routeChoice) routeChoice.hidden = true;
    drawRouteMap([...baseRoutes, {path, className, upto: 0}]);
    setText(routeOutput, `${label}：准备从 ${path[0]} 出发。`);
    let total = 0;
    costs.forEach((cost, index) => {
      const timer = window.setTimeout(() => {
        total += cost;
        drawRouteMap([...baseRoutes, {path, className, upto: index + 1}]);
        setText(routeOutput, `${label}：${costs.slice(0, index + 1).join('＋')}＝${total}。`);
        if (index === costs.length - 1) onDone?.();
      }, (index + 1) * 650);
      routeTimers.push(timer);
    });
  };

  listen(routeOneButton, 'click', () => {
    if (routeOneCard) routeOneCard.hidden = true;
    if (routeTwoCard) routeTwoCard.hidden = true;
    if (routeTwoButton) routeTwoButton.disabled = true;
    if (routeCompareButton) routeCompareButton.disabled = true;
    animateRoute({
      path: routeOne, costs: [140, 99, 211], className: 'route-one-line', label: '路线一',
      onDone: () => {
        if (routeOneCard) routeOneCard.hidden = false;
        if (routeTwoButton) routeTwoButton.disabled = false;
        setText(routeOutput, '路线一走了 3 步，路径代价是 450。现在看看另一条。');
      }
    });
  });
  listen(routeTwoButton, 'click', () => {
    if (routeTwoCard) routeTwoCard.hidden = true;
    if (routeCompareButton) routeCompareButton.disabled = true;
    animateRoute({
      path: routeTwo, costs: [140, 80, 97, 101], className: 'route-two-line', label: '路线二',
      baseRoutes: [{path: routeOne, className: 'route-one-line'}],
      onDone: () => {
        if (routeTwoCard) routeTwoCard.hidden = false;
        if (routeCompareButton) routeCompareButton.disabled = false;
        setText(routeOutput, '路线二走了 4 步，路径代价是 418。现在可以比较。');
      }
    });
  });
  listen(routeCompareButton, 'click', () => {
    clearRouteTimers();
    drawRouteMap([
      {path: routeOne, className: 'route-one-line'},
      {path: routeTwo, className: 'route-two-line'}
    ]);
    if (routeChoice) routeChoice.hidden = false;
    if (routeOneCard) routeOneCard.hidden = false;
    if (routeTwoCard) routeTwoCard.hidden = false;
    setText(routeOutput, '步数：3 对 4；路径代价：450 对 418；两条路线相差 32。');
  });
  $$('[data-cheaper]').forEach(button => listen(button, 'click', () => {
    const output = $('output', routeChoice);
    const correct = button.dataset.cheaper === '418';
    setText(output, correct ? '✓ 正确。路线二多走 1 步，但路径代价少 32。' : '再计算一次：450 大于 418。');
    output?.classList.toggle('correct', correct);
    output?.classList.toggle('wrong', !correct);
  }));
  drawRouteMap();

  /* ---------- 第 12 页：灰图逐步点亮 ---------- */
  const searchSpaceMap = $('#search-space-map');
  const searchSpaceNext = $('#search-space-next');
  const searchSpaceNote = $('#search-space-note');
  const searchSpaceStages = [
    {
      expandedNodes: [], frontierNodes: [], expandedEdges: [],
      note: '灰色表示整张状态空间；红色表示已扩展，绿色表示仍在边界中。'
    },
    {
      expandedNodes: [], frontierNodes: ['Arad'], expandedEdges: [],
      note: '初始状态 Arad 先进入边界，尚未扩展。'
    },
    {
      expandedNodes: ['Arad'], frontierNodes: ['Sibiu', 'Timisoara', 'Zerind'],
      expandedEdges: firstExpansionEdges,
      note: '展开 Arad：节点和三条已展开的边变红；三个新叶节点进入绿色边界。'
    },
    {
      expandedNodes: ['Arad', 'Sibiu'],
      frontierNodes: ['Timisoara', 'Zerind', 'Rimnicu Vilcea', 'Fagaras', 'Oradea'],
      expandedEdges: [
        ...firstExpansionEdges,
        ['Sibiu', 'Rimnicu Vilcea'], ['Sibiu', 'Fagaras'], ['Sibiu', 'Oradea']
      ],
      note: '再展开 Sibiu：它与三个后继之间的边也变为加粗红色。'
    },
    {
      expandedNodes: ['Arad', 'Sibiu', 'Zerind'],
      frontierNodes: ['Timisoara', 'Rimnicu Vilcea', 'Fagaras', 'Oradea'],
      expandedEdges: [
        ...firstExpansionEdges,
        ['Sibiu', 'Rimnicu Vilcea'], ['Sibiu', 'Fagaras'], ['Sibiu', 'Oradea'],
        ['Zerind', 'Oradea']
      ],
      note: '展开 Zerind：Zerind–Oradea 这条边现在也变为加粗红色。'
    },
    {
      expandedNodes: ['Arad', 'Sibiu', 'Zerind', 'Fagaras'],
      frontierNodes: ['Timisoara', 'Rimnicu Vilcea', 'Oradea', 'Bucharest'],
      expandedEdges: [
        ...firstExpansionEdges,
        ['Sibiu', 'Rimnicu Vilcea'], ['Sibiu', 'Fagaras'], ['Sibiu', 'Oradea'],
        ['Zerind', 'Oradea'], ['Fagaras', 'Bucharest']
      ],
      note: '展开 Fagaras 后生成 Bucharest；第一条解路径进入搜索空间。'
    },
    {
      expandedNodes: ['Arad', 'Sibiu', 'Zerind', 'Fagaras', 'Rimnicu Vilcea', 'Pitesti'],
      frontierNodes: ['Timisoara', 'Oradea', 'Bucharest'],
      expandedEdges: [
        ...firstExpansionEdges,
        ['Sibiu', 'Rimnicu Vilcea'], ['Sibiu', 'Fagaras'], ['Sibiu', 'Oradea'],
        ['Zerind', 'Oradea'], ['Fagaras', 'Bucharest'],
        ['Rimnicu Vilcea', 'Pitesti'], ['Pitesti', 'Bucharest']
      ],
      note: '两条实际走过的路线都已点亮；其余灰色部分仍只属于完整状态空间。'
    }
  ];
  let searchSpaceStep = 0;

  const drawSearchSpaceMap = () => {
    if (!searchSpaceMap) return;
    const stage = searchSpaceStages[searchSpaceStep];
    drawRoadMap(searchSpaceMap, 'search-space-city');
    paintRoadMapState(searchSpaceMap, stage);
    setText(searchSpaceNote, stage.note);
    setText(searchSpaceNext, searchSpaceStep === searchSpaceStages.length - 1 ? '重新演示' : '下一步');
  };
  listen(searchSpaceNext, 'click', () => {
    searchSpaceStep = searchSpaceStep === searchSpaceStages.length - 1 ? 0 : searchSpaceStep + 1;
    drawSearchSpaceMap();
  });
  drawSearchSpaceMap();

  /* ---------- 第 13 页：TREE-SEARCH 伪代码讲解与主循环填空 ---------- */
  const pseudoSteps = [
    {
      explanation: '定义 TREE-SEARCH：输入一个问题，最后返回一条解路径；如果找不到则返回失败。',
      frontier: '边界：尚未初始化'
    },
    {
      explanation: '用问题的初始状态建立第一个节点，并把它放入边界。',
      frontier: '边界：Arad'
    },
    {
      explanation: '进入主循环；只要还没有返回解或失败，就继续检查、选择与扩展。',
      frontier: '边界：Arad'
    },
    {
      explanation: '先检查边界是否为空；空了表示没有候选节点可扩展，应当报告失败。',
      frontier: '边界：Arad（非空，继续）'
    },
    {
      explanation: '从边界选择一个叶节点，并把它移出边界；不同搜索策略的差别就在“选谁”。',
      frontier: '取出 Arad 后，边界暂时为空'
    },
    {
      explanation: '检查刚取出的节点是否包含目标状态；Arad 不是目标，因此继续扩展。',
      frontier: '当前节点：Arad；边界：空'
    },
    {
      explanation: '扩展 Arad，把后继节点加入边界；新的待扩展叶节点变成 Zerind、Timisoara、Sibiu。',
      frontier: '边界：Zerind · Timisoara · Sibiu'
    }
  ];
  const pseudoLinesRoot = $('#pseudo-lines');
  let pseudoLineElements = pseudoLinesRoot
    ? $$('[data-pseudo-index], [data-pseudo-line], [data-pseudo-step]', pseudoLinesRoot)
    : [];
  if (pseudoLinesRoot && !pseudoLineElements.length) {
    pseudoLineElements = $$(':scope > button, :scope > li, :scope > span, :scope > code', pseudoLinesRoot);
  }
  const pseudoExplanation = $('#pseudo-explanation');
  const pseudoFrontier = $('#pseudo-frontier');
  const pseudoNext = $('#pseudo-next');
  const pseudoPlay = $('#pseudo-play');
  const pseudoPause = $('#pseudo-pause');
  const pseudoReset = $('#pseudo-reset');
  let pseudoStep = 0;
  let pseudoTimer = 0;

  const pseudoTeacher = pseudoLinesRoot?.closest('.pseudocode-teacher, .pseudo-explainer');
  const pseudoReading = pseudoExplanation?.closest('.pseudo-reading, .pseudo-status');
  pseudoTeacher?.classList.add('pseudo-explainer');
  pseudoReading?.classList.add('pseudo-status');
  if (pseudoTeacher && pseudoLinesRoot && pseudoReading && !pseudoLinesRoot.closest('.pseudo-layout')) {
    const pseudoLayout = document.createElement('div');
    pseudoLayout.className = 'pseudo-layout';
    pseudoTeacher.insertBefore(pseudoLayout, pseudoLinesRoot);
    pseudoLayout.append(pseudoLinesRoot, pseudoReading);
  }

  const stopPseudoPlayback = () => {
    window.clearInterval(pseudoTimer);
    pseudoTimer = 0;
    if (pseudoPlay) pseudoPlay.disabled = false;
    if (pseudoPause) pseudoPause.disabled = true;
  };

  const renderPseudoStep = () => {
    pseudoStep = Math.max(0, Math.min(pseudoStep, pseudoSteps.length - 1));
    pseudoLineElements.forEach((line, index) => {
      const current = index === pseudoStep;
      line.classList.toggle('is-current', current);
      line.classList.toggle('active', current);
      line.setAttribute('aria-current', current ? 'step' : 'false');
    });
    setText(pseudoExplanation, pseudoSteps[pseudoStep].explanation);
    setText(pseudoFrontier, pseudoSteps[pseudoStep].frontier);
    if (pseudoNext) pseudoNext.disabled = pseudoStep === pseudoSteps.length - 1;
    if (pseudoReset) pseudoReset.disabled = false;
  };

  const advancePseudoStep = () => {
    if (pseudoStep >= pseudoSteps.length - 1) {
      stopPseudoPlayback();
      renderPseudoStep();
      return;
    }
    pseudoStep += 1;
    renderPseudoStep();
    if (pseudoStep === pseudoSteps.length - 1) stopPseudoPlayback();
  };

  pseudoLineElements.forEach((line, index) => {
    line.classList.add('pseudo-line');
    if (line.tagName !== 'BUTTON') {
      line.tabIndex = 0;
      line.setAttribute('role', 'button');
    }
    const selectLine = () => {
      stopPseudoPlayback();
      pseudoStep = Math.min(index, pseudoSteps.length - 1);
      renderPseudoStep();
    };
    listen(line, 'click', selectLine);
    listen(line, 'keydown', event => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      selectLine();
    });
  });
  listen(pseudoNext, 'click', () => {
    stopPseudoPlayback();
    advancePseudoStep();
  });
  listen(pseudoPlay, 'click', () => {
    stopPseudoPlayback();
    if (pseudoStep >= pseudoSteps.length - 1) pseudoStep = 0;
    renderPseudoStep();
    if (pseudoPlay) pseudoPlay.disabled = true;
    if (pseudoPause) pseudoPause.disabled = false;
    pseudoTimer = window.setInterval(advancePseudoStep, 1400);
  });
  listen(pseudoPause, 'click', () => {
    stopPseudoPlayback();
    renderPseudoStep();
  });
  listen(pseudoReset, 'click', () => {
    stopPseudoPlayback();
    pseudoStep = 0;
    renderPseudoStep();
  });
  stopPseudoPlayback();
  renderPseudoStep();

  const loopQuestions = [
    {question: '如果队伍空了，就 ____。', choices: ['报“没找到”', '继续等待'], answer: 0},
    {question: '从队伍拿到节点后，先 ____。', choices: ['看它是不是目标状态', '直接放回队伍'], answer: 0},
    {question: '如果不是目标状态，就把新节点 ____。', choices: ['放进队伍', '全部删除'], answer: 0}
  ];
  const loopGame = $('#loop-game');
  const loopTreeDots = $$('#loop-tree i');
  let loopQuestion = 0;

  const renderLoopGame = () => {
    if (!loopGame) return;
    const item = loopQuestions[loopQuestion];
    loopGame.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = `第 ${loopQuestion + 1} / ${loopQuestions.length} 题`;
    const prompt = document.createElement('p');
    prompt.textContent = item.question;
    const choices = document.createElement('div');
    const feedback = document.createElement('output');
    item.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = choice;
      listen(button, 'click', () => {
        if (index !== item.answer) {
          feedback.textContent = '再看左侧列出的五个步骤。';
          return;
        }
        loopTreeDots[loopQuestion]?.classList.add('shown');
        if (loopQuestion === loopQuestions.length - 1) {
          feedback.textContent = '✓ 三题全对。你已经复述了搜索的主循环。';
          const restart = document.createElement('button');
          restart.type = 'button';
          restart.textContent = '重新练习';
          listen(restart, 'click', () => {
            loopQuestion = 0;
            loopTreeDots.forEach(dot => dot.classList.remove('shown'));
            renderLoopGame();
          });
          feedback.append(restart);
          return;
        }
        feedback.textContent = '✓ 正确。';
        const nextQuestion = document.createElement('button');
        nextQuestion.type = 'button';
        nextQuestion.textContent = '下一题';
        listen(nextQuestion, 'click', () => {
          loopQuestion += 1;
          renderLoopGame();
        });
        feedback.append(nextQuestion);
      });
      choices.append(button);
    });
    loopGame.append(heading, prompt, choices, feedback);
  };
  renderLoopGame();

  /* ---------- 第 14 页：重复与环路 ---------- */
  const loopModeButtons = $$('[data-loop-mode]');
  const loopPath = $('#loop-path');
  const loopCount = $('#loop-count');
  const loopNote = $('#loop-note');
  const loopExplanation = $('#loop-explanation');
  let loopTimer = 0;

  const resetLoopPath = () => {
    if (!loopPath) return;
    loopPath.innerHTML = '<b role="listitem">Arad（起点）</b><span aria-hidden="true">↓</span><b role="listitem">Sibiu（第 1 次）</b>';
    setText(loopCount, '2');
  };
  loopModeButtons.forEach(button => listen(button, 'click', () => {
    window.clearInterval(loopTimer);
    loopModeButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    resetLoopPath();
    if (button.dataset.loopMode === 'remember') {
      if (loopPath) loopPath.insertAdjacentHTML('beforeend', '<span aria-hidden="true">↓</span><b class="blocked" role="listitem">Arad（已在已达表，不再生成）</b>');
      setText(loopNote, '先查已达表：Arad 已经记录，不再生成重复节点。');
      setText(loopExplanation, '候选 Arad 被拦下，Arad ⇄ Sibiu 的环不会继续向下生长。');
      return;
    }
    setText(loopNote, '不检查重复状态时，同一个状态会在更深处反复生成。');
    setText(loopExplanation, '正在生成新的 Arad 和 Sibiu 节点；演示停下，并不表示搜索会自行停下。');
    let generated = 0;
    loopTimer = window.setInterval(() => {
      const city = generated % 2 === 0 ? 'Arad' : 'Sibiu';
      const appearance = Math.floor(generated / 2) + 2;
      if (loopPath) loopPath.insertAdjacentHTML('beforeend', `<span aria-hidden="true">↓</span><b class="repeat-node" role="listitem">${city}（第 ${appearance} 次）</b>`);
      generated += 1;
      setText(loopCount, String(generated + 2));
      // Two new nodes are enough to show Arad → Sibiu → Arad → Sibiu;
      // stopping here keeps the whole cycle visible on a classroom screen.
      if (generated >= 2) {
        window.clearInterval(loopTimer);
        setText(loopExplanation, '如果不记录来过哪些状态，这棵搜索树还会继续向下生长。');
      }
    }, 420);
  }));

  /* ---------- 第 15 页：树搜索与图搜索 ---------- */
  const searchModeButtons = $$('[data-search-mode]');
  const graphStateSpace = $('#graph-state-space');
  const graphSearchTree = $('#graph-search-tree');
  const graphPrev = $('#graph-prev');
  const graphNext = $('#graph-next');
  const graphReset = $('#graph-reset');
  const reachedList = $('#explored-list');
  const duplicateResult = $('#duplicate-result');
  const skipCount = $('#skip-count') || $('#graph-skip-count');
  const searchModeNote = $('#search-mode-note');
  let searchMode = 'tree';
  let graphStep = 0;
  const graphComparison = graphStateSpace?.closest('.graph-comparison, .compare-diagrams');
  graphComparison?.classList.add('compare-diagrams');
  graphComparison?.closest('.explored-book, .graph-compare')?.classList.add('graph-compare');
  $$(':scope > section', graphComparison).forEach(panel => panel.classList.add('compare-panel'));
  const graphScenes = [
    {
      stateExpanded: [], stateFrontier: ['Arad'], stateEdges: [],
      treeNodes: ['root'], treeEdges: [],
      reached: ['Arad'], skipped: 0,
      treeNote: '初始节点 Arad 位于边界；树搜索不使用已达表。',
      graphNote: '初始节点 Arad 位于边界，并已写入已达表。'
    },
    {
      stateExpanded: ['Arad'], stateFrontier: ['Sibiu', 'Timisoara', 'Zerind'],
      stateEdges: firstExpansionEdges,
      treeNodes: ['root', 'sibiu', 'timisoara', 'zerind'],
      treeEdges: [['root', 'sibiu'], ['root', 'timisoara'], ['root', 'zerind']],
      reached: ['Arad', 'Sibiu', 'Timisoara', 'Zerind'], skipped: 0,
      treeNote: '展开 Arad，三个子节点进入边界；树搜索不会登记已经生成过的状态。',
      graphNote: '展开 Arad，三个新状态进入边界，同时写入已达表。'
    },
    {
      stateExpanded: ['Arad', 'Sibiu'],
      stateFrontier: ['Timisoara', 'Zerind', 'Rimnicu Vilcea', 'Fagaras', 'Oradea'],
      stateEdges: [
        ...firstExpansionEdges,
        ['Sibiu', 'Rimnicu Vilcea'], ['Sibiu', 'Fagaras'], ['Sibiu', 'Oradea']
      ],
      treeNodes: ['root', 'sibiu', 'timisoara', 'zerind', 'arad-again', 'rimnicu', 'fagaras', 'oradea'],
      treeEdges: [
        ['root', 'sibiu'], ['root', 'timisoara'], ['root', 'zerind'],
        ['sibiu', 'arad-again'], ['sibiu', 'rimnicu'], ['sibiu', 'fagaras'], ['sibiu', 'oradea']
      ],
      reached: ['Arad', 'Sibiu', 'Timisoara', 'Zerind', 'Rimnicu Vilcea', 'Fagaras', 'Oradea'], skipped: 1,
      treeNote: '展开 Sibiu 后又生成一个 Arad；树搜索把它当作新的边界节点，可能继续绕圈。',
      graphNote: '展开 Sibiu 后又生成 Arad；图搜索查到它已在已达表，将其置灰并跳过。'
    }
  ];
  const graphTreeNodes = {
    root: {name: 'Arad', x: 520, y: 60},
    sibiu: {name: 'Sibiu', x: 200, y: 215},
    timisoara: {name: 'Timisoara', x: 520, y: 215},
    zerind: {name: 'Zerind', x: 840, y: 215},
    'arad-again': {name: 'Arad', x: 100, y: 410, duplicate: true},
    rimnicu: {name: 'Rimnicu Vilcea', x: 330, y: 410, lines: ['Rimnicu', 'Vilcea']},
    fagaras: {name: 'Fagaras', x: 560, y: 410},
    oradea: {name: 'Oradea', x: 790, y: 410}
  };

  const drawGraphStateSpace = (scene) => {
    if (!graphStateSpace) return;
    graphStateSpace.setAttribute('viewBox', '0 0 1040 630');
    drawRoadMap(graphStateSpace, 'graph-state-city');
    paintRoadMapState(graphStateSpace, {
      expandedNodes: scene.stateExpanded,
      frontierNodes: scene.stateFrontier,
      expandedEdges: scene.stateEdges
    });
  };

  const drawGraphSearchTree = (scene) => {
    if (!graphSearchTree) return;
    graphSearchTree.replaceChildren();
    graphSearchTree.setAttribute('viewBox', '0 0 1040 500');
    const expandedIds = graphStep === 0 ? [] : graphStep === 1 ? ['root'] : ['root', 'sibiu'];
    const rejectedIds = searchMode === 'graph' && graphStep >= 2 ? ['arad-again'] : [];
    const visibleIds = new Set(scene.treeNodes);

    scene.treeEdges.forEach(([fromId, toId]) => {
      const from = graphTreeNodes[fromId];
      const to = graphTreeNodes[toId];
      if (!from || !to || !visibleIds.has(fromId) || !visibleIds.has(toId)) return;
      const line = document.createElementNS(svgNS, 'line');
      line.classList.add('expanded-edge');
      line.setAttribute('x1', String(from.x));
      line.setAttribute('y1', String(from.y + 35));
      line.setAttribute('x2', String(to.x));
      line.setAttribute('y2', String(to.y - 35));
      line.setAttribute('style', 'stroke:#FF0000;stroke-width:7;opacity:1');
      graphSearchTree.append(line);
    });

    scene.treeNodes.forEach(id => {
      const node = graphTreeNodes[id];
      if (!node) return;
      const expanded = expandedIds.includes(id);
      const rejected = rejectedIds.includes(id);
      const frontier = !expanded && !rejected;
      const group = document.createElementNS(svgNS, 'g');
      group.classList.add('graph-tree-node');
      if (expanded) group.classList.add('expanded');
      if (frontier) group.classList.add('frontier');
      if (rejected) group.classList.add('rejected');
      group.dataset.nodeId = id;
      group.setAttribute('transform', `translate(${node.x} ${node.y})`);

      const shape = document.createElementNS(svgNS, 'ellipse');
      shape.setAttribute('rx', rejected ? '112' : '82');
      shape.setAttribute('ry', rejected ? '46' : '35');
      const fill = expanded ? '#FF0000' : '#F1F3F5';
      const stroke = expanded ? '#FF0000' : rejected ? '#212834' : '#00AD00';
      shape.setAttribute('style', `fill:${fill};stroke:${stroke};stroke-width:${expanded ? 8 : 6}`);

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('style', `font-size:${node.lines || rejected ? 20 : 23}px;fill:${expanded ? '#FFFFFF' : rejected ? '#212834' : '#00AD00'};font-weight:900`);
      const labelLines = rejected
        ? [node.name, '× 已在已达表']
        : node.lines || [node.name];
      labelLines.forEach((part, index) => {
        const tspan = document.createElementNS(svgNS, 'tspan');
        tspan.setAttribute('x', '0');
        tspan.setAttribute('y', String(labelLines.length === 1 ? 8 : index === 0 ? -6 : 22));
        tspan.textContent = part;
        label.append(tspan);
      });
      group.append(shape, label);
      graphSearchTree.append(group);
    });
  };

  const renderGraphDemo = () => {
    graphStep = Math.max(0, Math.min(graphStep, graphScenes.length - 1));
    const scene = graphScenes[graphStep];
    drawGraphStateSpace(scene);
    drawGraphSearchTree(scene);
    if (searchMode === 'graph') {
      setText(reachedList, scene.reached.join(' · '));
      setText(skipCount, String(scene.skipped));
      setText(searchModeNote, scene.graphNote);
      setText(duplicateResult, graphStep >= 2 ? 'Arad 已在已达表：× 跳过，不再扩展。' : '目前没有重复节点。');
    } else {
      setText(reachedList, '树搜索不使用已达表');
      setText(skipCount, '0');
      setText(searchModeNote, scene.treeNote);
      setText(duplicateResult, graphStep >= 2 ? '重复 Arad 仍在绿色边界中，之后还可能继续展开。' : '树搜索不检查重复状态。');
    }
    if (graphPrev) graphPrev.disabled = graphStep === 0;
    if (graphNext) graphNext.disabled = graphStep === graphScenes.length - 1;
    if (graphReset) graphReset.disabled = graphStep === 0;
  };

  listen(graphPrev, 'click', () => {
    graphStep -= 1;
    renderGraphDemo();
  });
  listen(graphNext, 'click', () => {
    graphStep += 1;
    renderGraphDemo();
  });
  listen(graphReset, 'click', () => {
    graphStep = 0;
    renderGraphDemo();
  });

  searchModeButtons.forEach(button => listen(button, 'click', () => {
    searchMode = button.dataset.searchMode === 'graph' ? 'graph' : 'tree';
    searchModeButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    renderGraphDemo();
  }));
  renderGraphDemo();

  /* ---------- 第 16 页：逐层扩展 ---------- */
  const waveGrid = $('#wave-grid');
  const gridNext = $('#grid-next');
  const gridReset = $('#grid-reset');
  let waveLevel = 0;
  const maxWaveLevel = 8;
  if (waveGrid && !waveGrid.children.length) {
    for (let index = 0; index < 81; index += 1) {
      const cell = document.createElement('i');
      cell.dataset.distance = String(Math.abs(Math.floor(index / 9) - 4) + Math.abs((index % 9) - 4));
      waveGrid.append(cell);
    }
  }

  const drawWave = () => {
    let expandedCount = 0;
    let boundaryCount = 0;
    const finished = waveLevel > maxWaveLevel;
    $$('#wave-grid i').forEach(cell => {
      const distance = Number(cell.dataset.distance);
      const expanded = finished || distance < waveLevel;
      const boundary = !finished && distance === waveLevel;
      cell.classList.toggle('done', expanded);
      cell.classList.toggle('frontier', boundary);
      if (expanded) expandedCount += 1;
      if (boundary) boundaryCount += 1;
    });
    setText($('#explored-count'), String(expandedCount));
    setText($('#frontier-count'), String(boundaryCount));
    setText($('#unexplored-count'), String(81 - expandedCount - boundaryCount));
    if (finished) setText($('#grid-note'), '全部 81 个节点都已展开。');
    else if (waveLevel === 0) setText($('#grid-note'), '第 0 层：中心起始节点位于边界，尚未展开。');
    else setText($('#grid-note'), `第 ${waveLevel} 层：上一层已展开，新的边界向外移动一层。`);
    if (gridNext) gridNext.disabled = finished;
    if (gridReset) gridReset.disabled = waveLevel === 0;
  };
  listen(gridNext, 'click', () => {
    if (waveLevel <= maxWaveLevel) waveLevel += 1;
    drawWave();
  });
  listen(gridReset, 'click', () => {
    waveLevel = 0;
    drawWave();
  });
  drawWave();

  /* ---------- 第 17 页：评价标准卡片 ---------- */
  const metricCards = $$('.metric-grid article');
  metricCards.forEach(card => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    const selectMetric = () => {
      metricCards.forEach(item => {
        const selected = item === card;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
    };
    listen(card, 'click', selectMetric);
    listen(card, 'keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectMetric();
      }
    });
  });

  /* ---------- 第 20 页：课堂自测 ---------- */
  const finalQuestions = [
    {q: '搜索问题的形式化定义共有几个要素？', options: ['A．4 个', 'B．5 个', 'C．6 个'], answer: 2, explain: 'C。搜索问题包括四个必选要素：状态空间、初始状态、目标状态、操作（或后继函数）；成本与启发规则是两个可选项。'},
    {q: '关于边界（frontier），正确的是：', options: ['A．已生成但还没展开的节点', 'B．全部可能状态', 'C．已经到达目标的节点'], answer: 0, explain: 'A。边界保存已生成、但尚未展开的节点。'},
    {q: '完整性指：', options: ['A．找到的解一定代价最低', 'B．有解时能找到解，无解时能报告失败', 'C．内存一定足够'], answer: 1, explain: 'B。最低路径代价对应最优性。'},
    {q: '树搜索不记录重复状态，最可能出现：', options: ['A．绕圈和重复展开', 'B．一定最快', 'C．不需要目标状态'], answer: 0, explain: 'A。有环时，同一状态可能在不同深度反复出现。'}
  ];
  const finalQuiz = $('#final-quiz');
  const quizStatusStrip = $('#quiz-status-strip');
  const quizProgressSummary = $('#quiz-progress-summary');
  const quizScoreSummary = $('#quiz-score-summary');
  let finalQuestion = 0;
  const finalQuizResults = finalQuestions.map(() => ({status: 'unanswered'}));

  const renderQuizProgress = () => {
    const correct = finalQuizResults.filter(result => result.status === 'correct').length;
    const wrong = finalQuizResults.filter(result => result.status === 'wrong').length;
    const completed = correct + wrong;
    setText(quizProgressSummary, `已完成 ${completed} / ${finalQuestions.length} 题 · 答对 ${correct} 题 · 需要复习 ${wrong} 题`);
    setText(quizScoreSummary, completed
      ? `当前记录：${correct} 题正确，${wrong} 题需要复习。点击上方题号可以返回检查。`
      : '题号状态：○ 未答　✓ 正确　× 错误或需要复习');
    if (!quizStatusStrip) return;
    quizStatusStrip.replaceChildren();
    finalQuizResults.forEach((result, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `quiz-status-item ${result.status}`;
      if (index === finalQuestion && finalQuestion < finalQuestions.length) button.classList.add('current');
      const mark = result.status === 'correct' ? '✓' : result.status === 'wrong' ? '×' : '○';
      button.textContent = `${index + 1} ${mark}`;
      button.setAttribute('aria-label', `第 ${index + 1} 题：${result.status === 'correct' ? '正确' : result.status === 'wrong' ? '错误或需要复习' : '未答'}`);
      button.setAttribute('aria-current', index === finalQuestion ? 'step' : 'false');
      listen(button, 'click', () => {
        finalQuestion = index;
        renderFinalQuiz();
      });
      quizStatusStrip.append(button);
    });
  };

  const markFinalQuestion = (status) => {
    finalQuizResults[finalQuestion].status = status;
    renderQuizProgress();
  };

  const renderFinalQuiz = () => {
    if (!finalQuiz) return;
    if (finalQuestion >= finalQuestions.length) {
      finalQuiz.replaceChildren();
      renderQuizProgress();
      const correct = finalQuizResults.filter(result => result.status === 'correct').length;
      const wrongIndexes = finalQuizResults
        .map((result, index) => result.status === 'wrong' ? index + 1 : null)
        .filter(Boolean);
      const unansweredIndexes = finalQuizResults
        .map((result, index) => result.status === 'unanswered' ? index + 1 : null)
        .filter(Boolean);
      const heading = document.createElement('h3');
      heading.textContent = `自测结果：${correct} / ${finalQuestions.length}`;
      const note = document.createElement('p');
      note.textContent = wrongIndexes.length
        ? `需要复习：第 ${wrongIndexes.join('、')} 题。点击上方对应题号可以重新作答。`
        : '目前没有标记为错误的题。点击上方题号可以返回检查。';
      const unanswered = document.createElement('p');
      unanswered.textContent = unansweredIndexes.length
        ? `尚未作答：第 ${unansweredIndexes.join('、')} 题。`
        : `${finalQuestions.length} 道题均已留下答题记录。`;
      const restart = document.createElement('button');
      restart.type = 'button';
      restart.textContent = '重新开始自测';
      listen(restart, 'click', () => {
        finalQuestion = 0;
        finalQuizResults.forEach(result => { result.status = 'unanswered'; });
        renderFinalQuiz();
      });
      finalQuiz.append(heading, note, unanswered, restart);
      return;
    }

    const question = finalQuestions[finalQuestion];
    finalQuiz.replaceChildren();
    renderQuizProgress();
    const heading = document.createElement('h3');
    heading.textContent = `第 ${finalQuestion + 1} / ${finalQuestions.length} 题`;
    const prompt = document.createElement('p');
    prompt.textContent = question.q;
    const answerArea = document.createElement('div');
    answerArea.className = 'final-answer';
    const feedback = document.createElement('output');

    const addNextButton = () => {
      const nextQuestion = document.createElement('button');
      nextQuestion.type = 'button';
      nextQuestion.className = 'next-question';
      const firstUnanswered = finalQuizResults.findIndex((result, index) => result.status === 'unanswered' && index !== finalQuestion);
      nextQuestion.textContent = finalQuestion === finalQuestions.length - 1
        ? firstUnanswered >= 0 ? '补答未完成题' : '完成自测'
        : '下一题';
      listen(nextQuestion, 'click', () => {
        finalQuestion = finalQuestion === finalQuestions.length - 1 && firstUnanswered >= 0
          ? firstUnanswered
          : finalQuestion + 1;
        renderFinalQuiz();
      });
      feedback.append(nextQuestion);
    };

    if (question.text) {
      const textarea = document.createElement('textarea');
      textarea.rows = 5;
      textarea.placeholder = '先写下自己的答案，再查看参考答案。';
      const reveal = document.createElement('button');
      reveal.type = 'button';
      reveal.textContent = '查看参考答案';
      listen(reveal, 'click', () => {
        feedback.replaceChildren();
        const label = document.createElement('b');
        label.textContent = '参考答案：';
        feedback.append(label, document.createTextNode(question.reference));
        const selfCheck = document.createElement('div');
        selfCheck.className = 'quiz-self-check';
        const correctButton = document.createElement('button');
        correctButton.type = 'button';
        correctButton.textContent = '我的答案基本正确';
        const reviewButton = document.createElement('button');
        reviewButton.type = 'button';
        reviewButton.textContent = '这题需要复习';
        const finishSelfCheck = (status) => {
          markFinalQuestion(status);
          correctButton.disabled = true;
          reviewButton.disabled = true;
          addNextButton();
        };
        listen(correctButton, 'click', () => finishSelfCheck('correct'));
        listen(reviewButton, 'click', () => finishSelfCheck('wrong'));
        selfCheck.append(correctButton, reviewButton);
        feedback.append(selfCheck);
        reveal.disabled = true;
      });
      answerArea.append(textarea, reveal);
    } else {
      question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = option;
        listen(button, 'click', () => {
          if (index !== question.answer) {
            feedback.textContent = '这项不正确，请再判断一次。';
            button.classList.add('wrong');
            markFinalQuestion('wrong');
            return;
          }
          feedback.replaceChildren();
          const label = document.createElement('b');
          label.textContent = '回答正确。';
          feedback.append(label, document.createTextNode(question.explain));
          $$('button', answerArea).forEach(item => { item.disabled = true; });
          button.classList.add('correct');
          markFinalQuestion('correct');
          addNextButton();
        });
        answerArea.append(button);
      });
    }
    finalQuiz.append(heading, prompt, answerArea, feedback);
  };
  renderFinalQuiz();

  showSlide(0);
})();
