import { useState } from 'react'
import { Check, Copy, Eye, EyeSlash, Key } from '@phosphor-icons/react'
import en from '../locales/en/common.json'

type DemoStrings = (typeof en)['demo']

function strengthScore(pw: string, kinds: number) {
  let score = 0
  if (pw.length >= 12) score += 1
  if (pw.length >= 20) score += 1
  if (kinds >= 3) score += 1
  if (kinds >= 4) score += 1
  return score
}

export default function Demo({ d }: { d: DemoStrings }) {
  const [length, setLength] = useState(16)
  const [upper, setUpper] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [password, setPassword] = useState(d.initialPassword)
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState<number | null>(null)

  const kinds = 1 + (upper ? 1 : 0) + (numbers ? 1 : 0) + (symbols ? 1 : 0)
  const score = strengthScore(password, kinds)
  const strengthLabel = score <= 1 ? d.strength.weak : score <= 2 ? d.strength.fair : d.strength.strong
  const strengthWidth = `${((score + 1) / 5) * 100}%`

  const generate = () => {
    let chars = 'abcdefghjkmnpqrstuvwxyz'
    if (upper) chars += 'ABCDEFGHJKMNPQRSTUVWXYZ'
    if (numbers) chars += '23456789'
    if (symbols) chars += '!@#$%^&*'
    const buf = new Uint32Array(length)
    crypto.getRandomValues(buf)
    setPassword(Array.from(buf, (n) => chars[n % chars.length]).join(''))
    setCopied(false)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password)
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true)
  }
  return (
    <div className="rounded-2xl border border-line bg-surface p-8 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="title-1 font-semibold">{d.title}</h2>
          <p className="caption-2 text-muted">{d.subtitle}</p>
        </div>
        <span className="caption-3 rounded-full bg-accent-soft px-4 py-2 text-accent">{d.sampleLabel}</span>
      </div>
      <div className="mt-8 rounded-xl border border-line bg-bg p-4">
        <p className="caption-4 text-muted">{d.generatedLabel}</p>
        <p className="heading-5 mt-2 break-all font-mono" dir="ltr">{password}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuenow={score + 1} aria-valuemin={0} aria-valuemax={5} aria-label={d.strengthLabel}>
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: strengthWidth }} />
        </div>
        <p className="caption-1 mt-2">{d.strengthLabel}: {strengthLabel}</p>
        <div className="mt-4 flex flex-wrap gap-4">
          <button type="button" onClick={generate} className="button-sm inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-ink transition-opacity duration-300 hover:opacity-90">
            <Key size={16} aria-hidden="true" />
            {d.generateLabel}
          </button>
          <button type="button" onClick={copy} className="button-sm inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 transition-colors duration-300 hover:bg-surface">
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copied ? d.copiedLabel : d.copyLabel}
          </button>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <div>
          <label htmlFor="pw-length" className="body-4 block">{d.lengthLabel}: {length}</label>
          <input id="pw-length" type="range" min={8} max={32} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" />
        </div>
        <div className="flex flex-wrap gap-4">
          {(
            [
              { label: d.upperLabel, value: upper, set: setUpper },
              { label: d.numbersLabel, value: numbers, set: setNumbers },
              { label: d.symbolsLabel, value: symbols, set: setSymbols },
            ] as const
          ).map((opt) => (
            <label key={opt.label} className="flex cursor-pointer items-center gap-2 body-3">
              <input type="checkbox" checked={opt.value} onChange={(e) => opt.set(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent)]" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <ul className="mt-8 space-y-2">
        {d.entries.map((entry, i) => (
          <li key={entry.site} className="flex items-center gap-4 rounded-xl border border-line bg-bg px-4 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent caption-3" aria-hidden="true">
              {entry.site.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="body-2 block truncate">{entry.site}</span>
              <span className="caption-4 block truncate text-muted" dir="ltr">{entry.user} · {visible === i ? entry.password : '••••••••'}</span>
            </span>
            <button
              type="button"
              onClick={() => setVisible(visible === i ? null : i)}
              aria-label={visible === i ? d.hideLabel : d.showLabel}
              aria-pressed={visible === i}
              className="rounded-lg p-2 hover:bg-surface"
            >
              {visible === i ? <EyeSlash size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
