import { useState, useEffect, useRef } from "react";

const Y = '#5e35b1', G = '#2ecc88', BK = '#161616', GR = '#5C5C5C';
const BG = '#F7F7F7', BR = '#E4E4E4', WH = '#ffffff';

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

async function sbGet(table, query = '') {
  const r = await fetch(`${SB_URL}/rest/v1/${table}${query}`, { headers: sbH });
  return r.json();
}
async function sbUpsert(table, data) {
  await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...sbH, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(data),
  });
}
async function sbPatch(table, id, data) {
  await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...sbH, 'Prefer': 'return=minimal' },
    body: JSON.stringify(data),
  });
}
async function sbDelete(table, id) {
  await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, { method: 'DELETE', headers: sbH });
}

const STATUS = {
  ns: { l: 'Neînceput', bg: '#F7F7F7', c: '#888', dot: '#D0D0D0' },
  il: { l: 'În lucru', bg: '#FFF9CC', c: '#7A6000', dot: '#f0c000' },
  bl: { l: 'Blocat', bg: '#FEE8E8', c: '#C0392B', dot: '#e74c3c' },
  dn: { l: 'Finalizat', bg: '#D5F5E3', c: '#0A6640', dot: G },
};

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fmtDate(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  const mn = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return `${parseInt(d)} ${mn[parseInt(m) - 1]} ${y}`;
}

const inpS = {
  width: '100%', padding: '7px 10px', borderRadius: 8, border: `1px solid ${BR}`,
  fontSize: 15, fontFamily: 'inherit', color: BK, background: WH, outline: 'none', boxSizing: 'border-box',
};

function Lbl({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: GR, marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>{children}</div>;
}

function Tag({ children, yellow }) {
  return <span style={{ fontSize: 13, padding: '2px 8px', borderRadius: 99, background: yellow ? '#FFF9CC' : BG, border: `1px solid ${BR}`, color: yellow ? '#7A6000' : GR, whiteSpace: 'nowrap' }}>{children}</span>;
}

function Btn({ children, onClick, ghost, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '5px 14px', borderRadius: 99, border: `1px solid ${ghost ? BR : 'transparent'}`,
      background: ghost ? WH : disabled ? '#ccc' : BK, color: ghost ? GR : WH,
      cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
    }}>{children}</button>
  );
}

