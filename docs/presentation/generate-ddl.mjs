import fs from 'node:fs';
// Reflow only whitespace outside SQL strings. Keep every original DDL token.
const raw=fs.readFileSync(new URL('../../database/01_schema.sql',import.meta.url),'utf8');
function format(sql){
 const head=sql.indexOf('('),body=sql.slice(head+1,sql.lastIndexOf(')'));
 const clauses=[];let start=0,depth=0,quoted=false;
 for(let i=0;i<body.length;i++){
  const c=body[i];if(c==="'")quoted=!quoted;
  if(!quoted){if(c==='(')depth++;if(c===')')depth--;if(c===','&&depth===0){clauses.push(body.slice(start,i).trim()+',');start=i+1;}}
 }
 clauses.push(body.slice(start).trim());
 const lines=[sql.slice(0,head+1)];
 for(const clause of clauses){
  let line='  '+clause.replace(/\s+/g,' ');
  while(line.length>82){
   let quote=false,cut=-1;
   for(let i=0;i<Math.min(line.length,82);i++){if(line[i]==="'")quote=!quote;if(!quote&&(line[i]===' '||line[i]===','))cut=i+(line[i]===','?1:0);}
   if(cut<5)throw Error('Unbreakable DDL line: '+line);
   lines.push(line.slice(0,cut).trimEnd());line='    '+line.slice(cut).trimStart();
  }
  lines.push(line);
 }
 lines.push(');');return lines;
}
const definitions=[...raw.matchAll(/CREATE TABLE (\w+)\s*\([\s\S]*?\n\);/g)].map(m=>({name:m[1],sql:m[0],lines:format(m[0])}));
fs.writeFileSync(new URL('./ddl-content.mjs',import.meta.url),'// Generated from database/01_schema.sql by generate-ddl.mjs.\nexport const definitions = '+JSON.stringify(definitions,null,2)+';\n');
console.log(definitions.map(d=>`${d.name}: ${d.lines.length} lines, ${Math.ceil(d.lines.length/16)} slide(s)`).join('\n'));
