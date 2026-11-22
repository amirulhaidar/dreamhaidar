'use strict';
(() => {
 const section = document.querySelector('#klien');
 if (!section) return;
 const tabs = [...section.querySelectorAll('[role="tab"]')];
 const panels = [...section.querySelectorAll('.client-panel')];
 const states = [];
 panels.forEach(panel => {
  const viewport = panel.querySelector('.client-viewport');
  const track = panel.querySelector('.client-track');
  const control = panel.querySelector('.client-motion');
  const cards = [...track.children];
  // One duplicate set makes the end-to-start join visually identical.
  cards.forEach(card => {
   const clone = card.cloneNode(true);
   clone.setAttribute('aria-hidden','true');clone.inert = true;
   clone.querySelectorAll('img').forEach(img => {img.loading='eager';img.alt='';});
   track.append(clone);
  });
  const state = {panel,viewport,track,offset:0,length:0,hover:false,focused:false,paused:false,gesture:null,visible:false};
  states.push(state);
  viewport.setAttribute('role','region');
  viewport.setAttribute('aria-roledescription','carousel');
  const paint = () => {
   if (!state.length) return;
   state.offset = ((state.offset % state.length) + state.length) % state.length;
   track.style.transform = `translate3d(${-state.offset}px,0,0)`;
  };
  state.paint = paint;
  const measure = () => {
   if (panel.hidden || !viewport.clientWidth) return;
   state.length = track.children[cards.length].offsetLeft - cards[0].offsetLeft;
   paint();
  };
  state.measure = measure;
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(viewport);
  else window.addEventListener('resize',measure,{passive:true});
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
   state.visible = entries[0].isIntersecting;
  }).observe(viewport);
  else state.visible = true;
  viewport.addEventListener('pointerenter', e => {if(e.pointerType==='mouse')state.hover=true;});
  viewport.addEventListener('pointerleave', () => {state.hover=false;});
  viewport.addEventListener('focusin', () => {state.focused=true;});
  viewport.addEventListener('focusout', () => {state.focused=false;});
  control.addEventListener('click', () => {
   state.paused = !state.paused;
   control.setAttribute('aria-pressed',String(state.paused));
   control.textContent = state.paused ? 'Putar animasi' : 'Jeda animasi';
  });
  viewport.addEventListener('pointerdown', event => {
   if (!event.isPrimary || (event.pointerType==='mouse' && event.button!==0)) return;
   state.gesture={id:event.pointerId,x:event.clientX};
   viewport.setPointerCapture(event.pointerId);
   viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', event => {
   const gesture=state.gesture;
   if (!gesture || gesture.id!==event.pointerId) return;
   state.offset += gesture.x-event.clientX;gesture.x=event.clientX;paint();
  });
  const release = () => {state.gesture=null;viewport.classList.remove('is-dragging');};
  viewport.addEventListener('pointerup',release);
  viewport.addEventListener('pointercancel',release);
  viewport.addEventListener('lostpointercapture',release);
  viewport.addEventListener('dragstart',event=>event.preventDefault());
  viewport.addEventListener('keydown', event => {
   if (event.key==='ArrowLeft' || event.key==='ArrowRight') {
    event.preventDefault();state.offset+=(event.key==='ArrowRight'?1:-1)*(cards[0].getBoundingClientRect().width+18);paint();
   }
  });
  measure();
 });
 // Time-based movement keeps the same gentle speed on different displays.
 let previous = 0;
 const tick = time => {
  const elapsed = previous ? Math.min(time-previous,50)/1000 : 0;
  previous=time;
  if (!document.hidden) states.forEach(state => {
   if (!state.panel.hidden && state.visible && state.length && !state.paused && !state.hover && !state.focused && !state.gesture) {
    state.offset+=elapsed*28;state.paint();
   }
  });
  requestAnimationFrame(tick);
 };
 requestAnimationFrame(tick);
 const activate = tab => {
  tabs.forEach(item => {
   const selected=item===tab;
   item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;
  });
  panels.forEach(panel=>{panel.hidden=panel.id!==tab.getAttribute('aria-controls');});
  requestAnimationFrame(()=>states.forEach(state=>state.measure()));
 };
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activate(tab));
  tab.addEventListener('keydown',event=>{
   let target;
   if(event.key==='ArrowRight')target=tabs[(index+1)%tabs.length];
   if(event.key==='ArrowLeft')target=tabs[(index-1+tabs.length)%tabs.length];
   if(event.key==='Home')target=tabs[0];
   if(event.key==='End')target=tabs[tabs.length-1];
   if(target){event.preventDefault();activate(target);target.focus();}
  });
 });
})();