function StepRow({ step, idx, open, onToggle, onUpdate, onDelete }) {
  const st = STATUS[step.status] || STATUS.ns;
  return (
    <div style={{ border: `1px solid ${open ? BK : BR}`, borderRadius: 10, overflow: 'hidden', marginBottom: 5, background: WH, transition: 'border-color .15s' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: open ? Y : BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: open ? WH : GR }}>{idx + 1}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.1 }}>{step.name}</div>
          {step.sub && <div style={{ fontSize: 14, color: GR, marginTop: 1 }}>{step.sub}</div>}
        </div>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 13, padding: '2px 8px', borderRadius: 99, background: st.bg, color: st.c, border: `1px solid ${BR}`, whiteSpace: 'nowrap', flexShrink: 0 }}>{st.l}</span>
        <button onClick={e => { e.stopPropagation(); if (window.confirm(`Ștergi categoria "${step.name}"?`)) onDelete(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#CCC', fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GR} strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${BR}`, padding: '14px', background: '#FAFAFA' }}>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Status</Lbl>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
              {Object.entries(STATUS).map(([k, v]) => (
                <button key={k} onClick={() => onUpdate({ status: k })} style={{
                  padding: '3px 9px', borderRadius: 99, border: `1px solid ${BR}`, cursor: 'pointer', fontSize: 13,
                  background: step.status === k ? BK : v.bg, color: step.status === k ? WH : v.c,
                  fontWeight: step.status === k ? 600 : 400, fontFamily: 'inherit',
                }}>{v.l}</button>
              ))}
            </div>
          </div>
          <div>
            <Lbl>Descriere</Lbl>
            {step._editing ? (
              <div>
                <textarea
                  autoFocus
                  value={step.notes || ''}
                  onChange={e => onUpdate({ notes: e.target.value })}
                  placeholder="Context, decizii, linkuri, observații..."
                  style={{ ...inpS, resize: 'none', overflow: 'hidden', minHeight: 60,
                    height: 'auto', display: 'block', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                  ref={el => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '6px 8px', background: '#f9f5ff', border: `1px solid ${BR}`, borderTop: `1px solid #e8d8fc`, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                  <button onClick={() => onUpdate({ _editing: false })} style={{ padding: '4px 12px', borderRadius: 99, border: `1px solid ${BR}`, background: WH, color: GR, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Anulează</button>
                  <button onClick={() => onUpdate({ _editing: false })} style={{ padding: '4px 12px', borderRadius: 99, border: 'none', background: Y, color: WH, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>Salvează</button>
                </div>
              </div>
            ) : (
              <div onClick={() => onUpdate({ _editing: true })} style={{
                fontSize: 16, lineHeight: 1.8, color: step.notes ? BK : GR,
                whiteSpace: 'pre-wrap', padding: '8px 10px', borderRadius: 8,
                border: `1px solid ${BR}`, background: WH, cursor: 'text', minHeight: 44,
              }}>
                {step.notes || 'Click pentru a edita...'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepsTab({ steps, openId, setOpenId, onUpdate, onAdd, onDelete, people }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSub, setNewSub] = useState('');
  const done = steps.filter(s => s.status === 'dn').length;
  const inProgress = steps.filter(s => s.status === 'il').length;
  const blocked = steps.filter(s => s.status === 'bl').length;

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd({ name: newName.trim(), sub: newSub.trim() });
    setNewName(''); setNewSub(''); setAdding(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 14, color: GR }}>{done}/{steps.length} categorii finalizate</span>
          <span style={{ fontSize: 14, color: GR }}>{inProgress} în lucru · <span style={{ color: blocked > 0 ? '#C0392B' : GR }}>{blocked} blocate</span></span>
        </div>
        <div style={{ height: 4, background: BR, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: Y, width: `${(done / steps.length) * 100}%`, transition: 'width .4s', borderRadius: 2 }} />
        </div>
      </div>
      {steps.map((s, i) => (
        <StepRow key={s.id} step={s} idx={i} open={openId === s.id}
          onToggle={() => setOpenId(openId === s.id ? null : s.id)}
          onUpdate={patch => onUpdate(s.id, patch)}
          onDelete={() => onDelete(s.id)} />
      ))}
      {adding ? (
        <div style={{ border: `1px solid ${BK}`, borderRadius: 10, padding: 13, marginTop: 6, background: '#FAFAFA' }}>
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Numele categoriei..." style={{ ...inpS, marginBottom: 8, fontSize: 13 }} />
          <input value={newSub} onChange={e => setNewSub(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Subtitlu (opțional)..." style={{ ...inpS, marginBottom: 10, fontSize: 12 }} />
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button onClick={() => { setAdding(false); setNewName(''); setNewSub(''); }} style={{ padding: '5px 14px', borderRadius: 99, border: `1px solid ${BR}`, background: WH, color: GR, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Anulează</button>
            <button onClick={handleAdd} disabled={!newName.trim()} style={{ padding: '5px 14px', borderRadius: 99, border: 'none', background: newName.trim() ? Y : '#ccc', color: WH, cursor: newName.trim() ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>Adaugă</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ width: '100%', marginTop: 6, padding: '8px 0', borderRadius: 10, border: `1px dashed #c4a8f0`, background: '#f9f5ff', color: Y, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 13px', border: `1px solid ${BR}`, borderRadius: 10, background: todo.done ? BG : WH, marginBottom: 5 }}>
      <button onClick={onToggle} style={{
        width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${todo.done ? G : BR}`,
        background: todo.done ? G : WH, cursor: 'pointer', flexShrink: 0, marginTop: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
      }}>
        {todo.done && <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" /></svg>}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, color: todo.done ? GR : BK, textDecoration: todo.done ? 'line-through' : 'none', lineHeight: 1.3 }}>{todo.title}</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {todo.assignee && <Tag>{todo.assignee}</Tag>}
          {step && <Tag yellow>{step.name}</Tag>}
          {todo.dueDate && <span style={{ fontSize: 13, color: over ? '#C0392B' : GR }}>{over ? '⚠ ' : ''}{fmtDate(todo.dueDate)}</span>}
        </div>
      </div>
      <button onClick={onDelete} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#CCC', fontSize: 16, lineHeight: 1, padding: '0 2px', marginTop: 1 }}>×</button>
    </div>
  );
}

function TodoForm({ steps, people, onSave, onCancel }) {
  const [t, setT] = useState({ title: '', assignee: '', stepId: '', dueDate: '' });
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div style={{ border: `1px solid ${BK}`, borderRadius: 10, padding: 13, marginBottom: 10, background: '#FAFAFA' }}>
      <input ref={ref} value={t.title} onChange={e => setT(p => ({ ...p, title: e.target.value }))}
        placeholder="Descrie task-ul..." style={{ ...inpS, marginBottom: 8, fontSize: 13 }}
        onKeyDown={e => e.key === 'Enter' && t.title.trim() && onSave(t)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <select value={t.assignee} onChange={e => setT(p => ({ ...p, assignee: e.target.value }))} style={{ ...inpS, height: 32, padding: '4px 8px' }}>
          <option value="">Assignee</option>
          {people.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={t.stepId} onChange={e => setT(p => ({ ...p, stepId: e.target.value }))} style={{ ...inpS, height: 32, padding: '4px 8px' }}>
          <option value="">Categorie (opțional)</option>
          {steps.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="date" value={t.dueDate} onChange={e => setT(p => ({ ...p, dueDate: e.target.value }))} style={{ ...inpS, maxWidth: 150, height: 32, padding: '4px 8px' }} />
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

  const shown = todos
    .filter(t => filter === 'all' ? true : filter === 'open' ? !t.done : t.done)
    .filter(t => catFilter === '' ? true : t.stepId === catFilter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['open', `Deschise${openCount > 0 ? ` (${openCount})` : ''}`], ['all', 'Toate'], ['done', 'Completate']].map(([f, l]) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 14,
              fontWeight: filter === f ? 600 : 400, background: filter === f ? BK : BG,
              color: filter === f ? WH : GR, fontFamily: 'inherit',
            }}>{l}</button>
          ))}
        </div>
        <Btn ghost={showForm} onClick={() => setShowForm(v => !v)}>{showForm ? 'Anulează' : '+ To-do'}</Btn>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setCatFilter('')} style={{
          padding: '3px 10px', borderRadius: 99, border: `1px solid ${catFilter === '' ? Y : BR}`,
          background: catFilter === '' ? '#f9f5ff' : WH, color: catFilter === '' ? Y : GR,
          cursor: 'pointer', fontSize: 14, fontWeight: catFilter === '' ? 600 : 400, fontFamily: 'inherit',
        }}>Toate categoriile</button>
        {steps.filter(s => todos.some(t => t.stepId === s.id)).map(s => (
          <button key={s.id} onClick={() => setCatFilter(catFilter === s.id ? '' : s.id)} style={{
            padding: '3px 10px', borderRadius: 99, border: `1px solid ${catFilter === s.id ? Y : BR}`,
            background: catFilter === s.id ? '#f9f5ff' : WH, color: catFilter === s.id ? Y : GR,
            cursor: 'pointer', fontSize: 14, fontWeight: catFilter === s.id ? 600 : 400, fontFamily: 'inherit',
          }}>{s.name}</button>
        ))}
      </div>

      {showForm && <TodoForm steps={steps} people={people} onSave={add} onCancel={() => setShowForm(false)} />}
      {shown.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', color: GR, fontSize: 16, padding: '48px 0' }}>
          {catFilter ? 'Niciun to-do în această categorie.' : filter === 'open' ? 'Niciun to-do deschis.' : filter === 'done' ? 'Niciun task completat.' : 'Niciun task adăugat.'}
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
  const months = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return (
    <div style={{ border: `1px solid ${BR}`, borderRadius: 10, background: WH, overflow: 'hidden', marginBottom: 6 }}>
      <div onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', cursor: 'pointer' }}>
        <div style={{ width: 38, textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{d.getDate()}</div>
          <div style={{ fontSize: 12, color: GR, textTransform: 'uppercase' }}>{months[d.getMonth()]}</div>
        </div>
        <div style={{ width: 1, height: 32, background: BR, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.1 }}>{minute.title}</div>
          {minute.participants?.length > 0 && <div style={{ fontSize: 14, color: GR, marginTop: 2 }}>{minute.participants.join(', ')}</div>}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 180 }}>
          {rel.slice(0, 3).map(s => <Tag key={s.id}>{s.name}</Tag>)}
          {rel.length > 3 && <Tag>+{rel.length - 3}</Tag>}
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GR} strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${BR}`, padding: '12px 14px', background: '#FAFAFA' }}>
          {minute.notes && <div style={{ marginBottom: 10 }}><Lbl>Note</Lbl><div style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: BK }}>{minute.notes}</div></div>}
          {decisions.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <Lbl>Decizii luate</Lbl>
              {decisions.map((dec, i) => (
                <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: G, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ fontSize: 15, lineHeight: 1.5, color: BK }}>{dec}</div>
                </div>
              ))}
            </div>
          )}
          {actions.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <Lbl>Acțiuni follow-up</Lbl>
              {actions.map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: Y, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ fontSize: 15, lineHeight: 1.5, color: BK }}>{act}</div>
                </div>
              ))}
            </div>
          )}
          <button onClick={onDelete} style={{ fontSize: 14, color: '#C0392B', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Șterge minuta</button>
        </div>
      )}
    </div>
  );
}

function MinuteForm({ steps, people, onSave, onCancel }) {
  const [m, setM] = useState({ title: '', date: today(), participants: [], stepIds: [], notes: '', decisions: '', actions: '' });
  const tog = (k, v) => setM(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }));
  return (
    <div style={{ border: `1px solid ${BK}`, borderRadius: 10, padding: 14, marginBottom: 12, background: '#FAFAFA' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 10 }}>
        <input value={m.title} onChange={e => setM(p => ({ ...p, title: e.target.value }))}
          placeholder="Titlu ședință..." style={{ ...inpS, fontSize: 13 }} autoFocus />
        <input type="date" value={m.date} onChange={e => setM(p => ({ ...p, date: e.target.value }))}
          style={{ ...inpS, width: 140 }} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <Lbl>Participanți</Lbl>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
          {people.map(p => (
            <button key={p} onClick={() => tog('participants', p)} style={{
              padding: '3px 10px', borderRadius: 99, border: `1px solid ${BR}`, cursor: 'pointer', fontSize: 14,
              background: m.participants.includes(p) ? BK : WH, color: m.participants.includes(p) ? WH : GR, fontFamily: 'inherit',
            }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <Lbl>Categorii discutate</Lbl>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
          {steps.map(s => (
            <button key={s.id} onClick={() => tog('stepIds', s.id)} style={{
              padding: '3px 9px', borderRadius: 99, border: `1px solid ${BR}`, cursor: 'pointer', fontSize: 13,
              background: m.stepIds.includes(s.id) ? BK : WH, color: m.stepIds.includes(s.id) ? WH : GR, fontFamily: 'inherit',
            }}>{s.name}</button>
          ))}
        </div>
      </div>
      <textarea value={m.notes} onChange={e => setM(p => ({ ...p, notes: e.target.value }))}
        placeholder="Note ședință..." rows={3} style={{ ...inpS, resize: 'vertical', marginBottom: 8 }} />
      <textarea value={m.decisions} onChange={e => setM(p => ({ ...p, decisions: e.target.value }))}
        placeholder="Decizii luate — câte una pe linie..." rows={2} style={{ ...inpS, resize: 'vertical', marginBottom: 8 }} />
      <textarea value={m.actions} onChange={e => setM(p => ({ ...p, actions: e.target.value }))}
        placeholder="Acțiuni / follow-up — câte una pe linie..." rows={2} style={{ ...inpS, resize: 'vertical', marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
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
        <span style={{ fontSize: 15, color: GR }}>{minutes.length} {minutes.length === 1 ? 'ședință' : 'ședințe'} înregistrate</span>
        <Btn ghost={showForm} onClick={() => setShowForm(v => !v)}>{showForm ? 'Anulează' : '+ Minute'}</Btn>
      </div>
      {showForm && <MinuteForm steps={steps} people={people} onSave={add} onCancel={() => setShowForm(false)} />}
      {minutes.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', color: GR, fontSize: 16, padding: '48px 0' }}>Nicio ședință înregistrată.</div>
      )}
      {minutes.map(m => <MinuteCard key={m.id} minute={m} steps={steps} onDelete={() => onDelete(m.id)} />)}
    </div>
  );
}

function TeamPopover({ people, onAdd, onClose }) {
  const [np, setNp] = useState('');
  const add = () => { if (np.trim()) { onAdd(np.trim()); setNp(''); } };
  return (
    <div style={{ position: 'absolute', top: 48, right: 0, width: 210, background: WH, border: `1px solid ${BR}`, borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,.1)', zIndex: 200, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 12 }}>Echipă</span>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: GR, fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      {people.map((p, i) => (
        <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid ${BG}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: GR }}>{p[0]}</div>
            <span style={{ fontSize: 12 }}>{p}</span>
          </div>
          {i >= PPL_DEF.length && <button onClick={() => setPeople(prev => prev.filter(x => x !== p))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#CCC', fontSize: 14 }}>×</button>}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <input value={np} onChange={e => setNp(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Adaugă persoană..." style={{ ...inpS, flex: 1, height: 30, padding: '4px 8px', fontSize: 11 }} />
        <button onClick={add} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: BK, color: WH, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit' }}>+</button>
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

  // Load all data from Supabase
  useEffect(() => {
    (async () => {
      try {
        const [s, t, m, p] = await Promise.all([
          sbGet('hub_steps', '?order=sort_order'),
          sbGet('hub_todos', '?order=created_at'),
          sbGet('hub_minutes', '?order=date.desc'),
          sbGet('hub_people', '?order=sort_order'),
        ]);
        if (Array.isArray(s) && s.length) {
          setSteps(s.map(x => ({ ...x, notes: x.description || '' })));
        } else {
          setError('Categoriile nu au putut fi încărcate: ' + JSON.stringify(s));
          setSteps(STEPS_DEF.map(s => ({ ...s, notes: '', status: 'ns' })));
        }
        if (Array.isArray(t)) setTodos(t.map(x => ({ ...x, stepId: x.step_id, dueDate: x.due_date })));
        if (Array.isArray(m)) setMinutes(m.map(x => ({ ...x, stepIds: x.step_ids || [] })));
        if (Array.isArray(p) && p.length) setPeople(p.map(x => x.name));
      } catch (e) {
        setError('Eroare conexiune: ' + e.message);
        setSteps(STEPS_DEF.map(s => ({ ...s, notes: '', status: 'ns' })));
      }
      setLoaded(true);
    })();
  }, []);

  // Update step in Supabase
  const updStep = async (id, patch) => {
    setSteps(p => p.map(s => s.id === id ? { ...s, ...patch } : s));
    setSaved(false);
    const sbPatch2 = { ...patch, updated_at: new Date().toISOString() };
    if (patch.notes !== undefined) { sbPatch2.description = patch.notes; delete sbPatch2.notes; }
    delete sbPatch2._editing;
    await sbPatch('hub_steps', id, sbPatch2);
    setSaved(true);
  };

  // Todo operations
  const addTodo = async (t) => {
    const todo = {
      id: uid(), done: false,
      title: t.title, assignee: t.assignee,
      step_id: t.stepId || null,
      due_date: t.dueDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTodos(p => [{ ...todo, stepId: t.stepId, dueDate: t.dueDate }, ...p]);
    await sbUpsert('hub_todos', todo);
  };
  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    const done = !todo.done;
    setTodos(p => p.map(t => t.id === id ? { ...t, done } : t));
    await sbPatch('hub_todos', id, { done, updated_at: new Date().toISOString() });
  };
  const deleteTodo = async (id) => {
    setTodos(p => p.filter(t => t.id !== id));
    await sbDelete('hub_todos', id);
  };

  // Minute operations
  const addMinute = async (m) => {
    const minute = {
      ...m,
      id: uid(),
      step_ids: m.stepIds || [],
      created_at: new Date().toISOString()
    };
    delete minute.stepIds;
    setMinutes(p => [{ ...minute, stepIds: m.stepIds || [] }, ...p]);
    await sbUpsert('hub_minutes', minute);
  };
  const deleteMinute = async (id) => {
    setMinutes(p => p.filter(m => m.id !== id));
    await sbDelete('hub_minutes', id);
  };

  // People operations
  const addPerson = async (name) => {
    if (!name.trim() || people.includes(name.trim())) return;
    const n = name.trim();
    setPeople(p => [...p, n]);
    await sbUpsert('hub_people', { id: uid(), name: n, sort_order: people.length });
  };

  const deleteStep = async (id) => {
    setSteps(p => p.filter(s => s.id !== id));
    await sbDelete('hub_steps', id);
  };

  const addStep = async ({ name, sub }) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + uid();
    const newStep = { id, name, sub, status: 'ns', notes: '', sort_order: steps.length };
    setSteps(p => [...p, newStep]);
    await sbUpsert('hub_steps', { id, name, sub, status: 'ns', description: '', sort_order: steps.length, updated_at: new Date().toISOString() });
  };

  const openCount = todos.filter(t => !t.done).length;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: WH, color: BK, minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#5e35b1', borderBottom: `1px solid #4a2899`, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, height: 46 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-.3px', color: 'white' }}>SOLT Hub</span>
        </div>
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ display: 'flex', gap: 2 }}>
          {[['steps', 'Categorii'], ['todos', openCount > 0 ? `To-dos (${openCount})` : 'To-dos'], ['minutes', 'Minute']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '3px 11px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 14,
              fontWeight: tab === id ? 600 : 400,
              background: tab === id ? 'rgba(255,255,255,0.22)' : 'transparent',
              color: 'white', fontFamily: 'inherit', transition: 'all .1s',
            }}>{l}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          {loaded && (
            <span style={{ fontSize: 13, color: saved ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 3 }}>
              {saved ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>salvat</> : 'salvare...'}
            </span>
          )}
          <button onClick={() => setShowTeam(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99,
            border: '1px solid rgba(255,255,255,0.25)',
            background: showTeam ? 'rgba(255,255,255,0.22)' : 'transparent',
            color: 'white', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" />
            </svg>
            Echipă
          </button>
          {showTeam && <TeamPopover people={people} onAdd={addPerson} onClose={() => setShowTeam(false)} />}
        </div>
      </div>
      <div style={{ padding: 16, maxWidth: 740, margin: '0 auto' }}>
        {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: '#FEE8E8', border: '1px solid #F5C6C6', borderRadius: 8, fontSize: 15, color: '#C0392B' }}>⚠ {error}</div>}
        {!loaded && <div style={{ textAlign: 'center', color: GR, padding: '60px 0', fontSize: 13 }}>Se încarcă...</div>}
        {loaded && tab === 'steps' && <StepsTab steps={steps} openId={openStep} setOpenId={setOpenStep} onUpdate={updStep} onAdd={addStep} onDelete={deleteStep} people={people} />}
        {loaded && tab === 'todos' && <TodosTab todos={todos} onAdd={addTodo} onToggle={toggleTodo} onDelete={deleteTodo} steps={steps} people={people} />}
        {loaded && tab === 'minutes' && <MinutesTab minutes={minutes} onAdd={addMinute} onDelete={deleteMinute} steps={steps} people={people} />}
      </div>
    </div>
  );
}
