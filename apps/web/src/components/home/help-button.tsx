import { useState } from 'react';
import { HelpCircle, Send, X } from 'lucide-react';
import type { HelpMessage } from '@/data/icons';

export function HelpButton({ groupName, onSend }: { groupName: string; onSend: (message: HelpMessage) => void }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', group: groupName, contact: '', type: 'propuesta' as HelpMessage['type'], message: '' });
  function submit() {
    if (!form.message.trim()) return;
    onSend({ id: crypto.randomUUID(), ...form, group: form.group || groupName, message: form.message.trim(), status: 'pendiente', createdAt: new Date().toISOString() });
    setForm({ name: '', group: groupName, contact: '', type: 'propuesta', message: '' });
    setSent(true);
    setTimeout(() => setSent(false), 2400);
  }
  return <>
    <button className="help-fab" onClick={() => setOpen(true)} aria-label="Ayuda y propuestas"><HelpCircle size={24}/></button>
    {open && <div className="help-panel" role="dialog" aria-modal="true" aria-label="Enviar duda o propuesta"><div className="help-card"><div className="panel-heading"><div><span className="eyebrow">AYUDA</span><h3>Dudas o propuestas</h3></div><button className="icon-action" onClick={() => setOpen(false)} aria-label="Cerrar ayuda"><X size={19}/></button></div><label className="field"><span>Nombre</span><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label><label className="field"><span>Grupo</span><input value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}/></label><label className="field"><span>Contacto opcional</span><input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}/></label><label className="field"><span>Tipo de mensaje</span><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as HelpMessage['type'] })}>{['duda','propuesta','error','idea'].map(type => <option key={type}>{type}</option>)}</select></label><label className="field"><span>Mensaje</span><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Escribe lo que necesitas proponer o preguntar."/></label><button className="primary-btn full-btn" onClick={submit}><Send size={17}/> Enviar al admin</button>{sent && <p className="status-message">Mensaje guardado para revision del admin.</p>}</div></div>}
  </>;
}
