import {definitions} from './ddl-content.mjs';
import {examples} from './dml-content.mjs';
export const ddlPages=definitions.flatMap((d,index)=>{
 const pages=Math.ceil(d.lines.length/16);
 return Array.from({length:pages},(_,part)=>({name:d.name,index,part,pages,sql:d.lines.slice(part*16,(part+1)*16).join('\n')}));
});
export const sqlSlideCount=ddlPages.length+examples.length;
export function createSqlBuilders({base,retitle,text,code,note,headings}){
 const ddl=ddlPages.map(d=>(p,n)=>{
  const label=`${d.name.toUpperCase()} (${d.index+1}/13)`+(d.pages>1?` · definition ${d.part+1} of ${d.pages}`:'');
  const s=base(p,headings.ddl,n,{sub:label.replace(' · ','  ')});retitle(s,headings.ddl);
  code(s,d.sql,66,188,1148,474,23);
  note(s,`Complete CREATE TABLE DDL for ${d.name}, copied from the implemented MySQL schema with whitespace reflowed for readability. ${d.pages>1?`This is part ${d.part+1} of ${d.pages}; read the next/previous part in sequence to form one complete statement.`:'All columns, key clauses, checks and indexes for this table are shown.'} Definitions follow foreign-key dependency order. Tables referenced here are defined earlier in the DDL section.`, 'database/01_schema.sql');
  return s;
 });
 const dml=examples.map((d,index)=>(p,n)=>{
  const s=base(p,headings.dml,n,{sub:d.name});
  code(s,d.sql,66,190,1148,407,24);
  text(s,d.caption,66,611,1148,54,22,false,'#60735E','dml-explanation');
  note(s,`Sample data sequence ${index+1} of ${examples.length}. Run these samples in order on a fresh demonstration database after loading 01_schema.sql and 02_logic.sql. Explicit IDs form one related sample dataset; they are not intended to be inserted again into the already seeded application. The bcrypt hash is for the public demonstration password Hostel@123. This is a small presentation dataset based on the application's seed values, not the full seed. Allocation, complaint creation and workflow calls reuse the application's stored procedures. COMPLAINT_LOG is populated by triggers, so manual log inserts are unnecessary. ${d.caption}`, 'database/01_schema.sql;database/02_logic.sql;backend/scripts/seed.js;docs/presentation/dml-content.mjs');
  return s;
 });
 return [...ddl,...dml];
}
