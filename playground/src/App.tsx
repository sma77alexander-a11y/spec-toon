import { decode, encode } from '@toon-format/toon'
import { ArrowLeftRight, Check, Copy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { samples } from './samples'

type Mode = 'json-to-toon' | 'toon-to-json'
type Delimiter = ',' | '\t' | '|'

const delimiterLabels: Record<Delimiter, string> = { ',': 'Comma', '\t': 'Tab', '|': 'Pipe' }

const initial = samples.find((s) => s.name === 'tabular-arrays') ?? samples[0]

function convert(
  input: string,
  mode: Mode,
  delimiter: Delimiter,
): { output: string; error?: string } {
  if (!input.trim()) return { output: '' }
  try {
    if (mode === 'json-to-toon') {
      return { output: encode(JSON.parse(input), { delimiter }) }
    }
    return { output: JSON.stringify(decode(input), null, 2) }
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : String(e) }
  }
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="ghost"
      disabled={!text}
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setDone(true)
        setTimeout(() => setDone(false), 1200)
      }}
    >
      {done ? <Check size={14} /> : <Copy size={14} />}
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function App() {
  const [mode, setMode] = useState<Mode>('toon-to-json')
  const [delimiter, setDelimiter] = useState<Delimiter>(',')
  const [input, setInput] = useState(initial?.toon ?? '')

  const { output, error } = useMemo(() => convert(input, mode, delimiter), [input, mode, delimiter])

  const toonText = mode === 'json-to-toon' ? output : input
  const jsonText = mode === 'json-to-toon' ? input : output
  const compactJson = useMemo(() => {
    try {
      return jsonText.trim() ? JSON.stringify(JSON.parse(jsonText)) : ''
    } catch {
      return ''
    }
  }, [jsonText])
  const saved =
    !error && toonText && compactJson
      ? Math.round((1 - toonText.length / compactJson.length) * 100)
      : null

  function loadSample(name: string) {
    const s = samples.find((x) => x.name === name)
    if (!s) return
    if (mode === 'toon-to-json') setInput(s.toon)
    else setInput(s.json ?? JSON.stringify(decode(s.toon), null, 2))
  }

  function swap() {
    const next: Mode = mode === 'json-to-toon' ? 'toon-to-json' : 'json-to-toon'
    if (output && !error) setInput(output)
    setMode(next)
  }

  return (
    <div className="page">
      <header className="head">
        <p className="eyebrow">Token-Oriented Object Notation</p>
        <h1>TOON Playground</h1>
        <p className="sub">Convert between JSON and TOON and see how much text the compact form saves.</p>
      </header>

      <section className="card">
        <div className="toolbar">
          <div className="seg" role="tablist" aria-label="Direction">
            <button
              type="button"
              className={mode === 'toon-to-json' ? 'on' : ''}
              onClick={() => mode !== 'toon-to-json' && swap()}
            >
              TOON to JSON
            </button>
            <button
              type="button"
              className={mode === 'json-to-toon' ? 'on' : ''}
              onClick={() => mode !== 'json-to-toon' && swap()}
            >
              JSON to TOON
            </button>
          </div>
          <label className="field">
            <span>Example</span>
            <select defaultValue={initial?.name} onChange={(e) => loadSample(e.target.value)}>
              {samples.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Delimiter</span>
            <select
              value={delimiter}
              disabled={mode === 'toon-to-json'}
              onChange={(e) => setDelimiter(e.target.value as Delimiter)}
            >
              {(Object.keys(delimiterLabels) as Delimiter[]).map((d) => (
                <option key={d} value={d}>
                  {delimiterLabels[d]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="panes">
          <div className="pane">
            <div className="pane-head">
              <h2>{mode === 'toon-to-json' ? 'TOON input' : 'JSON input'}</h2>
              <CopyButton text={input} />
            </div>
            <textarea
              spellCheck={false}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Input"
            />
          </div>

          <button type="button" className="swap" onClick={swap} aria-label="Swap direction">
            <ArrowLeftRight size={18} />
          </button>

          <div className="pane">
            <div className="pane-head">
              <h2>{mode === 'toon-to-json' ? 'JSON output' : 'TOON output'}</h2>
              <CopyButton text={output} />
            </div>
            {error ? (
              <pre className="out err" role="alert">{error}</pre>
            ) : (
              <pre className="out">{output || 'Output appears here.'}</pre>
            )}
          </div>
        </div>

        <footer className="stats">
          <div>
            <span className="label">TOON</span>
            <strong>{toonText.length.toLocaleString()} chars</strong>
          </div>
          <div>
            <span className="label">Compact JSON</span>
            <strong>{compactJson.length.toLocaleString()} chars</strong>
          </div>
          <div>
            <span className="label">Difference</span>
            <strong className={saved !== null && saved > 0 ? 'good' : ''}>
              {saved === null ? 'n/a' : saved > 0 ? `${saved}% smaller` : `${Math.abs(saved)}% larger`}
            </strong>
          </div>
        </footer>
      </section>
    </div>
  )
}
