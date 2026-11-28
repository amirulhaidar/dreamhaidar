'use strict';
(() => {
 const header = document.querySelector('.header');
 const menu = document.querySelector('.menu-toggle');
 const mobile = document.querySelector('.mobile-nav');
 const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
 onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
 menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); mobile.hidden = !open; });
 mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {mobile.hidden=true;menu.setAttribute('aria-expanded','false');}));
 if ('IntersectionObserver' in window) {
  document.body.classList.add('js-ready');
  const observer = new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:0.08});
  document.querySelectorAll('.reveal').forEach(e => observer.observe(e));
 }
 // The text belt has its own pause state; video visibility never controls it.
 const ticker = document.querySelector('.ticker');
 if (ticker) {
  const toggle = ticker.querySelector('.ticker-toggle');
  let paused = false;
  const syncTicker = () => {
   ticker.dataset.motion = paused ? 'paused' : 'running';
   toggle.setAttribute('aria-pressed', String(paused));
   toggle.textContent = paused ? 'Putar teks ▷' : 'Jeda teks Ⅱ';
  };
  toggle.addEventListener('click', () => { paused = !paused; syncTicker(); });
  syncTicker();
 }
 const videos = [...document.querySelectorAll('video')];
 const control = document.querySelector('.motion-control');
 let userPaused = false;
 let heroVisible = true;
 const updatePlaybackControl = () => {
  const paused = videos.every(video => video.paused);  control.setAttribute('aria-pressed', String(paused));
  control.textContent = paused ? 'Putar video ▷' : 'Jeda video Ⅱ';
 };
 const startVideos = () => {
  if (userPaused || document.hidden || !heroVisible) return;
  videos.forEach(video => {
   const playback = video.play();
   if (playback) playback.catch(updatePlaybackControl);
  });
 };
 videos.forEach(video => {
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.addEventListener('loadeddata', startVideos, {once:true});
  video.addEventListener('play', updatePlaybackControl);
  video.addEventListener('pause', updatePlaybackControl);
 });
 control.addEventListener('click', () => {
  userPaused = !videos.every(video => video.paused);
  if (userPaused) videos.forEach(video => video.pause());
  else startVideos();
  updatePlaybackControl();
 });
 window.addEventListener('pageshow', startVideos);
 document.addEventListener('visibilitychange', () => {
  if (document.hidden) videos.forEach(video => video.pause());
  else startVideos();
 });
 // Resume from the current timestamp when the hero returns to view.
 if ('IntersectionObserver' in window) {
  const heroObserver = new IntersectionObserver(entries => {
   heroVisible = entries[0].isIntersecting;
   if (heroVisible) startVideos();
   else videos.forEach(video => video.pause());
  }, {threshold: 0});
  heroObserver.observe(document.querySelector('.hero'));
 }
 updatePlaybackControl();
 startVideos();
 const form = document.querySelector('#inquiry-form');
 if (!form) return;
 const status = form.querySelector('.form-status');
 const summary = form.querySelector('.summary');
 const field = name => form.elements.namedItem(name);
 const today = new Date(); const localToday = new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
 field('checkin').min=localToday;field('checkout').min=localToday;
 field('checkin').addEventListener('change',()=>{field('checkout').min=field('checkin').value || localToday;field('checkout').setCustomValidity('');});
 field('checkout').addEventListener('input',()=>field('checkout').setCustomValidity(''));
 document.querySelectorAll('[data-city]').forEach(a=>a.addEventListener('click',()=>{field('city').value=a.dataset.city;}));
 document.querySelectorAll('[data-type]').forEach(a=>a.addEventListener('click',()=>{field('type').value=a.dataset.type;}));
 form.addEventListener('submit', event => {
  event.preventDefault(); status.textContent='';
  if(!form.reportValidity())return;
  if(!field('name').value.trim()){field('name').setCustomValidity('Mohon isi nama Anda.');field('name').reportValidity();return;}
  if(field('checkout').value <= field('checkin').value){field('checkout').setCustomValidity('Check-out harus setelah tanggal check-in.');field('checkout').reportValidity();return;}
  const data = new FormData(form);
  const text = `Assalamu’alaikum Dream Travel and Tourism Company, saya ingin konsultasi akomodasi.\n\nNama: ${String(data.get('name')).trim()}\nKebutuhan: ${data.get('type')}\nKota: ${data.get('city')}\nCheck-in: ${data.get('checkin')}\nCheck-out: ${data.get('checkout')}\nJumlah tamu: ${data.get('guests')}\nJumlah kamar: ${data.get('rooms')}\nCatatan: ${String(data.get('notes')).trim() || '-'}\n\nMohon informasi pilihan hotel, ketersediaan, harga, dan ketentuan reservasi.`;
  document.querySelector('#inquiry-summary').value=text;summary.hidden=false;
  const number=form.dataset.whatsapp;
  if(/^[1-9]\d{7,14}$/.test(number)){window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');status.textContent='Ringkasan siap. Periksa pesan dan penerima di WhatsApp sebelum mengirim.';}
  else status.textContent='Ringkasan siap. Kontak resmi belum diatur; tidak ada data yang dikirim.';
 });
 field('name').addEventListener('input',()=>field('name').setCustomValidity(''));
 form.querySelector('.copy-summary').addEventListener('click',async()=>{const text=document.querySelector('#inquiry-summary');try{await navigator.clipboard.writeText(text.value);status.textContent='Ringkasan berhasil disalin.';}catch{ text.focus();text.select();status.textContent='Silakan salin teks yang dipilih dengan Ctrl+C.';}});
})();
