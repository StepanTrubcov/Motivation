import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { ACHIEVEMENT_TEMPLATES } from '../src/lib/achievementTemplates.mjs';
const root=process.cwd();
const output=path.join(root,'public/Image/achievements/animated');
fs.mkdirSync(output,{recursive:true});
const manifest=[];
for(const item of ACHIEVEMENT_TEMPLATES.filter(a=>a.rarity==='common')) {
 const input=path.join(root,'public',item.image);
 const img=await loadImage(input);
 const width=img.width,height=img.height;
 const dir=fs.mkdtempSync('/tmp/achievement-gif-');
 const canvas=createCanvas(width,height); const ctx=canvas.getContext('2d');
 for(let i=0;i<24;i++) {
  const phase=i/24*Math.PI*2;
  ctx.clearRect(0,0,width,height);
  ctx.save();
  ctx.translate(width/2+Math.round(Math.sin(phase)*3),height/2+Math.round(Math.cos(phase)*6));
  ctx.scale(0.97,0.97);
  ctx.drawImage(img,-width/2,-height/2,width,height);
  ctx.restore();
  fs.writeFileSync(path.join(dir,`${String(i).padStart(3,'0')}.png`),canvas.toBuffer('image/png'));
 }
 const filename=`common-${item.id}-v1.gif`;
 const destination=path.join(output,filename);
 const webp=destination.replace(/\.gif$/, '.webp');
 const ff=fs.existsSync(destination) ? {status:0} : spawnSync('/opt/homebrew/bin/ffmpeg',['-hide_banner','-loglevel','error','-framerate','10','-i',path.join(dir,'%03d.png'),'-filter_complex','[0:v]split[a][b];[a]palettegen=reserve_transparent=1:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:alpha_threshold=100','-loop','0','-gifflags','+transdiff',destination],{encoding:'utf8'});
 if(ff.status!==0) throw Error(ff.stderr);
 if(!fs.existsSync(webp)) {
  const encoded=spawnSync('/opt/homebrew/bin/ffmpeg',['-hide_banner','-loglevel','error','-framerate','10','-i',path.join(dir,'%03d.png'),'-c:v','libwebp_anim','-quality','75','-compression_level','5','-loop','0',webp],{encoding:'utf8'});
  if(encoded.status!==0) throw Error(encoded.stderr);
 }
 const probe=spawnSync('/opt/homebrew/bin/ffprobe',['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=width,height,nb_read_frames','-of','json',destination],{encoding:'utf8'});
 const stream=JSON.parse(probe.stdout).streams[0];
 if(stream.width!==width||stream.height!==height||Number(stream.nb_read_frames)!==24) throw Error('GIF validation failed');
 for(const f of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir,f)); fs.rmdirSync(dir);
 const entry={id:item.id,title:item.title,image:item.image,gif:`/Image/achievements/animated/${filename}`,width,height,frames:24,bytes:fs.statSync(destination).size};
 entry.animation=entry.gif.replace(/\.gif$/, '.webp'); entry.animationBytes=fs.statSync(webp).size;
 manifest.push(entry);console.log(JSON.stringify(entry));
}
fs.writeFileSync('src/lib/common-achievement-animations.json',JSON.stringify(manifest,null,2)+'\n');
