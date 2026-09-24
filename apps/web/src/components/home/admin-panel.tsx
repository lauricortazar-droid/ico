import { Archive, ArrowDown, ArrowUp, Eye, EyeOff, Lock, Plus, Save, Trash2 } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { resourceIcons, type AdminFont, type AdminIdea, type AdminResource, type AdminSection, type AdminStore, type HelpMessage } from '@/data/icons';

type Collection = 'resources' | 'sections' | 'fonts' | 'ideas';

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

// Acceso local al panel admin. Solo protege la vista en el navegador (no hay backend
// real en esta exportación); cambia estas credenciales antes de publicar el sitio.
const ADMIN_USER = 'admin';
const ADMIN_PASS = '1234';

export function AdminLogin({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    if (user === ADMIN_USER && pass === ADMIN_PASS) { setError(''); onSuccess(); }
    else setError('Usuario o contraseña incorrectos.');
  }
  return <div className="workspace-wrap admin-page"><div className="workspace-intro"><span className="eyebrow">ADMIN / ACCESO</span><h2>Acceso privado<span className="gold-dot">.</span></h2><p>Esta sección es solo para el equipo administrador.</p></div>
    <form className="form-panel" onSubmit={submit} style={{ maxWidth: 360 }}>
      <div className="form-grid">
        <label className="field"><span>Usuario</span><input value={user} onChange={e => setUser(e.target.value)} autoComplete="username" autoFocus/></label>
        <label className="field"><span>Contraseña</span><input type="password" value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password"/></label>
      </div>
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="form-actions">
        <button className="primary-btn" type="submit"><Lock size={17}/> Entrar</button>
        <button className="secondary-btn" type="button" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  </div>;
}

export function AdminPanel({ store, onChange, onClose }: { store: AdminStore; onChange: (store: AdminStore) => void; onClose: () => void }) {
  function update<K extends Collection>(key: K, items: AdminStore[K]) { onChange({ ...store, [key]: items }); }
  function move<K extends Collection>(key: K, id: string, dir: -1 | 1) {
    const items = [...store[key]].sort((a, b) => a.order - b.order);
    const index = items.findIndex(item => item.id === id);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    update(key, items.map((item, order) => ({ ...item, order: order + 1 })) as AdminStore[K]);
  }
  function remove<K extends Collection>(key: K, id: string) { update(key, store[key].filter(item => item.id !== id) as AdminStore[K]); }
  function archive<K extends Collection>(key: K, id: string) { update(key, store[key].map(item => item.id === id ? { ...item, status: item.status === 'archived' ? 'visible' : 'archived' } : item) as AdminStore[K]); }
  function updateHelp(messages: HelpMessage[]) { onChange({ ...store, helpMessages: messages }); }
  return <div className="workspace-wrap admin-page"><div className="workspace-intro"><span className="eyebrow">ADMIN / CONFIGURACION</span><h2>Panel admin<span className="gold-dot">.</span></h2><p>Gestiona recursos, loguitos, ideas, secciones, tipografias y mensajes de ayuda. En esta exportacion se guarda en el navegador; al conectar backend se conserva el mismo flujo.</p></div>
    <div className="admin-grid">
      <ResourceAdmin items={store.resources} sections={store.sections} onItems={items => update('resources', items)} onMove={(id, dir) => move('resources', id, dir)} onArchive={id => archive('resources', id)} onRemove={id => remove('resources', id)}/>
      <SectionAdmin items={store.sections} onItems={items => update('sections', items)} onMove={(id, dir) => move('sections', id, dir)} onArchive={id => archive('sections', id)} onRemove={id => remove('sections', id)}/>
      <FontAdmin items={store.fonts} onItems={items => update('fonts', items)} onMove={(id, dir) => move('fonts', id, dir)} onArchive={id => archive('fonts', id)} onRemove={id => remove('fonts', id)}/>
      <IdeaAdmin items={store.ideas} onItems={items => update('ideas', items)} onMove={(id, dir) => move('ideas', id, dir)} onArchive={id => archive('ideas', id)} onRemove={id => remove('ideas', id)}/>
      <HelpInbox messages={store.helpMessages} onChange={updateHelp}/>
    </div>
    <button className="text-link" onClick={onClose}>Volver al editor →</button>
  </div>;
}

function AdminCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="admin-card"><div className="panel-heading"><div><span className="eyebrow">GESTION</span><h3>{title}</h3></div>{action}</div>{children}</section>;
}

function RowActions({ onMove, onArchive, onRemove }: { onMove: (dir: -1 | 1) => void; onArchive: () => void; onRemove: () => void }) {
  return <div className="row-actions"><button title="Subir" onClick={() => onMove(-1)}><ArrowUp size={15}/></button><button title="Bajar" onClick={() => onMove(1)}><ArrowDown size={15}/></button><button title="Archivar" onClick={onArchive}><Archive size={15}/></button><button title="Eliminar" onClick={onRemove}><Trash2 size={15}/></button></div>;
}

function ResourceAdmin({ items, sections, onItems, onMove, onArchive, onRemove }: { items: AdminResource[]; sections: AdminSection[]; onItems: (items: AdminResource[]) => void; onMove: (id: string, dir: -1 | 1) => void; onArchive: (id: string) => void; onRemove: (id: string) => void }) {
  const add = () => onItems([...items, { id: newId('recurso'), name: 'Nuevo recurso', kind: 'escudo', sectionId: sections[0]?.id || 'loguitos', description: '', tags: '', symbol: 'shield', order: items.length + 1, status: 'visible' }]);
  return <AdminCard title="Recursos y loguitos" action={<button className="icon-action" onClick={add} aria-label="Agregar recurso"><Plus size={19}/></button>}>{items.sort((a, b) => a.order - b.order).map(item => { const Icon = resourceIcons[item.symbol]; return <div className={`admin-row ${item.status === 'archived' ? 'is-archived' : ''}`} key={item.id}><Icon size={22}/><div className="admin-fields"><input value={item.name} onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}/><div className="admin-inline"><select value={item.kind} onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, kind: e.target.value as AdminResource['kind'] } : i))}>{['escudo','medallon','marco','sello','cinta','fondo','simbolo'].map(kind => <option key={kind}>{kind}</option>)}</select><select value={item.sectionId} onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, sectionId: e.target.value } : i))}>{sections.map(section => <option key={section.id} value={section.id}>{section.name}</option>)}</select><select value={item.symbol} onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, symbol: e.target.value as AdminResource['symbol'] } : i))}>{Object.keys(resourceIcons).map(symbol => <option key={symbol}>{symbol}</option>)}</select></div><textarea value={item.description} placeholder="Descripcion" onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))}/><input value={item.tags} placeholder="Tags" onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, tags: e.target.value } : i))}/></div><RowActions onMove={dir => onMove(item.id, dir)} onArchive={() => onArchive(item.id)} onRemove={() => onRemove(item.id)}/></div>; })}</AdminCard>;
}

function SectionAdmin({ items, onItems, onMove, onArchive, onRemove }: { items: AdminSection[]; onItems: (items: AdminSection[]) => void; onMove: (id: string, dir: -1 | 1) => void; onArchive: (id: string) => void; onRemove: (id: string) => void }) {
  const add = () => onItems([...items, { id: newId('seccion'), name: 'Nueva seccion', description: '', visible: true, order: items.length + 1, status: 'visible' }]);
  return <AdminCard title="Secciones" action={<button className="icon-action" onClick={add} aria-label="Agregar seccion"><Plus size={19}/></button>}>{items.sort((a, b) => a.order - b.order).map(item => <div className={`admin-row ${item.status === 'archived' ? 'is-archived' : ''}`} key={item.id}>{item.visible ? <Eye size={20}/> : <EyeOff size={20}/>}<div className="admin-fields"><input value={item.name} onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}/><textarea value={item.description} placeholder="Descripcion" onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))}/><label className="mini-toggle"><input type="checkbox" checked={item.visible} onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, visible: e.target.checked } : i))}/> Visible para usuarios</label></div><RowActions onMove={dir => onMove(item.id, dir)} onArchive={() => onArchive(item.id)} onRemove={() => onRemove(item.id)}/></div>)}</AdminCard>;
}

