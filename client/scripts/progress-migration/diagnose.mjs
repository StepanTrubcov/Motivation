import fs from 'node:fs';
import dns from 'node:dns/promises';
import net from 'node:net';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
const local=dotenv.parse(fs.readFileSync('.env.local'));
dotenv.config({path:'.env.local',quiet:true});dotenv.config({quiet:true});
const url=new URL(process.env.DIRECT_DATABASE_URL);
console.log(JSON.stringify({host:url.hostname,port:url.port||5432,usesLocalConfig:local.DIRECT_DATABASE_URL===process.env.DIRECT_DATABASE_URL}));
console.log(JSON.stringify({addresses:await dns.lookup(url.hostname,{all:true}).catch(error=>({error:error.code}))}));
const tcp=await new Promise(resolve=>{
 const socket=net.connect({host:url.hostname,port:Number(url.port||5432)});socket.setTimeout(3000);
 socket.on('connect',()=>{socket.destroy();resolve({tcp:true})});socket.on('timeout',()=>{socket.destroy();resolve({tcp:false,error:'TIMEOUT'})});socket.on('error',error=>resolve({tcp:false,error:error.code}));
});console.log(JSON.stringify(tcp));
const db=new PrismaClient();
try {await db.$queryRaw`SELECT 1`;console.log(JSON.stringify({database:true}));}catch(error){console.log(JSON.stringify({database:false,error:error.code||error.errorCode}));}finally{await db.$disconnect();}
