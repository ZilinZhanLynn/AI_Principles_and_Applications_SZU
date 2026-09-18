'use strict';
// Deterministic teaching world: two rooms, reliable actions, no new dirt.
// Policy reads only the latest local percept and (in memory mode) stored state.
(() => {
  const observe = state => {
    state.percept = { room: state.position, dirty: state.dirt[state.position] };
    if (state.mode === 'memory') state.memory[state.position] = state.percept.dirty;
  };
  const create = (mode = 'reflex') => {
    const state = {mode, position:0, dirt:[false,true], memory:[null,null], phase:0, action:null, moves:0, cleans:0, done:false};
    observe(state);
    return state;
  };
  const decide = state => {
    if (state.percept.dirty) return 'clean';
    if (state.mode === 'memory' && state.memory.every(value => value === false)) return 'stop';
    return state.percept.room === 0 ? 'right' : 'left';
  };
  const advance = current => {
    const state = {...current, dirt:[...current.dirt], memory:[...current.memory], percept:{...current.percept}};
    if (state.done) return state;
    if (state.phase === 0) { state.action = decide(state); state.phase = 1; }
    else if (state.phase === 1) {
      if (state.action === 'clean') { state.dirt[state.position] = false; state.cleans++; }
      else if (state.action === 'stop') state.done = true;
      else { state.position = state.action === 'right' ? 1 : 0; state.moves++; }
      state.phase = 2;
    } else { observe(state); state.action = null; state.phase = 0; }
    return state;
  };
  const api = {create, advance, decide};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.VacuumWorld = api;
})();
