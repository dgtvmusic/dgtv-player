function fitCanvas(){
 const canvas=document.getElementById('canvas');
 if(!canvas) return;
 const scale=Math.min(window.innerWidth/1920,window.innerHeight/1080);
 canvas.style.transform='translate(-50%,-50%) scale('+scale+')';
}
window.addEventListener('load',fitCanvas);
window.addEventListener('resize',fitCanvas);

function updateClock(){
 const d=new Date();
 const t=document.getElementById('time');
 const da=document.getElementById('date');
 if(t) t.textContent=d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
 if(da) da.textContent=d.toLocaleDateString('it-IT',{weekday:'long',day:'2-digit',month:'long'});
}
updateClock();
setInterval(updateClock,1000);

const eq=document.getElementById('equalizer');
if(eq && !eq.children.length){
 for(let i=0;i<80;i++){
   const b=document.createElement('i');
   b.style.animationDuration=(0.4+Math.random()*0.8)+'s';
   b.style.animationDelay=(Math.random()*0.4)+'s';
   eq.appendChild(b);
 }
}
