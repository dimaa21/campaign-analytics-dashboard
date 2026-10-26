import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Panel } from '../../components/ui/Panel';
import { fieldClass } from '../../utils/cx';
import { DEFAULT_TEMPLATE, SAMPLE_MACROS, applyMacros, unresolvedMacros } from './macros';

async function writeClipboard(value: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;
  try {
    return await Promise.race([
      navigator.clipboard.writeText(value).then(() => true),
      new Promise<boolean>((resolve) => {
        window.setTimeout(() => resolve(false), 800);
      }),
    ]);
  } catch {
    return false;
  }
}

function writeClipboardFallback(value: string): void {
  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  document.body.append(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

const FIELDS = [
  { key: 'clickid', label: 'clickid' },
  { key: 'payout', label: 'payout' },
  { key: 'status', label: 'status' },
  { key: 'offer', label: 'offer' },
  { key: 'geo', label: 'geo' },
] as const;

export function PostbackPage() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [values, setValues] = useState(SAMPLE_MACROS);
  const [copied, setCopied] = useState(false);
  const preview = useMemo(() => applyMacros(template, values), [template, values]);
  const missing = useMemo(() => unresolvedMacros(preview), [preview]);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Postback URL tester · Campaign Analytics';
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    const wrote = await writeClipboard(preview);
    if (!wrote) writeClipboardFallback(preview);
    setCopied(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Postback URL tester</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          Paste a tracker postback template, fill the test values, and copy the URL a landing page or advertiser
          would call.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Template" description="Macros use curly braces, for example {clickid}.">
          <label htmlFor="postback-template" className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Postback URL
          </label>
          <textarea
            id="postback-template"
            value={template}
            onChange={(event) => setTemplate(event.target.value)}
            rows={5}
            spellCheck={false}
            aria-describedby="macro-help"
            className="w-full rounded-md border border-line bg-canvas p-3 font-mono text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <p id="macro-help" className="mt-2 text-xs leading-5 text-muted">
            Supported test macros: {'{clickid}'}, {'{payout}'}, {'{status}'}, {'{offer}'}, {'{geo}'}, {'{campaign}'},{' '}
            {'{source}'}.
          </p>
          <div className="mt-3">
            <Button onClick={() => setTemplate(DEFAULT_TEMPLATE)}>Reset template</Button>
          </div>
        </Panel>
        <Panel title="Test values" description="These stand in for a real click before the URL is copied.">
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {field.label}
                </span>
                <input
                  className={`${fieldClass} w-full font-mono`}
                  value={values[field.key] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                />
              </label>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Preview" description="Unknown macros stay in the URL so you can see what is still missing.">
        <p className="break-all rounded-md border border-line bg-canvas p-3 font-mono text-xs leading-5" aria-live="polite">
          {preview || 'Enter a template to preview the URL.'}
        </p>
        {missing.length > 0 ? (
          <p className="mt-2 text-xs text-bad" role="status">
            Unresolved macros: {missing.map((name) => `{${name}}`).join(', ')}
          </p>
        ) : null}
        <div className="mt-3 flex items-center gap-3">
          <Button variant="solid" onClick={() => void copy()} disabled={!preview}>
            Copy
          </Button>
          <p className="text-xs text-muted" role="status" aria-live="polite">
            {copied ? 'Copied' : ''}
          </p>
        </div>
      </Panel>
      <Panel title="How a postback fits the click" description="The same path a Keitaro-style tracker uses.">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>The visitor clicks an ad. The tracker stores a click and redirects to the offer with a click id.</li>
          <li>The offer converts. The advertiser or landing page requests the postback URL.</li>
          <li>The tracker matches {'{clickid}'}, writes the status and payout, and the report updates.</li>
        </ol>
      </Panel>
    </div>
  );
}
