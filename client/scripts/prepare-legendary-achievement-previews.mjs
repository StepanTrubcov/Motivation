import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const dir='output/legendary-achievements-2026-10-26';
const jobs=JSON.parse(fs.readFileSync(path.join(dir,'sources.json')));
const manifest=[];
for(const j of jobs){
 const file=`legendary-${j.id}-v1.png`,out=path.join(dir,file);
 await sharp(j.path).resize(1254,1254,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(out);
 const m=await sharp(out).metadata(),s=await sharp(out).stats();
 if(m.width!==1254||m.height!==1254||!m.hasAlpha||s.isOpaque)throw Error(`Invalid image: ${j.title}`);
 manifest.push({...j,file,width:m.width,height:m.height,hasAlpha:m.hasAlpha});
}
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const cell=500,rowHeight=550,top=64,canvas=createCanvas(cell*2,top+rowHeight*2),ctx=canvas.getContext('2d');
ctx.fillStyle='#101314';ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.fillStyle='#edf2ef';ctx.font='bold 27px sans-serif';ctx.fillText('Легендарные ачивки',24,42);
for(let i=0;i<manifest.length;i++){
 const j=manifest[i],x=i%2*cell,y=top+Math.floor(i/2)*rowHeight;
 ctx.fillStyle='#1d2022';ctx.beginPath();ctx.roundRect(x+12,y+8,476,526,22);ctx.fill();
 const img=await loadImage(path.join(dir,j.file));ctx.drawImage(img,x+40,y+20,420,420);
 ctx.fillStyle='#edf2ef';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText(`${i+1}. ${j.title}`,x+250,y+478,448);
 ctx.fillStyle='#eac47b';ctx.font='18px sans-serif';ctx.fillText('Легендарная',x+250,y+510);ctx.textAlign='left';
}
fs.writeFileSync(path.join(dir,'all-legendary-achievements.png'),canvas.toBuffer('image/png'));
console.log(manifest.map(j=>({id:j.id,title:j.title,width:j.width,height:j.height,hasAlpha:j.hasAlpha})));
