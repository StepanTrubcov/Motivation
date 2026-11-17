import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const dir='output/rare-achievements-2026-10-26';
const jobs=JSON.parse(fs.readFileSync(path.join(dir,'sources.json')));
const manifest=[];
for(const j of jobs){
 const filename=`rare-${j.id}-v1.png`,out=path.join(dir,filename);
 await sharp(j.path).resize(1254,1254,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(out);
 const meta=await sharp(out).metadata();
 const stats=await sharp(out).stats();
 manifest.push({...j,file:filename,width:meta.width,height:meta.height,hasAlpha:meta.hasAlpha,opaque:stats.isOpaque});
}
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const cols=4,rows=Math.ceil(jobs.length/cols),cell=340,heading=62;
const canvas=createCanvas(cols*cell,heading+rows*390),ctx=canvas.getContext('2d');
ctx.fillStyle='#101314';ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.fillStyle='#edf2ef';ctx.font='bold 26px sans-serif';ctx.fillText('Редкие ачивки · варианты иллюстраций',22,39);
for(let i=0;i<manifest.length;i++){
 const j=manifest[i],x=i%cols*cell,y=heading+Math.floor(i/cols)*390;
 ctx.fillStyle='#1d2022';ctx.beginPath();ctx.roundRect(x+10,y+8,320,370,18);ctx.fill();
 const img=await loadImage(path.join(dir,j.file));ctx.drawImage(img,x+26,y+20,288,288);
 ctx.fillStyle='#ecf1ef';ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText(`${i+1}. ${j.title}`,x+170,y+336,304);
 ctx.fillStyle='#9bafd1';ctx.font='14px sans-serif';ctx.fillText('Редкая',x+170,y+361);ctx.textAlign='left';
}
fs.writeFileSync(path.join(dir,'all-rare-achievements.png'),canvas.toBuffer('image/png'));
console.log(manifest.map(j=>({id:j.id,size:`${j.width}x${j.height}`,alpha:j.hasAlpha,opaque:j.opaque})));
