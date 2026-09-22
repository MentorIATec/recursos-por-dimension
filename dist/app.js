import { number, courseResult, semesterResult } from './calculations.mjs';
import { withdrawals, billing } from './reference-data.mjs';
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let nextId = 1;
const blankEvaluation = () => ({ name:'', weight:'', grade:'', kind:'expected' });
const blankCourse = () => ({ id:nextId++, name:'', code:'', credits:'', evaluations:[blankEvaluation(),blankEvaluation(),blankEvaluation()] });
const courses = [blankCourse()];
let selectedId = courses[0].id;
const semester = [];
const current = () => courses.find(c => c.id === selectedId);
const fmt = value => value.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2});
function kindSelect(value) { return `<option value="expected" ${value==='expected'?'selected':''}>Esperada</option><option value="obtained" ${value==='obtained'?'selected':''}>Obtenida</option>`; }
function navigate() {
  const id = location.hash.slice(1);
  const target = ['curso','semestre','costos','becas','bajas'].includes(id) ? id : 'curso';
  document.querySelectorAll('.module').forEach(s => s.hidden = s.id !== target);
  document.querySelectorAll('nav a').forEach(a => { const active = a.hash === `#${target}`; a.classList.toggle('active', active); if(active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
}
addEventListener('hashchange', navigate);
navigate();
function picker() {
  $('#course-picker').replaceChildren(...courses.map((c,i) => new Option(c.name || `UF ${i+1} · por completar`, c.id, false, c.id === selectedId)));
}
function renderCourse() {
  const c = current(); picker();
  for (const field of ['name','code','credits']) $(`#course-${field}`).value = c[field];
  $('#evaluations').innerHTML = c.evaluations.map((e,i) => `<div class="evaluation" data-index="${i}">
    <label class="field">Componente ${i+1}<input data-field="name" value="${escapeHTML(e.name)}" maxlength="100" placeholder="Ej. Proyecto final"></label>
    <label class="field">Peso (%)<input data-field="weight" aria-label="Peso del componente ${i+1} (%)" type="number" min="0" max="100" step="any" value="${escapeHTML(e.weight)}" placeholder="0–100"></label>
    <label class="field">Calificación<input data-field="grade" aria-label="Calificación del componente ${i+1}" type="number" min="0" max="100" step="any" value="${escapeHTML(e.grade)}" placeholder="0–100"></label>
    <label class="field">Tipo<select data-field="kind" aria-label="Tipo de calificación del componente ${i+1}">${kindSelect(e.kind)}</select></label>
    <button class="remove" aria-label="Eliminar componente ${i+1}" data-remove="${i}">×</button></div>`).join('');
  updateCourse();
}
function validateNumbers(root) {
  root.querySelectorAll('input[type=number]').forEach(input => input.setAttribute('aria-invalid', input.validity.badInput || (input.value !== '' && !input.validity.valid) ? 'true' : 'false'));
}
function updateCourse() {
  const c = current(), result = courseResult(c.evaluations);
  const invalidInput = [...$('#evaluations').querySelectorAll('input')].some(i => !i.validity.valid);
  const complete = result.complete && !invalidInput;
  $('#weight-total').textContent = `${Number(result.total.toFixed(6))} / 100 %`;
  $('#weight-progress').value = Math.min(result.total,100);
  $('#course-result').textContent = complete ? fmt(result.value) : '—';
  $('#course-status').textContent = complete ? `Escenario completo: ${result.expected} componente(s) con calificación esperada. Modifica tus expectativas para explorar otro resultado.` : result.total > 100.000001 ? 'La ponderación supera 100 %. Revisa los porcentajes con tu plan de evaluación.' : 'Completa los componentes con notas de 0 a 100 y ponderaciones que sumen 100 % para obtener un aproximado.';
  const metadata = c.name.trim() && c.code.trim() && number(c.credits,100) !== null && $('#course-credits').validity.valid;
  $('#to-semester').disabled = !complete || !metadata;
  if(complete && !metadata) $('#course-status').textContent += ' Para usarlo en el semestre, completa nombre, clave y créditos.';
  validateNumbers($('#curso'));
}
for (const field of ['name','code','credits']) $(`#course-${field}`).addEventListener('input', event => { current()[field] = event.target.value; if(field==='name') picker(); updateCourse(); });
$('#course-picker').addEventListener('change', event => { selectedId=Number(event.target.value); renderCourse(); });
$('#new-course').addEventListener('click', () => { const c=blankCourse(); courses.push(c); selectedId=c.id; renderCourse(); $('#course-name').focus(); });
$('#add-evaluation').addEventListener('click', () => { current().evaluations.push(blankEvaluation()); renderCourse(); $('#evaluations').lastElementChild.querySelector('input').focus(); });
$('#evaluations').addEventListener('input', event => { const row=event.target.closest('[data-index]'); if(!row || !event.target.dataset.field) return; current().evaluations[Number(row.dataset.index)][event.target.dataset.field]=event.target.value; updateCourse(); });
$('#evaluations').addEventListener('click', event => { const button=event.target.closest('[data-remove]'); if(!button) return; current().evaluations.splice(Number(button.dataset.remove),1); renderCourse(); $('#add-evaluation').focus(); });
$('#to-semester').addEventListener('click', () => {
  const c=current(), result=courseResult(c.evaluations);
  if(!result.complete || $('#to-semester').disabled) return;
  const entry = {source:c.id,name:c.name,code:c.code,credits:c.credits,grade:String(result.value),kind:'expected'};
  const existing=semester.findIndex(r => r.source===c.id);
  if(existing>=0) semester[existing]=entry; else semester.push(entry);
  $('#all-courses').checked=false;
  renderSemester(); location.hash='semestre';
});
function renderSemester() {
  $('#semester-rows').innerHTML = semester.length ? semester.map((r,i) => `<div class="semester-row" data-index="${i}">
    <label class="field row-name">Nombre de la UF ${i+1}<input data-field="name" maxlength="100" value="${escapeHTML(r.name)}" placeholder="Consulta tu horario"></label>
    <button class="remove" data-remove="${i}" aria-label="Eliminar UF ${i+1}">×</button>
    <label class="field">Clave<input data-field="code" maxlength="25" value="${escapeHTML(r.code)}" placeholder="Consulta SAMP"></label>
    <label class="field">Créditos<input data-field="credits" aria-label="Créditos de UF ${i+1}" type="number" min="0" max="100" step="any" value="${escapeHTML(r.credits)}" placeholder="Sin completar"></label>
    <label class="field">Calificación<input data-field="grade" aria-label="Calificación de UF ${i+1}" type="number" min="0" max="100" step="any" value="${escapeHTML(r.grade)}" placeholder="0–100"></label>
    <label class="field">Tipo<select data-field="kind" aria-label="Tipo de calificación de UF ${i+1}">${kindSelect(r.kind)}</select></label>
  </div>`).join('') : '<p class="scope">Aún no has agregado UF. Comienza con tu horario a la mano o trae un escenario desde “Simula una UF”.</p>';
  updateSemester();
}
function updateSemester() {
  const r=semesterResult(semester), invalidInput=[...$('#semester-rows').querySelectorAll('input')].some(i => !i.validity.valid);
  const complete=r.complete && !invalidInput;
  $('#semester-result').textContent = complete ? fmt(r.value) : '—';
  $('#semester-credits').textContent = String(Number(r.credits.toFixed(6)));
  $('#semester-result-label').textContent = $('#all-courses').checked ? 'ESCENARIO DEL SEMESTRE' : 'ESCENARIO DE LAS UF CAPTURADAS';
  $('#semester-status').textContent = complete ? `${r.expected} UF con calificación esperada. ${$('#all-courses').checked ? 'Lista contrastada con tu horario.' : 'Promedio parcial de tu lista. Confirma que incluiste todas tus UF antes de considerarlo un escenario del semestre.'}` : 'Agrega y completa tus UF. Usa créditos válidos y calificaciones entre 0 y 100. Debe haber al menos un crédito para calcular; no se omiten filas incompletas.';
  validateNumbers($('#semestre'));
}
$('#add-semester').addEventListener('click', () => { semester.push({name:'',code:'',credits:'',grade:'',kind:'expected'}); $('#all-courses').checked=false; renderSemester(); $('#semester-rows').lastElementChild.querySelector('input').focus(); });
$('#all-courses').addEventListener('change', updateSemester);
$('#semester-rows').addEventListener('input', event => { const row=event.target.closest('[data-index]'); if(!row || !event.target.dataset.field) return; const field=event.target.dataset.field; semester[Number(row.dataset.index)][field]=event.target.value; if(['name','code','credits'].includes(field)) $('#all-courses').checked=false; updateSemester(); });
$('#semester-rows').addEventListener('click', event => { const button=event.target.closest('[data-remove]'); if(!button) return; semester.splice(Number(button.dataset.remove),1); $('#all-courses').checked=false; renderSemester(); $('#add-semester').focus(); });
function updateCost() {
  const price=number($('#credit-price').value), credits=number($('#cost-credits').value,100);
  const valid=price!==null && credits!==null && $('#credit-price').validity.valid && $('#cost-credits').validity.valid && Number.isFinite(price*credits);
  $('#cost-result').textContent=valid ? (price*credits).toLocaleString('es-MX',{style:'currency',currency:'MXN'}) : '—';
  $('#cost-status').textContent=valid ? 'MXN · Créditos × tarifa capturada. Consulta el estado de cuenta para conocer el importe oficial.' : 'Completa ambos campos con valores válidos, iguales o mayores a cero.';
  validateNumbers($('#costos'));
}
$('#credit-price').addEventListener('input',updateCost); $('#cost-credits').addEventListener('input',updateCost);
withdrawals.forEach((r,i) => $('#withdraw-course').add(new Option(`${r[0]} · ${r[1]}`,String(i))));
$('#withdraw-course').addEventListener('change', e => { const r=withdrawals[e.target.value]; $('#withdraw-date').textContent=r ? r[2] : '—'; $('#withdraw-status').textContent=r ? 'Fecha límite indicada en la tabla proporcionada. Confirma su aplicabilidad antes de solicitar la baja.' : 'Consulta el inicio y duración de tu UF.'; });
Object.keys(billing).forEach(key => $('#billing-period').add(new Option(key,key)));
function nextDay(date) { const [d,m,y]=date.split('/').map(Number); const dt=new Date(Date.UTC(y,m-1,d+1)); return `${String(dt.getUTCDate()).padStart(2,'0')}/${String(dt.getUTCMonth()+1).padStart(2,'0')}/${dt.getUTCFullYear()}`; }
$('#billing-period').addEventListener('change', e => {
  const rows=billing[e.target.value];
  $('#billing-table').innerHTML=rows ? `<div class="table-wrap"><table><caption>${escapeHTML(e.target.value)} · Fechas inclusivas · 2026</caption><thead><tr><th>Fecha efectiva de baja</th><th>Cobro</th></tr></thead><tbody>${rows.map(([date,rate],i) => `<tr><td>${i===0 ? `Hasta ${date}` : date ? `${nextDay(rows[i-1][0])} al ${date}` : `Desde ${nextDay(rows[i-1][0])}`}</td><td>${rate} %</td></tr>`).join('')}</tbody></table></div>` : '<p class="helper">Selecciona una parte de periodo para consultar su tabla.</p>';
});
renderCourse(); renderSemester();
// API de lectura opcional. Usa exactamente el mismo estado que los simuladores visibles.
if(document.modelContext?.registerTool) {
  const controller=new AbortController();
  try { Promise.resolve(document.modelContext.registerTool({
    name:'read_academic_simulations',title:'Leer escenarios académicos',description:'Lee los resultados actuales de la UF seleccionada y del semestre, sin modificar datos. Los resultados son aproximados y no representan políticas del curso.',
    inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},
    execute(input){ if(!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Se requiere un objeto vacío.'); return {course:courseResult(current().evaluations),semester:semesterResult(semester),allCoursesConfirmed:$('#all-courses').checked}; }
  },{signal:controller.signal})).catch(()=>{}); } catch { /* El simulador no depende de esta API. */ }
  addEventListener('pagehide',()=>controller.abort(),{once:true});
}
