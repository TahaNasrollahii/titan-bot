import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, ImagePlus, Pencil, SendHorizontal, Star, X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

import { ApiError, errorText } from '@/api/client';
import { supportApi } from '@/api/endpoints';
import type { SupportMessage, VisitorSync } from '@/api/types';
import { useMe, useSession } from '@/auth/session';
import { faDigits } from '@/lib/format';
import { media } from '@/lib/media';
import { confirmDialog, haptic, tg } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Icon3D, type Icon3DName } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { toast } from '@/ui/Toast';

import './support.css';

/** The chat token is per account: a different user on this phone must not see the conversation. */
const tokenKey = (userId: number) => `titan.support.${userId}`;
const readToken = (userId: number) => {
  try {
    return localStorage.getItem(tokenKey(userId));
  } catch {
    return null;
  }
};
const writeToken = (userId: number, token: string | null) => {
  try {
    if (token) localStorage.setItem(tokenKey(userId), token);
    else localStorage.removeItem(tokenKey(userId));
  } catch {
    /* storage unavailable: the chat lasts for this session only */
  }
};

export default function Support() {
  const me = useMe();
  const [token, setToken] = useState<string | null>(() => readToken(me.id));
  const update = (value: string | null) => {
    writeToken(me.id, value);
    setToken(value);
  };
  return token ? <Chat token={token} onGone={() => update(null)} onNew={() => update(null)} /> : <StartChat onStarted={update} />;
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

// ------------------------------------------------------------------ start
const TOPICS: { label: string; icon: Icon3DName }[] = [
  { label: 'سفارش و تحویل', icon: 'package' },
  { label: 'پرداخت و کیف پول', icon: 'money-bag' },
  { label: 'تورنمنت و تیم', icon: 'trophy' },
  { label: 'سؤال دیگر', icon: 'speech-balloon' },
];

function StartChat({ onStarted }: { onStarted: (token: string) => void }) {
  const me = useMe();
  const session = useSession();
  const tgUser = session.status === 'ready' ? session.telegram : null;
  const [first, last] = (me.fullName || '').split(/\s+/, 2);
  const [firstName, setFirstName] = useState(first || tgUser?.firstName || tg.user?.first_name || '');
  const [lastName, setLastName] = useState(last || tgUser?.lastName || tg.user?.last_name || '');
  const [editingName, setEditingName] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const status = useQuery({ queryKey: ['support', 'status'], queryFn: supportApi.status, refetchInterval: 30_000 });

  const nameOk = firstName.trim().length >= 2 && lastName.trim().length >= 2;
  const ready = nameOk && (topic !== null || message.trim().length > 0);

  const start = useMutation({
    mutationFn: async () => {
      const started = await supportApi.start({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: me.phone,
        pageUrl: 'telegram-mini-app',
      });
      // The first message carries the topic, so the agent knows what it is about before replying.
      const body = [topic && `موضوع: ${topic}`, message.trim()].filter(Boolean).join('\n');
      if (body) await supportApi.send(started.token, body, newId());
      return started.token;
    },
    onSuccess: token => {
      haptic.success();
      onStarted(token);
    },
    onError: error => {
      if (error instanceof ApiError && error.errors && ('firstName' in error.errors || 'lastName' in error.errors)) setEditingName(true);
      toast.error(errorText(error));
    },
  });

  const online = Boolean(status.data?.online);
  const minutes = status.data?.avgResponseSeconds ? Math.max(1, Math.round(status.data.avgResponseSeconds / 60)) : null;

  return (
    <Screen title="پشتیبانی" noTabs>
      <div className="clay sup-hero">
        <span className="clay sup-hero__icon">
          <Icon3D name="headphone" size={64} />
        </span>
        <h1>پشتیبانی تایتان</h1>
        <span className={`sup-status ${online ? 'is-online' : ''}`}>
          <span className="live-dot" />
          {online ? (minutes ? `آنلاین؛ پاسخ معمولاً زیر ${faDigits(minutes)} دقیقه` : 'پشتیبان‌ها آنلاین‌اند') : 'الان آفلاین؛ پاسخ را در تلگرام می‌گیری'}
        </span>
        {status.data && status.data.agents.length > 0 && (
          <div className="sup-agents">
            {status.data.agents.slice(0, 4).map(a => (
              <Avatar key={a.id} name={a.name} src={a.avatar} seed={a.avatarSeed} size={40} presence={a.isOnline ? 'online' : 'offline'} />
            ))}
          </div>
        )}
      </div>

      <section className="sup-who">
        {editingName ? (
          <div className="row" style={{ '--gap': '10px' } as CSSProperties}>
            <label className="field" style={{ flex: 1 }}>
              <span className="field__label">نام</span>
              <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} maxLength={40} />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span className="field__label">نام خانوادگی</span>
              <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} maxLength={60} />
            </label>
          </div>
        ) : (
          <button className="clay sup-name" onClick={() => setEditingName(true)}>
            <span>
              <small>گفتگو به نام</small>
              <strong>{nameOk ? `${firstName} ${lastName}` : 'نامت را وارد کن'}</strong>
            </span>
            <Pencil size={16} />
          </button>
        )}
      </section>

      <section className="section">
        <h2 className="sup-label">درباره‌ی چه موضوعی؟</h2>
        <div className="sup-topics" role="radiogroup">
          {TOPICS.map(t => (
            <button
              key={t.label}
              role="radio"
              aria-checked={topic === t.label}
              className="clay sup-topic"
              onClick={() => {
                haptic.select();
                setTopic(topic === t.label ? null : t.label);
              }}
            >
              <Icon3D name={t.icon} size={30} />
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="sup-label">پیامت</h2>
        <textarea
          className="input sup-message"
          rows={4}
          maxLength={2000}
          placeholder="مثلاً: شماره‌ی سفارش و مشکلی که پیش آمده را بنویس."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </section>


      <div className="action-bar">
        <Button size="lg" block disabled={!ready} loading={start.isPending} onClick={() => start.mutate()} icon={<SendHorizontal size={20} style={{ transform: 'scaleX(-1)' }} />}>
          شروع گفتگو
        </Button>
      </div>
    </Screen>
  );
}

// ------------------------------------------------------------------ chat
interface Pending {
  clientId: string;
  body: string;
  preview?: string;
  failed?: boolean;
}

function Chat({ token, onGone, onNew }: { token: string; onGone: () => void; onNew: () => void }) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [text, setText] = useState('');
  const lastId = useRef(0);
  const bottom = useRef<HTMLDivElement>(null);
  const typingSent = useRef(0);

  // Poll only for what is new since the last message we have.
  const sync = useQuery({
    queryKey: ['support', 'sync', token],
    queryFn: () => supportApi.sync(token, lastId.current),
    refetchInterval: q => (q.state.data?.conversation.status === 'closed' ? false : 3000),
    refetchIntervalInBackground: false,
    retry: (count, error) => !(error instanceof ApiError && (error.status === 404 || error.status === 401)) && count < 3,
  });

  useEffect(() => {
    if (sync.error instanceof ApiError && sync.error.status === 404) onGone();
  }, [sync.error, onGone]);

  useEffect(() => {
    const data = sync.data;
    if (!data?.messages.length) return;
    setMessages(prev => {
      const known = new Set(prev.map(x => x.id));
      const fresh = data.messages.filter(x => !known.has(x.id));
      if (fresh.some(x => x.kind === 'agent')) haptic.tap('soft');
      return [...prev, ...fresh];
    });
    setPending(prev => prev.filter(p => !data.messages.some(x => x.clientId === p.clientId)));
    lastId.current = Math.max(lastId.current, ...data.messages.map(x => x.id));
    void supportApi.read(token, lastId.current).catch(() => undefined);
  }, [sync.data, token]);

  useLayoutEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end', behavior: messages.length > 20 ? 'auto' : 'smooth' });
  }, [messages.length, pending.length, sync.data?.conversation.agentTyping]);

  const conversation: VisitorSync['conversation'] | undefined = sync.data?.conversation;
  const closed = conversation?.status === 'closed';
  const agent = conversation?.agent;
  const supportOnline = Boolean(sync.data?.support.online);

  async function send(body: string, image?: File) {
    const clientId = newId();
    const preview = image ? URL.createObjectURL(image) : undefined;
    setPending(p => [...p, { clientId, body, preview }]);
    haptic.tap();
    try {
      const message = image ? await supportApi.sendImage(token, image, clientId) : await supportApi.send(token, body, clientId);
      setMessages(prev => (prev.some(x => x.id === message.id) ? prev : [...prev, message]));
      setPending(p => p.filter(x => x.clientId !== clientId));
      lastId.current = Math.max(lastId.current, message.id);
    } catch (error) {
      setPending(p => p.map(x => (x.clientId === clientId ? { ...x, failed: true } : x)));
      toast.error(errorText(error));
    }
  }

  const close = useMutation({
    mutationFn: () => supportApi.close(token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support', 'sync', token] }),
  });

  return (
    <Screen
      title="پشتیبانی"
      noTabs
      actions={
        !closed && conversation ? (
          <button
            className="icon-btn"
            aria-label="پایان گفتگو"
            onClick={async () => {
              if (await confirmDialog('گفتگو بسته شود؟')) close.mutate();
            }}
          >
            <X size={18} />
          </button>
        ) : undefined
      }
    >
      <div className="clay chat-head">
        {agent ? (
          <Avatar name={agent.name} src={agent.avatar} seed={agent.avatarSeed} size={48} presence={agent.isOnline ? 'online' : 'offline'} />
        ) : (
          <span className="clay chat-head__icon">
            <Icon3D name="headphone" size={30} />
          </span>
        )}
        <span className="chat-head__body">
          <strong>{agent ? agent.name : 'پشتیبانی تایتان'}</strong>
          <small className={conversation?.agentTyping ? 'is-typing' : ''}>
            {conversation?.agentTyping
              ? 'در حال نوشتن…'
              : closed
                ? 'گفتگو بسته شد'
                : agent
                  ? agent.isOnline
                    ? 'آنلاین'
                    : 'آفلاین'
                  : supportOnline
                    ? 'به‌زودی یک پشتیبان جواب می‌دهد'
                    : 'پاسخ را در تلگرام هم می‌گیری'}
          </small>
        </span>
        {conversation && <span className="badge ltr">{conversation.ticket}</span>}
      </div>

      <div className="chat" aria-live="polite">
        {messages.map(msg => (
          <Bubble key={msg.id} msg={msg} read={msg.kind === 'visitor' && conversation ? msg.id <= conversation.agentReadId : false} />
        ))}
        {pending.map(p => (
          <div key={p.clientId} className="clay bubble bubble--me" data-failed={p.failed}>
            {p.preview && <img src={p.preview} alt="" className="bubble__img" />}
            {p.body && <p>{p.body}</p>}
            <span className="bubble__meta">{p.failed ? 'ارسال نشد' : 'در حال ارسال…'}</span>
          </div>
        ))}
        <AnimatePresence>
          {conversation?.agentTyping && (
            <m.div className="clay bubble bubble--agent typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span />
              <span />
              <span />
            </m.div>
          )}
        </AnimatePresence>
        {closed && conversation && <Rate token={token} rated={conversation.rating !== null} onNew={onNew} />}
        <div ref={bottom} />
      </div>

      {!closed && (
        <form
          className="clay clay--dark composer"
          onSubmit={e => {
            e.preventDefault();
            const body = text.trim();
            if (!body) return;
            setText('');
            void send(body);
          }}
        >
          <label className="clay composer__attach" aria-label="ارسال تصویر">
            <ImagePlus size={20} />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={e => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) return toast.error('حجم تصویر باید کمتر از ۲ مگابایت باشد.');
                void send('', file);
              }}
            />
          </label>
          <textarea
            className="well composer__input"
            rows={1}
            maxLength={2000}
            placeholder="پیامت را بنویس…"
            value={text}
            onChange={e => {
              setText(e.target.value);
              if (Date.now() - typingSent.current > 4000) {
                typingSent.current = Date.now();
                void supportApi.typing(token).catch(() => undefined);
              }
            }}
          />
          <button type="submit" className="clay composer__send" disabled={!text.trim()} aria-label="ارسال">
            <SendHorizontal size={20} style={{ transform: 'scaleX(-1)' }} />
          </button>
        </form>
      )}
    </Screen>
  );
}

