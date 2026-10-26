// Check the diagram relationship manifest against the actual CREATE TABLE DDL.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {relationships} from './er-diagrams.mjs';
const schema=fs.readFileSync(new URL('../../database/01_schema.sql',import.meta.url),'utf8');
const tables=[...schema.matchAll(/CREATE TABLE (\w+)\s*\(([\s\S]*?)\n\);/g)];
const actual=[];
for(const [,name,body] of tables){
 for(const [,col,parent,key] of body.matchAll(/FOREIGN KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)\((\w+)\)/g)){
  const decl=body.match(new RegExp('(?:^|,)\\s*'+col+'\\s+(?:INT\\b|VARCHAR\\(\\d+\\))([^,]*)','i'));
  assert(decl,`Missing column ${name}.${col}`);
  const nullable=!/NOT NULL|PRIMARY KEY/i.test(decl[1]);
  const unique=/PRIMARY KEY|UNIQUE/i.test(decl[1]) || new RegExp('(?:UNIQUE(?: KEY \\w+)?|PRIMARY KEY)\\s*\\(\\s*'+col+'\\s*\\)','i').test(body);
  actual.push([name,col,parent,key,nullable?'0..1':'1',unique?'0..1':'0..*']);
 }
}
const expected=relationships.map(([t,c,p,k,s,min,max])=>[t,c,p,k,min,max]);
const sort=rows=>rows.map(r=>r.join('|')).sort();
assert.equal(tables.length,13);
assert.equal(actual.length,18);
assert.equal(new Set(expected.map(r=>r.slice(0,4).join('|'))).size,18);
assert.deepEqual(sort(expected),sort(actual));
assert.deepEqual([...new Set(relationships.flatMap(r=>[r[0],r[2]]))].sort(),tables.map(t=>t[1]).sort());
console.log('PASS: 13 entities; all 18 foreign keys represented exactly once; optionality and maximum cardinalities match DDL.');
for(const r of relationships)console.log(`Slide ${r[4]}: ${r[0]}.${r[1]} -> ${r[2]}.${r[3]} | parent ${r[5]}, children ${r[6]}`);
