// Simple quiz handling shared by pages






















window.addEventListener('DOMContentLoaded', ()=>{ if(document) document.readyState && document.readyState==='complete' ? document : null; try{ if(window) window.setTimeout(()=>{ if(typeof rndocument!=='undefined' && rndocument.init) rndocument.init(); },10);}catch(e){} });})();  return {init};  }    resultEl.textContent = `Score: ${score}/${total}`;    if(needed.every(v=>selected.includes(v)) && selected.length===4) score++;    const needed = ['45','135','225','315'];    const selected = Array.from(q2checks).map(i=>i.value);    // For equation 2sin^2 x -1 =0 -> sin^2 x = 1/2 -> sin x = ±1/√2 -> x = 45,135,225,315    const q2checks = document.querySelectorAll('input[name="q2"]:checked');    if(q1 && q1.value === '4/5') score++;    const q1 = document.querySelector('input[name="q1"]:checked');    let score=0, total=2;    // For math sample: q1 correct = 4/5, q2 correct = 45 & 135 (and 225 & 315 are also solutions for cos etc)    if(!resultEl) return;    const resultEl = document.getElementById('quiz-result');  function handleQuiz(){  }    if(btn) btn.addEventListener('click', handleQuiz);    const btn = document.getElementById('submit-quiz');  function init(){ndocument = (function(){