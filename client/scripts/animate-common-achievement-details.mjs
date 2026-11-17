import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createCanvas,loadImage,ImageData} from '@napi-rs/canvas';
import {ACHIEVEMENT_TEMPLATES} from '../src/lib/achievementTemplates.mjs';
const dest='output/common-achievement-detail-animations';
fs.mkdirSync(dest,{recursive:true});
const TAU=Math.PI*2, frames=32;
const names={1:'Пульсирующее пламя и дым ракеты',2:'Нажатия кнопок геймпада',3:'Поочерёдное движение кроссовок',4:'Движение страницы книги',5:'Появление строк кода и курсор',6:'Движение края коврика и лучей солнца',7:'Вращение стрелок и звон будильника',8:'Последовательная подсветка камней',9:'Движение витков и ручек скакалки'};
function polygon(ctx,points,fill,stroke){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.3;ctx.stroke();}}
function glow(ctx,x,y,r,color,opacity){ctx.save();ctx.globalAlpha=opacity;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color.replace(/[^,]+\)$/,'0)'));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
function region(x,y,cx,cy,rx,ry){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;return d>=1?0:(1-d)**2;}
function motion(id,x,y){let a=0,b=0;
 if(id==='1'){const f=region(x,y,.455,.64,.115,.14);a+=f*.007;b+=f*.02;const smoke=region(x,y,.5,.84,.33,.12);a+=smoke*.008;b-=smoke*.005;}
 if(id==='2'){let k=region(x,y,.47,.41,.1,.12);b+=k*.009;k=region(x,y,.72,.41,.09,.1);b-=k*.01;}
 if(id==='3'){let k=region(x,y,.62,.53,.32,.26);b-=k*.022;a+=k*.005;k=region(x,y,.31,.35,.27,.22);b+=k*.017;}
 if(id==='6'){let k=region(x,y,.25,.65,.22,.23);a+=k*.016;b-=k*.006;}
 if(id==='7'){let k=region(x,y,.69,.4,.18,.11);a+=k*.012;}
 if(id==='9'){let k=region(x,y,.54,.32,.35,.3);a+=-(y-.32)*k*.12;b+=(x-.54)*k*.12;k=region(x,y,.23,.73,.14,.24);a+=k*.018;b+=k*.01;k=region(x,y,.68,.8,.14,.2);a-=k*.018;b-=k*.01;}
 return [a,b];}
