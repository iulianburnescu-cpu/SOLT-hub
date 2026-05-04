import { useState, useEffect, useRef } from "react";

const P    = '#7c5cbf';
const PD   = '#5e35b1';
const G    = '#2ecc88';
const BG   = '#0a0a0f';
const S1   = '#13131f';
const S2   = '#1c1c2e';
const BD   = '#262640';
const BDA  = '#5e35b1';
const TX   = '#e8e8f2';
const TX2  = '#7878a8';
const TX3  = '#3a3a58';
const RD   = '#e74c3c';
const YL   = '#f0c000';

const STATUS = {
  ns: { l: 'Neînceput', bg: 'transparent', c: TX2, dot: TX3, border: BD },
  il: { l: 'În lucru', bg: 'rgba(240,192,0,.08)', c: '#f0c000', dot: '#f0c000', border: 'rgba(240,192,0,.3)' },
  bl: { l: 'Blocat', bg: 'rgba(231,76,60,.08)', c: '#e74c3c', dot: '#e74c3c', border: 'rgba(231,76,60,.3)' },
  dn: { l: 'Finalizat', bg: 'rgba(46,204,136,.08)', c: '#2ecc88', dot: '#2ecc88', border: 'rgba(46,204,136,.3)' },
};

const STEPS_DEF = [
  { id: 'site', name: 'Site SOLT', sub: 'Landing + conversie' },
  { id: 'infiintare', name: 'Înființare', sub: 'PFA nou pentru șofer' },
  { id: 'onboarding', name: 'Onboarding', sub: 'Reprezentare + ARR' },
  { id: 'venituri', name: 'Venituri', sub: 'Bolt API / FONOA' },
  { id: 'crm', name: 'CRM SOLT', sub: 'Date client separate de SOLO' },
  { id: 'conturi', name: 'Conturi active', sub: 'Stripe · cont.solt.ro' },
  { id: 'comunicare', name: 'Comunicare', sub: 'FOX proactivă + VOX suport' },
  { id: 'interfata', name: 'Interfață', sub: 'Falcon SOLT' },
  { id: 'contabilitate', name: 'Contabilitate', sub: 'Conta + Declarații' },
  { id: 'du', name: 'Declarația Unică', sub: 'Flux separat de Bolt' },
  { id: 'crm-intern', name: 'CRM Intern', sub: 'Separat de JEDI' },
];

const PPL_DEF = ['Iulian', 'Ana', 'Bogdan', 'Gogu'];

