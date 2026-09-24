import { useState } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import { icons } from '@/data/icons';

export function Catalog({ onSelect }: { onSelect: (key: string) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const filtered = icons.filter(icon => (category === 'Todos' || icon.category === category) && icon.name.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
  return <section className="catalog-section">
    <div className="section-heading"><div><span className="eyebrow">BIBLIOTECA / 01</span><h2>Elige un icono<span className="gold-dot">.</span></h2><p>Un lenguaje visual para comunicar con claridad.</p></div><span className="count">{String(icons.length).padStart(2, '0')} símbolos</span></div>
    <div className="catalog-tools"><label className="search-box"><Search size={19}/><span className="sr-only">Buscar iconos</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar un icono..." /></label><div className="segments" aria-label="Categorías">{['Todos','Eventos','Comunidad','Formación','Institucional'].map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div></div>
    {filtered.length ? <div className="icon-grid">{filtered.map(({ key, name, category: group, Icon }, i) => <button key={key} className="icon-tile" onClick={() => onSelect(key)} aria-label={`Editar icono ${name}`}><span className="tile-number">{String(icons.findIndex(item => item.key === key) + 1).padStart(2, '0')}</span><Icon className="tile-symbol" strokeWidth={1.55}/><span className="tile-bottom"><span><strong>{name}</strong><small>{group}</small></span><ArrowUpRight size={17}/></span></button>)}</div> : <div className="empty-state">No hay iconos que coincidan con tu búsqueda.</div>}
  </section>;
}