function drawDetails(ctx,id,t){const p=t*TAU;
 if(id==='1'){
  ctx.save();ctx.globalCompositeOperation='screen';
  glow(ctx,450,650,85,'rgba(255,159,44,0.8)',.26+.16*Math.sin(p*3));
  const flame=ctx.createLinearGradient(460,570,400,765);flame.addColorStop(0,'rgba(255,255,220,0.85)');flame.addColorStop(.6,'rgba(255,184,54,0.45)');flame.addColorStop(1,'rgba(255,103,24,0)');
  const length=115+22*Math.sin(p*3);polygon(ctx,[[464,571],[480,612],[419+10*Math.sin(p*2),625+length],[435,615]],flame);
  ctx.restore();
 }
 if(id==='2'){
  const buttons=[[757,347],[798,378],[738,398],[779,429]];
  const which=Math.floor(t*8)%4;
  const [x,y]=buttons[which];glow(ctx,x,y,35,'rgba(255,207,120,0.9)',.5);
  ctx.save();ctx.strokeStyle='rgba(140,240,190,0.8)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(460,408,30+5*Math.sin(p),18,0,0,TAU);ctx.stroke();ctx.restore();
 }
 if(id==='4'){
  // A thin page lifts from the upper book and settles back at the loop boundary.
  const lift=Math.sin(Math.PI*t)**2;
  ctx.save();ctx.globalAlpha=Math.min(1,lift*5);
  ctx.beginPath();ctx.moveTo(260,178);ctx.lineTo(650,82);ctx.bezierCurveTo(720,83-100*lift,830,170-160*lift,920,267-110*lift);ctx.lineTo(530,374);ctx.bezierCurveTo(430,330-140*lift,340,248-110*lift,260,178);
  const sheet=ctx.createLinearGradient(480,100,670,380);sheet.addColorStop(0,'#eee0b9');sheet.addColorStop(.5,'#fff4d2');sheet.addColorStop(1,'#bba77a');ctx.fillStyle=sheet;ctx.fill();ctx.strokeStyle='#d6bd88';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle='rgba(115,91,54,0.2)';ctx.lineWidth=1.2;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(410+i*20,205-lift*70+i*10);ctx.lineTo(695+i*20,142-lift*70+i*10);ctx.stroke();}ctx.restore();
 }
 if(id==='5'){
  ctx.save();
  polygon(ctx,[[96,215],[663,148],[706,496],[140,615]],'#202e36');
  const colors=['#77b9ae','#e0ac77','#93b5a0','#cbd1aa'];
  const count=2+Math.floor(t*14);
  for(let row=0;row<Math.min(13,count);row++){
   const y=247+row*24;const indent=row%4===0?0:row%3*23;
   for(let col=0;col<3;col++){
    const x=205+indent+col*86, yy=y-col*10;
    ctx.strokeStyle=colors[(row+col)%colors.length];ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+45+(row*7+col*9)%32,yy-5);ctx.stroke();
   }
  }
  if(Math.floor(t*16)%2===0){const row=Math.min(12,count),y=247+row*24;ctx.fillStyle='#9dedb9';ctx.fillRect(210,y+5,7,14);}
  ctx.restore();
 }
 if(id==='6'){
  for(let i=0;i<5;i++){const a=(-155+i*29)*Math.PI/180;const x=590+Math.cos(a)*185,y=399+Math.sin(a)*185;glow(ctx,x,y,26,'rgba(255,214,116,0.8)',.2+.3*(.5+.5*Math.sin(p-i*.8)));}
 }
 if(id==='7'){
  // Preserve the original textured face and hands; add a moving second hand.
  ctx.save();ctx.translate(711,637);
  const angle=Math.floor(t*32)/32*TAU;
  ctx.strokeStyle='#b76832';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-Math.sin(angle)*14,Math.cos(angle)*14);ctx.lineTo(Math.sin(angle)*98,-Math.cos(angle)*98);ctx.stroke();
  ctx.fillStyle='#bd8744';ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();ctx.restore();
 }
 if(id==='8'){
  const stones=[[440,755,190,80],[599,616,155,70],[512,510,125,50],[594,423,130,52],[517,340,100,45],[646,277,95,32]];
  const index=Math.min(5,Math.floor(t*6));const fade=Math.sin((t*6%1)*Math.PI);
  const [x,y,rx,ry]=stones[index];ctx.save();ctx.globalCompositeOperation='source-atop';ctx.translate(x,y);ctx.scale(1,ry/rx);const g=ctx.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(119,229,187,${.3+.3*fade})`);g.addColorStop(1,'rgba(119,229,187,0)');ctx.fillStyle=g;ctx.fillRect(-rx,-rx,rx*2,rx*2);ctx.restore();
 }
 if(id==='9'){
  ctx.save();ctx.strokeStyle=`rgba(255,226,153,${.45+.3*Math.sin(p*2)})`;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.ellipse(558,376,322,235,-.3,p,p+1.1);ctx.stroke();ctx.restore();
 }
}
const chosen = process.argv.slice(2);
const oldManifest = fs.existsSync(path.join(dest,'animations.json')) ? JSON.parse(fs.readFileSync(path.join(dest,'animations.json'))) : [];
const manifest = chosen.length ? oldManifest.filter(a=>!chosen.includes(a.id)) : [];
for(const item of ACHIEVEMENT_TEMPLATES.filter(a=>a.rarity==='common' && (!chosen.length || chosen.includes(a.id)))){
 const img=await loadImage('public'+item.image),w=img.width,h=img.height;
 const sourceCanvas=createCanvas(w,h),sourceCtx=sourceCanvas.getContext('2d');sourceCtx.drawImage(img,0,0);const original=sourceCtx.getImageData(0,0,w,h).data;
 const fieldX=new Float32Array(w*h),fieldY=new Float32Array(w*h);const moving=[];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const [dx,dy]=motion(item.id,x/w,y/h);if(Math.abs(dx)+Math.abs(dy)>.00001){const i=y*w+x;fieldX[i]=dx*w;fieldY[i]=dy*h;moving.push(i);}}
 const canvas=createCanvas(w,h),ctx=canvas.getContext('2d');const dir=fs.mkdtempSync('/tmp/achievement-details-');
 for(let f=0;f<frames;f++){
  const t=f/frames,sine=Math.sin(t*TAU);const pixels=new Uint8ClampedArray(original);
  for(const i of moving){const x=i%w,y=Math.floor(i/w);const sx=Math.max(0,Math.min(w-1.001,x-fieldX[i]*sine)),sy=Math.max(0,Math.min(h-1.001,y-fieldY[i]*sine));const x0=Math.floor(sx),y0=Math.floor(sy),fx=sx-x0,fy=sy-y0;const p=(y0*w+x0)*4;for(let c=0;c<4;c++)pixels[i*4+c]=(original[p+c]*(1-fx)+original[p+4+c]*fx)*(1-fy)+(original[p+w*4+c]*(1-fx)+original[p+w*4+4+c]*fx)*fy;}
  ctx.putImageData(new ImageData(pixels,w,h),0,0);ctx.save();ctx.scale(w/1000,h/1000);drawDetails(ctx,item.id,t);ctx.restore();
  fs.writeFileSync(path.join(dir,`${String(f).padStart(3,'0')}.png`),canvas.toBuffer('image/png'));
  if([0,8,16,24].includes(f)) fs.copyFileSync(path.join(dir,`${String(f).padStart(3,'0')}.png`),path.join(dest,`preview-${item.id}-${f}.png`));
 }
 const filename=`${item.id.padStart(2,'0')} - ${item.title.replace(/!/g,'')} - анимация.gif`;const output=path.join(dest,filename);
 const ff=spawnSync('/opt/homebrew/bin/ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','10','-i',path.join(dir,'%03d.png'),'-filter_complex','[0:v]split[a][b];[a]palettegen=reserve_transparent=1:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:alpha_threshold=100','-loop','0','-gifflags','+transdiff',output],{encoding:'utf8'});
 if(ff.status!==0)throw Error(ff.stderr);
 for(const file of fs.readdirSync(dir))fs.unlinkSync(path.join(dir,file));fs.rmdirSync(dir);
 const result={id:item.id,title:item.title,file:filename,effect:names[item.id],width:w,height:h,frames,bytes:fs.statSync(output).size};manifest.push(result);console.log(JSON.stringify(result));
}
manifest.sort((a,b)=>Number(a.id)-Number(b.id));
fs.writeFileSync(path.join(dest,'animations.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(dest,'common-achievements.json'),JSON.stringify(ACHIEVEMENT_TEMPLATES.filter(a=>a.rarity==='common').map(a=>({...a,gif:''})),null,2)+'\n');
fs.writeFileSync(path.join(dest,'README.txt'),'9 анимаций деталей обычных ачивок, 1254 × 1254, 32 кадра, цикл 3,2 секунды.\nЭто эффекты и движение слоёв текущих иллюстраций.\nПоле gif в массиве оставлено пустым для ваших ссылок.\n\n'+manifest.map(a=>`${a.file}: ${a.effect}`).join('\n'));