const SB_URL = 'https://xitueflkxiipppxkwbpz.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpdHVlZmxreGlpcHBweGt3YnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4Mzk5OTIsImV4cCI6MjA5MjQxNTk5Mn0.8YrQe9VZMFVRD-3gSg5J2Z7mc2mhfGPT9PQGEKh91zg';
const sbH = { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' };

async function sbGet(table, query = '') { const r = await fetch(`${SB_URL}/rest/v1/${table}${query}`, { headers: sbH }); return r.json(); }
async function sbUpsert(table, data) { await fetch(`${SB_URL}/rest/v1/${table}`, { method: 'POST', headers: { ...sbH, 'Prefer': 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(data) }); }
async function sbPatch(table, id, data) { await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, { method: 'PATCH', headers: { ...sbH, 'Prefer': 'return=minimal' }, body: JSON.stringify(data) }); }
async function sbDelete(table, id) { await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, { method: 'DELETE', headers: sbH }); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function fmtDate(s) { if (!s) return ''; const [y,m,d]=s.split('-'); const mn=['ian','feb','mar','apr','mai','iun','iul','aug','sep','oct','nov','dec']; return `${parseInt(d)} ${mn[parseInt(m)-1]} ${y}`; }

const inpS = { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${BD}`, fontSize: 14, fontFamily: 'inherit', color: TX, background: S2, outline: 'none', boxSizing: 'border-box' };

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${BG}; color: ${TX}; font-family: 'Syne', sans-serif; }
  ::selection { background: rgba(124,92,191,.35); }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${S1}; } ::-webkit-scrollbar-thumb { background: ${BD}; border-radius: 2px; }
  input, textarea, select, button { font-family: 'Syne', sans-serif; }
  input::placeholder, textarea::placeholder { color: ${TX3}; }
  select option { background: ${S2}; color: ${TX}; }
`;

function Lbl({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: TX3, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>{children}</div>;
}

function Tag({ children, yellow, violet }) {
  const bg = yellow ? 'rgba(240,192,0,.1)' : violet ? 'rgba(124,92,191,.15)' : 'rgba(255,255,255,.04)';
  const cl = yellow ? YL : violet ? P : TX2;
  const br = yellow ? 'rgba(240,192,0,.25)' : violet ? 'rgba(124,92,191,.3)' : BD;
  return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: bg, border: `1px solid ${br}`, color: cl, whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>;
}

function Pill({ children, active, onClick }) {
  return <button onClick={onClick} style={{ padding: '4px 14px', borderRadius: 99, border: `1px solid ${active ? PD : BD}`, background: active ? 'rgba(94,53,177,.25)' : 'transparent', color: active ? P : TX2, cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 400, fontFamily: 'inherit', transition: 'all .15s' }}>{children}</button>;
}

function Btn({ children, onClick, ghost, disabled, sm }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: sm ? '4px 12px' : '6px 16px', borderRadius: 8, border: ghost ? `1px solid ${BD}` : 'none', background: ghost ? 'transparent' : disabled ? TX3 : PD, color: ghost ? TX2 : 'white', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: sm ? 12 : 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .15s' }}>{children}</button>;
}

function StepRow({ step, idx, open, onToggle, onUpdate, onDelete }) {
  const st = STATUS[step.status] || STATUS.ns;
  return (
    <div style={{ border: `1px solid ${open ? BDA : BD}`, borderRadius: 10, overflow: 'hidden', marginBottom: 4, background: open ? S2 : S1, boxShadow: open ? '0 0 0 1px rgba(94,53,177,.2), 0 4px 20px rgba(0,0,0,.3)' : 'none', transition: 'all .2s' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: open ? PD : 'transparent', border: `1px solid ${open ? PD : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: open ? 'white' : TX3, fontFamily: "'JetBrains Mono', monospace" }}>{String(idx+1).padStart(2,'0')}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: TX, lineHeight: 1.2 }}>{step.name}</div>
          {step.sub && <div style={{ fontSize: 12, color: TX2, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{step.sub}</div>}
        </div>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: st.bg, color: st.c, border: `1px solid ${st.border}`, whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600 }}>{st.l}</span>
        <button onClick={e => { e.stopPropagation(); if (window.confirm(`Ștergi "${step.name}"?`)) onDelete(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: TX3, fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0, transition: 'color .15s' }} onMouseEnter={e => e.target.style.color=RD} onMouseLeave={e => e.target.style.color=TX3}>×</button>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${BD}`, padding: '16px 14px' }}>
          <div style={{ marginBottom: 16 }}>
            <Lbl>Status</Lbl>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(STATUS).map(([k, v]) => (
                <button key={k} onClick={() => onUpdate({ status: k })} style={{ padding: '4px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, border: `1px solid ${step.status === k ? v.border : BD}`, background: step.status === k ? v.bg : 'transparent', color: step.status === k ? v.c : TX3, transition: 'all .15s' }}>{v.l}</button>
              ))}
            </div>
          </div>
          <div>
            <Lbl>Descriere</Lbl>
            {step._editing ? (
              <div>
                <textarea autoFocus value={step.notes || ''} onChange={e => onUpdate({ notes: e.target.value })} placeholder="Context, decizii, linkuri, observații..." style={{ ...inpS, resize: 'none', overflow: 'hidden', minHeight: 80, display: 'block', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none', lineHeight: 1.7 }} ref={el => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '8px 10px', background: 'rgba(94,53,177,.08)', border: `1px solid ${BD}`, borderTop: '1px solid rgba(94,53,177,.2)', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                  <Btn ghost sm onClick={() => onUpdate({ _editing: false })}>Anulează</Btn>
                  <Btn sm onClick={() => onUpdate({ _editing: false })}>Salvează</Btn>
                </div>
              </div>
            ) : (
              <div onClick={() => onUpdate({ _editing: true })} style={{ fontSize: 14, lineHeight: 1.8, color: step.notes ? TX : TX3, whiteSpace: 'pre-wrap', padding: '10px 12px', borderRadius: 8, border: `1px solid ${BD}`, background: S1, cursor: 'text', minHeight: 48, transition: 'border-color .15s' }} onMouseEnter={e => e.currentTarget.style.borderColor=TX3} onMouseLeave={e => e.currentTarget.style.borderColor=BD}>
                {step.notes || 'Click pentru a edita...'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepsTab({ steps, openId, setOpenId, onUpdate, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSub, setNewSub] = useState('');
  const done = steps.filter(s => s.status === 'dn').length;
  const inProgress = steps.filter(s => s.status === 'il').length;
  const blocked = steps.filter(s => s.status === 'bl').length;
  const pct = steps.length ? (done / steps.length) * 100 : 0;
  const handleAdd = () => { if (!newName.trim()) return; onAdd({ name: newName.trim(), sub: newSub.trim() }); setNewName(''); setNewSub(''); setAdding(false); };
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: TX2, fontFamily: "'JetBrains Mono', monospace" }}>{done}/{steps.length} categorii finalizate</span>
          <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: YL }}>{inProgress} în lucru</span><span style={{ color: TX3 }}> · </span><span style={{ color: blocked > 0 ? RD : TX3 }}>{blocked} blocate</span>
          </span>
        </div>
        <div style={{ height: 2, background: BD, borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${PD}, ${P})`, width: `${pct}%`, transition: 'width .5s', borderRadius: 1, boxShadow: `0 0 8px ${P}` }} />
        </div>
      </div>
      {steps.map((s, i) => (
        <StepRow key={s.id} step={s} idx={i} open={openId === s.id} onToggle={() => setOpenId(openId === s.id ? null : s.id)} onUpdate={patch => onUpdate(s.id, patch)} onDelete={() => onDelete(s.id)} />
      ))}
      {adding ? (
        <div style={{ border: `1px solid ${BDA}`, borderRadius: 10, padding: 14, marginTop: 6, background: S2, boxShadow: '0 0 0 1px rgba(94,53,177,.2)' }}>
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Numele categoriei..." style={{ ...inpS, marginBottom: 8 }} />
          <input value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Subtitlu (opțional)..." style={{ ...inpS, marginBottom: 12, fontSize: 13, color: TX2 }} />
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <Btn ghost onClick={() => { setAdding(false); setNewName(''); setNewSub(''); }}>Anulează</Btn>
            <Btn onClick={handleAdd} disabled={!newName.trim()}>Adaugă</Btn>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ width: '100%', marginTop: 6, padding: '10px 0', borderRadius: 10, border: `1px dashed ${BD}`, background: 'transparent', color: TX3, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor=P; e.currentTarget.style.color=P; }} onMouseLeave={e => { e.currentTarget.style.borderColor=BD; e.currentTarget.style.color=TX3; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adaugă categorie
        </button>
      )}
    </div>
  );
}

function TodoItem({ todo, steps, onToggle, onDelete }) {
  const step = steps.find(s => s.id === todo.stepId);
  const over = todo.dueDate && !todo.done && todo.dueDate < today();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', border: `1px solid ${todo.done ? TX3 : BD}`, borderRadius: 10, background: todo.done ? 'transparent' : S1, marginBottom: 4, opacity: todo.done ? .45 : 1, transition: 'all .15s' }}>
      <button onClick={onToggle} style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${todo.done ? G : TX3}`, background: todo.done ? G : 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'all .15s' }}>
        {todo.done && <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke={BG} strokeWidth="2.2" strokeLinecap="round" /></svg>}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: TX, textDecoration: todo.done ? 'line-through' : 'none', lineHeight: 1.4 }}>{todo.title}</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          {todo.assignee && <Tag>{todo.assignee}</Tag>}
          {step && <Tag violet>{step.name}</Tag>}
          {todo.dueDate && <span style={{ fontSize: 11, color: over ? RD : TX3, fontFamily: "'JetBrains Mono', monospace" }}>{over ? '⚠ ' : ''}{fmtDate(todo.dueDate)}</span>}
        </div>
      </div>
      <button onClick={onDelete} style={{ border: 'none', background: 'none', cursor: 'pointer', color: TX3, fontSize: 18, lineHeight: 1, padding: '0 2px', marginTop: 1, transition: 'color .15s' }} onMouseEnter={e => e.target.style.color=RD} onMouseLeave={e => e.target.style.color=TX3}>×</button>
    </div>
  );
}

function TodoForm({ steps, people, onSave, onCancel }) {
  const [t, setT] = useState({ title: '', assignee: '', stepId: '', dueDate: '' });
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div style={{ border: `1px solid ${BDA}`, borderRadius: 10, padding: 14, marginBottom: 10, background: S2, boxShadow: '0 0 0 1px rgba(94,53,177,.15)' }}>
      <input ref={ref} value={t.title} onChange={e => setT(p => ({ ...p, title: e.target.value }))} placeholder="Descrie task-ul..." style={{ ...inpS, marginBottom: 10, fontSize: 15 }} onKeyDown={e => e.key === 'Enter' && t.title.trim() && onSave(t)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <select value={t.assignee} onChange={e => setT(p => ({ ...p, assignee: e.target.value }))} style={{ ...inpS, height: 36, padding: '6px 10px' }}>
          <option value="">Assignee</option>
          {people.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={t.stepId} onChange={e => setT(p => ({ ...p, stepId: e.target.value }))} style={{ ...inpS, height: 36, padding: '6px 10px' }}>
          <option value="">Categorie (opțional)</option>
          {steps.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="date" value={t.dueDate} onChange={e => setT(p => ({ ...p, dueDate: e.target.value }))} style={{ ...inpS, maxWidth: 160, height: 36, padding: '6px 10px', colorScheme: 'dark' }} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <Btn ghost onClick={onCancel}>Anulează</Btn>
          <Btn onClick={() => t.title.trim() && onSave(t)} disabled={!t.title.trim()}>Adaugă</Btn>
        </div>
      </div>
    </div>
  );
}

function TodosTab({ todos, onAdd, onToggle, onDelete, steps, people }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('open');
  const [catFilter, setCatFilter] = useState('');
  const add = t => { onAdd(t); setShowForm(false); };
  const openCount = todos.filter(t => !t.done).length;
  const shown = todos.filter(t => filter === 'all' ? true : filter === 'open' ? !t.done : t.done).filter(t => catFilter === '' ? true : t.stepId === catFilter);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <Pill active={filter==='open'} onClick={() => setFilter('open')}>{openCount > 0 ? `Deschise (${openCount})` : 'Deschise'}</Pill>
          <Pill active={filter==='all'} onClick={() => setFilter('all')}>Toate</Pill>
          <Pill active={filter==='done'} onClick={() => setFilter('done')}>Completate</Pill>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, border: `1px solid ${showForm ? BDA : BD}`, background: showForm ? 'rgba(94,53,177,.15)' : 'transparent', color: showForm ? P : TX2, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all .15s' }}>
          {showForm ? '× Anulează' : '+ To-do'}
        </button>
      </div>
      {steps.filter(s => todos.some(t => t.stepId === s.id)).length > 0 && (
        <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
          <Pill active={catFilter===''} onClick={() => setCatFilter('')}>Toate</Pill>
          {steps.filter(s => todos.some(t => t.stepId === s.id)).map(s => (
            <Pill key={s.id} active={catFilter===s.id} onClick={() => setCatFilter(catFilter===s.id ? '' : s.id)}>{s.name}</Pill>
          ))}
        </div>
      )}
      {showForm && <TodoForm steps={steps} people={people} onSave={add} onCancel={() => setShowForm(false)} />}
      {shown.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', color: TX3, fontSize: 13, padding: '60px 0', fontFamily: "'JetBrains Mono', monospace" }}>
          {catFilter ? '// niciun task în această categorie' : filter==='open' ? '// niciun task deschis' : filter==='done' ? '// niciun task completat' : '// niciun task adăugat'}
        </div>
      )}
      {shown.map(t => <TodoItem key={t.id} todo={t} steps={steps} onToggle={() => onToggle(t.id)} onDelete={() => onDelete(t.id)} />)}
    </div>
  );
}

function MinuteCard({ minute, steps, onDelete }) {
  const [open, setOpen] = useState(false);
  const rel = steps.filter(s => minute.stepIds?.includes(s.id));
  const decisions = minute.decisions?.split('\n').filter(d => d.trim()) || [];
  const actions = minute.actions?.split('\n').filter(a => a.trim()) || [];
  const d = new Date(minute.date + 'T12:00:00');
  const months = ['ian','feb','mar','apr','mai','iun','iul','aug','sep','oct','nov','dec'];
  return (
    <div style={{ border: `1px solid ${open ? BDA : BD}`, borderRadius: 10, background: open ? S2 : S1, overflow: 'hidden', marginBottom: 4, transition: 'all .2s' }}>
      <div onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer' }}>
        <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 40 }}>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: TX, fontFamily: "'JetBrains Mono', monospace" }}>{d.getDate()}</div>
          <div style={{ fontSize: 9, color: TX3, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>{months[d.getMonth()]}</div>
        </div>
        <div style={{ width: 1, height: 36, background: BD, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: TX }}>{minute.title}</div>
          {minute.participants?.length > 0 && <div style={{ fontSize: 12, color: TX2, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{minute.participants.join(' · ')}</div>}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 200 }}>
          {rel.slice(0,3).map(s => <Tag key={s.id}>{s.name}</Tag>)}
          {rel.length > 3 && <Tag>+{rel.length-3}</Tag>}
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TX3} strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${BD}`, padding: '14px' }}>
          {minute.notes && <div style={{ marginBottom: 14 }}><Lbl>Note</Lbl><div style={{ fontSize: 14, lineHeight: 1.75, color: TX2, whiteSpace: 'pre-wrap' }}>{minute.notes}</div></div>}
          {decisions.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <Lbl>Decizii luate</Lbl>
              {decisions.map((dec, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: G, marginTop: 6, flexShrink: 0, boxShadow: `0 0 6px ${G}` }} />
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: TX }}>{dec}</div>
                </div>
              ))}
            </div>
          )}
          {actions.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <Lbl>Acțiuni follow-up</Lbl>
              {actions.map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: YL, marginTop: 6, flexShrink: 0, boxShadow: `0 0 6px ${YL}` }} />
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: TX }}>{act}</div>
                </div>
              ))}
            </div>
          )}
          <button onClick={onDelete} style={{ fontSize: 12, color: TX3, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, transition: 'color .15s' }} onMouseEnter={e => e.target.style.color=RD} onMouseLeave={e => e.target.style.color=TX3}>Șterge minuta</button>
        </div>
      )}
    </div>
  );
}

function MinuteForm({ steps, people, onSave, onCancel }) {
  const [m, setM] = useState({ title: '', date: today(), participants: [], stepIds: [], notes: '', decisions: '', actions: '' });
  const tog = (k, v) => setM(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }));
  return (
    <div style={{ border: `1px solid ${BDA}`, borderRadius: 10, padding: 16, marginBottom: 12, background: S2, boxShadow: '0 0 0 1px rgba(94,53,177,.15)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 12 }}>
        <input value={m.title} onChange={e => setM(p => ({ ...p, title: e.target.value }))} placeholder="Titlu ședință..." style={{ ...inpS, fontSize: 15 }} autoFocus />
        <input type="date" value={m.date} onChange={e => setM(p => ({ ...p, date: e.target.value }))} style={{ ...inpS, width: 150, colorScheme: 'dark' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <Lbl>Participanți</Lbl>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
          {people.map(p => <Pill key={p} active={m.participants.includes(p)} onClick={() => tog('participants', p)}>{p}</Pill>)}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Lbl>Categorii discutate</Lbl>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
          {steps.map(s => <Pill key={s.id} active={m.stepIds.includes(s.id)} onClick={() => tog('stepIds', s.id)}>{s.name}</Pill>)}
        </div>
      </div>
      {[['notes','Note...',3],['decisions','Decizii luate — câte una pe linie...',2],['actions','Acțiuni / follow-up — câte una pe linie...',2]].map(([k,ph,rows]) => (
        <textarea key={k} value={m[k]} onChange={e => setM(p => ({ ...p, [k]: e.target.value }))} placeholder={ph} rows={rows} style={{ ...inpS, resize: 'vertical', marginBottom: 8, lineHeight: 1.6 }} />
      ))}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
        <Btn ghost onClick={onCancel}>Anulează</Btn>
        <Btn onClick={() => m.title.trim() && onSave(m)} disabled={!m.title.trim()}>Salvează</Btn>
      </div>
    </div>
  );
}

function MinutesTab({ minutes, onAdd, onDelete, steps, people }) {
  const [showForm, setShowForm] = useState(false);
  const add = m => { onAdd(m); setShowForm(false); };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: TX3, fontFamily: "'JetBrains Mono', monospace" }}>{minutes.length} {minutes.length === 1 ? 'ședință' : 'ședințe'} înregistrate</span>
        <button onClick={() => setShowForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, border: `1px solid ${showForm ? BDA : BD}`, background: showForm ? 'rgba(94,53,177,.15)' : 'transparent', color: showForm ? P : TX2, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all .15s' }}>
          {showForm ? '× Anulează' : '+ Minute'}
        </button>
      </div>
      {showForm && <MinuteForm steps={steps} people={people} onSave={add} onCancel={() => setShowForm(false)} />}
      {minutes.length === 0 && !showForm && <div style={{ textAlign: 'center', color: TX3, fontSize: 13, padding: '60px 0', fontFamily: "'JetBrains Mono', monospace" }}>// nicio ședință înregistrată</div>}
      {minutes.map(m => <MinuteCard key={m.id} minute={m} steps={steps} onDelete={() => onDelete(m.id)} />)}
    </div>
  );
}

function TeamPopover({ people, onAdd, onClose }) {
  const [np, setNp] = useState('');
  const add = () => { if (np.trim()) { onAdd(np.trim()); setNp(''); } };
  return (
    <div style={{ position: 'absolute', top: 48, right: 0, width: 220, background: S2, border: `1px solid ${BD}`, borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,.4)', zIndex: 200, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: TX }}>Echipă</span>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: TX3, fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      {people.map(p => (
        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${BD}` }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(94,53,177,.2)', border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: P }}>{p[0]}</div>
          <span style={{ fontSize: 13, color: TX }}>{p}</span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <input value={np} onChange={e => setNp(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Adaugă..." style={{ ...inpS, flex: 1, height: 32, padding: '4px 8px', fontSize: 12 }} />
        <button onClick={add} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: PD, color: 'white', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>+</button>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('steps');
  const [steps, setSteps] = useState([]);
  const [todos, setTodos] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [people, setPeople] = useState(PPL_DEF);
  const [openStep, setOpenStep] = useState(null);
  const [showTeam, setShowTeam] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, t, m, p] = await Promise.all([sbGet('hub_steps','?order=sort_order'), sbGet('hub_todos','?order=created_at'), sbGet('hub_minutes','?order=date.desc'), sbGet('hub_people','?order=sort_order')]);
        if (Array.isArray(s) && s.length) setSteps(s.map(x => ({ ...x, notes: x.description || '' })));
        else { setError('Categoriile nu au putut fi încărcate: ' + JSON.stringify(s)); setSteps(STEPS_DEF.map(s => ({ ...s, notes: '', status: 'ns' }))); }
        if (Array.isArray(t)) setTodos(t.map(x => ({ ...x, stepId: x.step_id, dueDate: x.due_date })));
        if (Array.isArray(m)) setMinutes(m.map(x => ({ ...x, stepIds: x.step_ids || [] })));
        if (Array.isArray(p) && p.length) setPeople(p.map(x => x.name));
      } catch (e) { setError('Eroare conexiune: ' + e.message); setSteps(STEPS_DEF.map(s => ({ ...s, notes: '', status: 'ns' }))); }
      setLoaded(true);
    })();
  }, []);

  const updStep = async (id, patch) => {
    setSteps(p => p.map(s => s.id === id ? { ...s, ...patch } : s));
    setSaved(false);
    const p2 = { ...patch, updated_at: new Date().toISOString() };
    if (patch.notes !== undefined) { p2.description = patch.notes; delete p2.notes; }
    delete p2._editing;
    await sbPatch('hub_steps', id, p2);
    setSaved(true);
  };

  const addTodo = async (t) => {
    const todo = { id: uid(), done: false, title: t.title, assignee: t.assignee, step_id: t.stepId || null, due_date: t.dueDate || null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setTodos(p => [{ ...todo, stepId: t.stepId, dueDate: t.dueDate }, ...p]);
    await sbUpsert('hub_todos', todo);
  };
  const toggleTodo = async (id) => { const todo = todos.find(t => t.id === id); const done = !todo.done; setTodos(p => p.map(t => t.id === id ? { ...t, done } : t)); await sbPatch('hub_todos', id, { done, updated_at: new Date().toISOString() }); };
  const deleteTodo = async (id) => { setTodos(p => p.filter(t => t.id !== id)); await sbDelete('hub_todos', id); };

  const addMinute = async (m) => {
    const minute = { ...m, id: uid(), step_ids: m.stepIds || [], created_at: new Date().toISOString() };
    delete minute.stepIds;
    setMinutes(p => [{ ...minute, stepIds: m.stepIds || [] }, ...p]);
    await sbUpsert('hub_minutes', minute);
  };
  const deleteMinute = async (id) => { setMinutes(p => p.filter(m => m.id !== id)); await sbDelete('hub_minutes', id); };

  const addPerson = async (name) => {
    if (!name.trim() || people.includes(name.trim())) return;
    const n = name.trim();
    setPeople(p => [...p, n]);
    await sbUpsert('hub_people', { id: uid(), name: n, sort_order: people.length });
  };

  const deleteStep = async (id) => { setSteps(p => p.filter(s => s.id !== id)); await sbDelete('hub_steps', id); };

  const addStep = async ({ name, sub }) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + uid();
    const newStep = { id, name, sub, status: 'ns', notes: '', sort_order: steps.length };
    setSteps(p => [...p, newStep]);
    await sbUpsert('hub_steps', { id, name, sub, status: 'ns', description: '', sort_order: steps.length, updated_at: new Date().toISOString() });
  };

  const openCount = todos.filter(t => !t.done).length;

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: "'Syne', sans-serif", background: BG, color: TX, minHeight: '100vh', position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,15,.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${BD}`, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, height: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${PD}, #9c27b0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(94,53,177,.5)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-.5px', color: TX }}>SOLT <span style={{ color: P }}>Hub</span></span>
          </div>
          <div style={{ width: 1, height: 20, background: BD }} />
          <div style={{ display: 'flex', gap: 2 }}>
            {[['steps','Categorii'],['todos', openCount > 0 ? `To-dos (${openCount})` : 'To-dos'],['minutes','Minute']].map(([id,l]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: '4px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab===id ? 700 : 400, background: tab===id ? 'rgba(124,92,191,.2)' : 'transparent', color: tab===id ? P : TX2, fontFamily: 'inherit', transition: 'all .15s' }}>{l}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            {loaded && (
              <span style={{ fontSize: 11, color: saved ? G : TX3, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: saved ? G : TX3, boxShadow: saved ? `0 0 6px ${G}` : 'none' }} />
                {saved ? 'salvat' : 'salvare...'}
              </span>
            )}
            <button onClick={() => setShowTeam(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, border: `1px solid ${showTeam ? BDA : BD}`, background: showTeam ? 'rgba(94,53,177,.2)' : 'transparent', color: showTeam ? P : TX2, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all .15s' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" /></svg>
              Echipă
            </button>
            {showTeam && <TeamPopover people={people} onAdd={addPerson} onClose={() => setShowTeam(false)} />}
          </div>
        </div>
        <div style={{ padding: '20px', maxWidth: 760, margin: '0 auto' }}>
          {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(231,76,60,.1)', border: '1px solid rgba(231,76,60,.3)', borderRadius: 8, fontSize: 13, color: RD }}>⚠ {error}</div>}
          {!loaded && <div style={{ textAlign: 'center', color: TX3, padding: '80px 0', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>// se încarcă...</div>}
          {loaded && tab === 'steps' && <StepsTab steps={steps} openId={openStep} setOpenId={setOpenStep} onUpdate={updStep} onAdd={addStep} onDelete={deleteStep} people={people} />}
          {loaded && tab === 'todos' && <TodosTab todos={todos} onAdd={addTodo} onToggle={toggleTodo} onDelete={deleteTodo} steps={steps} people={people} />}
          {loaded && tab === 'minutes' && <MinutesTab minutes={minutes} onAdd={addMinute} onDelete={deleteMinute} steps={steps} people={people} />}
        </div>
      </div>
    </>
  );
}
