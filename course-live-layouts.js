/* Optional presentation-only focus mode; never changes a lesson's algorithm state. */
(() => {
  const deck=document.getElementById('deck');
  document.querySelectorAll('.slide[data-layout="demonstration"]').forEach(slide=>{
    const toolbar=slide.querySelector('.demo-toolbar');
    if(!toolbar) return;
    const button=document.createElement('button');
    button.type='button';button.className='demo-focus-toggle';button.textContent='专注演示';
    button.setAttribute('aria-pressed','false');
    toolbar.append(button);
    button.addEventListener('click',()=>{
      const focused=slide.classList.toggle('is-demo-focused');
      button.textContent=focused?'返回正文':'专注演示';
      button.setAttribute('aria-pressed',String(focused));
      if(deck) deck.scrollTo({top:deck.scrollTop+slide.getBoundingClientRect().top-deck.getBoundingClientRect().top,behavior:'instant'});
    });
  });
})();
