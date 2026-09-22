import { test } from 'node:test';
import assert from 'node:assert/strict';
import { number, courseResult, semesterResult } from '../dist/calculations.mjs';
test('los campos vacíos no son cero, y se rechazan valores fuera de escala',()=>{
  for(const value of ['', ' ',null,undefined,-1,101,Infinity,'abc',false]) assert.equal(number(value,100),null);
  assert.equal(number('0',100),0);
});
const evaluation=(weight,grade)=>({name:'Actividad',weight,grade,kind:'expected'});
test('un curso requiere el 100 % y todas las calificaciones, incluido cero explícito',()=>{
  assert.equal(courseResult([evaluation(40,80),evaluation(60,90)]).value,86);
  assert.equal(courseResult([evaluation(40,80),evaluation(60,'')]).value,null);
  assert.equal(courseResult([evaluation(40,80),evaluation(60,0)]).value,32);
  assert.equal(courseResult([evaluation(70,80),evaluation(60,90)]).value,null);
  assert.equal(courseResult([evaluation(40,80)]).value,null);
  assert.ok(Math.abs(courseResult([evaluation(33.3,90),evaluation(33.3,90),evaluation(33.4,90)]).value-90)<1e-10);
});
const uf=(credits,grade)=>({name:'UF',code:'ABC',credits,grade,kind:'expected'});
test('promedio de la referencia: 1691/18, y UF de cero créditos no alteran el resultado',()=>{
  const rows=[[3,95],[1,96],[1,96],[1,94],[1,91],[1,99],[3,94],[1,99],[3,90],[3,93]].map(([c,g])=>uf(c,g));
  assert.equal(semesterResult(rows).value,1691/18);
  assert.equal(semesterResult([...rows,uf(0,'')]).value,1691/18);
  assert.equal(semesterResult([...rows,uf(3,'')]).value,null);
  assert.equal(semesterResult([uf(0,'')]).value,null);
  assert.equal(semesterResult([uf(3,0),uf(1,100)]).value,25);
});