function Bubble({ msg, read }: { msg: SupportMessage; read: boolean }) {
  if (msg.kind === 'system') return <div className="chat__system">{msg.body}</div>;
  if (msg.kind === 'note') return null;
  const mine = msg.kind === 'visitor';
  const time = new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  return (
    <m.div
      className={`clay bubble ${mine ? 'bubble--me' : 'bubble--agent'}`}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
    >
      {msg.image && <img src={media(msg.image)} alt="" className="bubble__img" loading="lazy" />}
      {msg.body && <p data-selectable>{msg.body}</p>}
      <span className="bubble__meta">
        {time} {mine && read && <CheckCheck size={13} />}
      </span>
    </m.div>
  );
}

function Rate({ token, rated, onNew }: { token: string; rated: boolean; onNew: () => void }) {
  const queryClient = useQueryClient();
  const [stars, setStars] = useState(0);
  const rate = useMutation({
    mutationFn: () => supportApi.rate(token, stars, ''),
    onSuccess: () => {
      haptic.success();
      toast.success('ممنون از بازخوردت!');
      void queryClient.invalidateQueries({ queryKey: ['support', 'sync', token] });
    },
    onError: error => toast.error(errorText(error)),
  });
  return (
    <div className="clay sup-rate">
      <Icon3D name={rated ? 'party-popper' : 'glowing-star'} size={44} />
      <strong>{rated ? 'ممنون که نظرت را گفتی' : 'گفتگو بسته شد'}</strong>
      {!rated && (
        <>
          <span className="muted text-sm">به این گفتگو چه امتیازی می‌دهی؟</span>
          <div className="row" style={{ justifyContent: 'center', '--gap': '6px' } as CSSProperties}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} aria-label={`${n} ستاره`} onClick={() => (haptic.select(), setStars(n))} style={{ color: 'var(--gold)' }}>
                <Star size={32} fill={n <= stars ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <Button size="sm" disabled={!stars} loading={rate.isPending} onClick={() => rate.mutate()}>
            ثبت امتیاز
          </Button>
        </>
      )}
      <Button variant="glass" size="sm" onClick={onNew}>
        گفتگوی جدید
      </Button>
    </div>
  );
}
