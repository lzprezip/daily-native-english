import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Check, ChevronLeft, ChevronRight, Headphones, Search, Shuffle, Sparkles, Volume2 } from 'lucide-react'
import { categories, expressions } from './data/expressions'

const categoryNames = { All: '全部', 'Daily Life': '日常', Feelings: '情绪', Social: '社交', Work: '工作' }

function loadSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')) } catch { return new Set() }
}

export default function App() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [current, setCurrent] = useState(0)
  const [saved, setSaved] = useState(() => loadSet('dne-saved'))
  const [learned, setLearned] = useState(() => loadSet('dne-learned'))

  const results = useMemo(() => expressions.filter(item => {
    const inCategory = category === 'All' || item.category === category
    const term = query.trim().toLowerCase()
    return inCategory && (!term || `${item.expression} ${item.meaning} ${item.usage}`.toLowerCase().includes(term))
  }), [category, query])

  useEffect(() => setCurrent(0), [category, query])
  const item = results[current]
  const save = (key, set, updater, id) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    updater(next)
    localStorage.setItem(key, JSON.stringify([...next]))
  }
  const speak = text => {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'; utterance.rate = .88
    speechSynthesis.speak(utterance)
  }
  const move = step => setCurrent(index => (index + step + results.length) % results.length)
  const random = () => setCurrent(Math.floor(Math.random() * results.length))

  return <div className="site-shell">
    <header>
      <a className="brand" href="#top" aria-label="Daily Native English 首页"><span>D</span> Daily Native English</a>
      <div className="header-note"><Sparkles size={16} /> 100 个母语者高频表达</div>
    </header>

    <main id="top">
      <section className="hero">
        <p className="eyebrow">SPEAK LESS LIKE A TEXTBOOK</p>
        <h1>每天一句，<em>说得更自然。</em></h1>
        <p className="intro">精选美国日常英语中的真实表达。听、读、理解，再把它变成你自己的语言。</p>
        <div className="progress-wrap">
          <div className="progress-copy"><span>你的学习进度</span><strong>{learned.size} / 100</strong></div>
          <div className="progress"><span style={{ width: `${learned.size}%` }} /></div>
        </div>
      </section>

      <section className="toolbar" aria-label="筛选表达">
        <div className="categories">
          {categories.map(name => <button key={name} className={category === name ? 'active' : ''} onClick={() => setCategory(name)}>{categoryNames[name]} <small>{name === 'All' ? expressions.length : expressions.filter(x => x.category === name).length}</small></button>)}
        </div>
        <label className="search"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索表达或中文含义…" /></label>
      </section>

      {item ? <section className="practice-card">
        <div className="card-meta"><span>#{String(item.id).padStart(3, '0')}</span><span className="pill">{categoryNames[item.category]}</span></div>
        <div className="phrase-row">
          <div><p className="label">TODAY’S EXPRESSION</p><h2>{item.expression}</h2></div>
          <button className="round" onClick={() => speak(item.expression)} aria-label="朗读表达"><Volume2 /></button>
        </div>
        <p className="meaning">{item.meaning}</p>
        <div className="explanation"><span>什么时候用</span><p>{item.usage}</p></div>
        <div className="example">
          <Headphones size={20} />
          <div><span>听听它怎么说</span><p>“{item.example.sentence}”</p></div>
          <button onClick={() => speak(item.example.sentence)}>播放</button>
        </div>
        <div className="card-actions">
          <button className={saved.has(item.id) ? 'selected' : ''} onClick={() => save('dne-saved', saved, setSaved, item.id)}><Bookmark size={18} fill={saved.has(item.id) ? 'currentColor' : 'none'} /> {saved.has(item.id) ? '已收藏' : '收藏'}</button>
          <button className={learned.has(item.id) ? 'learned' : ''} onClick={() => save('dne-learned', learned, setLearned, item.id)}><Check size={18} /> {learned.has(item.id) ? '已掌握' : '标记为已学'}</button>
        </div>
      </section> : <div className="empty"><h2>没有找到相关表达</h2><p>换个关键词或分类试试看。</p></div>}

      {results.length > 0 && <nav className="navigator" aria-label="表达导航">
        <button onClick={() => move(-1)}><ChevronLeft /> 上一个</button>
        <span><b>{current + 1}</b> / {results.length}</span>
        <button className="shuffle" onClick={random}><Shuffle size={17} /> 随机一句</button>
        <button onClick={() => move(1)}>下一个 <ChevronRight /></button>
      </nav>}
    </main>
    <footer><span>Daily Native English · V1</span><span>Say it like you mean it.</span></footer>
  </div>
}