function FontAdmin({ items, onItems, onMove, onArchive, onRemove }: { items: AdminFont[]; onItems: (items: AdminFont[]) => void; onMove: (id: string, dir: -1 | 1) => void; onArchive: (id: string) => void; onRemove: (id: string) => void }) {
  const add = () => onItems([...items, { id: newId('fuente'), name: 'Nueva tipografia', use: '', defaultForGroupName: false, visible: true, order: items.length + 1, status: 'visible' }]);
  const setDefault = (id: string) => onItems(items.map(item => ({ ...item, defaultForGroupName: item.id === id })));
  return <AdminCard title="Tipografias" action={<button className="icon-action" onClick={add} aria-label="Agregar tipografia"><Plus size={19}/></button>}>{items.sort((a, b) => a.order - b.order).map(item => <div className={`admin-row ${item.status === 'archived' ? 'is-archived' : ''}`} key={item.id}><Save size={20}/><div className="admin-fields"><input value={item.name} onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}/><textarea value={item.use} placeholder="Uso recomendado" onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, use: e.target.value } : i))}/><label className="mini-toggle"><input type="checkbox" checked={item.defaultForGroupName} onChange={() => setDefault(item.id)}/> Predeterminada para nombre del grupo</label><label className="mini-toggle"><input type="checkbox" checked={item.visible} onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, visible: e.target.checked } : i))}/> Visible para usuarios</label></div><RowActions onMove={dir => onMove(item.id, dir)} onArchive={() => onArchive(item.id)} onRemove={() => onRemove(item.id)}/></div>)}</AdminCard>;
}

function IdeaAdmin({ items, onItems, onMove, onArchive, onRemove }: { items: AdminIdea[]; onItems: (items: AdminIdea[]) => void; onMove: (id: string, dir: -1 | 1) => void; onArchive: (id: string) => void; onRemove: (id: string) => void }) {
  const add = () => onItems([...items, { id: newId('idea'), title: 'Nueva idea', description: '', category: 'Logotipos', tags: '', suggestedResources: '', order: items.length + 1, status: 'visible' }]);
  return <AdminCard title="Ideas de iconos" action={<button className="icon-action" onClick={add} aria-label="Agregar idea"><Plus size={19}/></button>}>{items.sort((a, b) => a.order - b.order).map(item => <div className={`admin-row ${item.status === 'archived' ? 'is-archived' : ''}`} key={item.id}><Plus size={20}/><div className="admin-fields"><input value={item.title} onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, title: e.target.value } : i))}/><div className="admin-inline"><select value={item.category} onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, category: e.target.value as AdminIdea['category'] } : i))}>{['Eventos','Comunidad','Formacion','Institucional','Logotipos'].map(category => <option key={category}>{category}</option>)}</select><input value={item.tags} placeholder="Tags" onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, tags: e.target.value } : i))}/></div><textarea value={item.description} placeholder="Descripcion" onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))}/><input value={item.suggestedResources} placeholder="Recursos sugeridos" onChange={e => onItems(items.map(i => i.id === item.id ? { ...i, suggestedResources: e.target.value } : i))}/></div><RowActions onMove={dir => onMove(item.id, dir)} onArchive={() => onArchive(item.id)} onRemove={() => onRemove(item.id)}/></div>)}</AdminCard>;
}

function HelpInbox({ messages, onChange }: { messages: HelpMessage[]; onChange: (messages: HelpMessage[]) => void }) {
  return <AdminCard title="Dudas y propuestas">{messages.length ? messages.map(item => <div className={`admin-row ${item.status === 'archivado' ? 'is-archived' : ''}`} key={item.id}><Archive size={20}/><div className="admin-fields"><strong>{item.type}: {item.group || 'Sin grupo'}</strong><small>{item.name} · {item.contact || 'Sin contacto'} · {new Date(item.createdAt).toLocaleDateString('es-MX')}</small><p>{item.message}</p><select value={item.status} onChange={e => onChange(messages.map(m => m.id === item.id ? { ...m, status: e.target.value as HelpMessage['status'] } : m))}>{['pendiente','revisado','respondido','archivado'].map(status => <option key={status}>{status}</option>)}</select></div></div>) : <p className="muted-note">Aun no hay mensajes del boton de ayuda.</p>}</AdminCard>;
}
