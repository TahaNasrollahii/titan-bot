import { AnimatePresence, m } from 'motion/react';
import { ChevronRight, KeyRound, Link2, MessageSquareText, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ApiError, errorText } from '@/api/client';
import { telegramApi, type TelegramUser } from '@/api/endpoints';
import { apply } from '@/auth/session';
import { faDigits, toLatinDigits } from '@/lib/format';
import { haptic, requestContact, tg } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Icon3D } from '@/ui/Icon3D';
import { toast } from '@/ui/Toast';

import './link.css';

type Mode = 'intro' | 'phone' | 'code';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function LinkAccount({ telegramUser }: { telegramUser: TelegramUser }) {
  const [mode, setMode] = useState<Mode>('intro');
  const [phone, setPhone] = useState('');
  const name = telegramUser.firstName || telegramUser.username;

  return (
    <div className="link">
      <div className="link__hero">
        <m.div
          className="link__orbit"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 160 }}
        >
          <Avatar name={name || 'T'} src={telegramUser.photoUrl || null} seed={telegramUser.id % 97} size={76} />
          <span className="link__bridge" aria-hidden>
            <span />
            <Link2 size={18} />
            <span />
          </span>
          <span className="link__titan">
            <img src="/titan-logo.webp" alt="تایتان" />
          </span>
        </m.div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {mode === 'intro' && (
          <Intro key="intro" name={name} onUseAnother={() => setMode('phone')} onNeedsCode={() => setMode('phone')} />
        )}
        {mode === 'phone' && (
          <PhoneStep
            key="phone"
            phone={phone}
            setPhone={setPhone}
            onBack={() => setMode('intro')}
            onSent={() => setMode('code')}
          />
        )}
        {mode === 'code' && <CodeStep key="code" phone={phone} onBack={() => setMode('phone')} />}
      </AnimatePresence>
    </div>
  );
}

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] as const },
};

function Intro({ name, onUseAnother, onNeedsCode }: { name?: string; onUseAnother: () => void; onNeedsCode: () => void }) {
  const [busy, setBusy] = useState(false);

  async function share() {
    setBusy(true);
    try {
      const { shared, signed } = await requestContact();
      if (!shared) {
        toast.info('برای ورود سریع، شماره را به اشتراک بگذارید.');
        return;
      }
      // The signed result usually arrives with the callback; Telegram's bot copy can lag a moment behind.
      for (let attempt = 0; ; attempt++) {
        try {
          apply(await telegramApi.linkContact(tg.initData, signed));
          haptic.success();
          return;
        } catch (error) {
          if (error instanceof ApiError && error.code === 'telegram_contact_pending' && attempt < 6) {
            await sleep(700 + attempt * 300);
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === 'telegram_phone_not_supported') {
        toast.error(error.text);
        onNeedsCode();
      } else {
        toast.error(errorText(error));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <m.section className="link__panel" {...fade}>
      <h1 className="link__title">{name ? `سلام ${name}!` : 'سلام!'}</h1>
      <p className="link__lead">
        حساب تلگرامت را یک بار به تایتان وصل کن. اگر در سایت تایتان حساب داری، همان حساب با کیف پول و سفارش‌هایت باز
        می‌شود.
      </p>

      <ul className="link__perks">
        <li>
          <span><Icon3D name="money-bag" size={26} /></span>
          کیف پول، سفارش‌ها و تیمت؛ همه‌جا یکی
        </li>
        <li>
          <span><Icon3D name="bell" size={26} /></span>
          اعلان تحویل سفارش و شروع مسابقه، همین‌جا در تلگرام
        </li>
        <li>
          <span><Icon3D name="shield" size={26} /></span>
          بدون رمز و کد پیامکی؛ تلگرام شماره‌ات را تأیید می‌کند
        </li>
      </ul>

      <div className="link__actions">
        <Button size="lg" block loading={busy} onClick={share} icon={<Phone size={20} />}>
          اشتراک شماره و ورود
        </Button>
        <button className="link__alt" onClick={onUseAnother}>
          <MessageSquareText size={16} />
          ورود با شماره‌ی دیگر (کد پیامکی)
        </button>
      </div>
      <p className="link__fine">شماره‌ی شما فقط برای ورود و ارسال اطلاعیه‌های سفارش استفاده می‌شود.</p>
    </m.section>
  );
}

function PhoneStep({
  phone,
  setPhone,
  onBack,
  onSent,
}: {
  phone: string;
  setPhone: (v: string) => void;
  onBack: () => void;
  onSent: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const valid = /^09\d{9}$/.test(phone);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setBusy(true);
    try {
      await telegramApi.requestCode(tg.initData, phone);
      onSent();
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <m.form className="link__panel" onSubmit={submit} {...fade}>
      <button type="button" className="link__back" onClick={onBack}>
        <ChevronRight size={18} /> بازگشت
      </button>
      <h1 className="link__title">شماره‌ی حساب تایتان</h1>
      <p className="link__lead">کد تأیید به این شماره پیامک می‌شود.</p>
      <label className="field">
        <span className="field__label">شماره موبایل</span>
        <input
          className="input ltr num"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="09xxxxxxxxx"
          maxLength={11}
          value={phone}
          autoFocus
          onChange={e => setPhone(toLatinDigits(e.target.value).replace(/\D/g, ''))}
        />
      </label>
      <Button type="submit" size="lg" block disabled={!valid} loading={busy} icon={<KeyRound size={20} />}>
        ارسال کد
      </Button>
    </m.form>
  );
}

function CodeStep({ phone, onBack }: { phone: string; onBack: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(60);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function verify(value: string) {
    setBusy(true);
    try {
      apply(await telegramApi.verifyCode(tg.initData, phone, value));
      haptic.success();
    } catch (error) {
      setCode('');
      toast.error(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    try {
      await telegramApi.requestCode(tg.initData, phone);
      setResendIn(60);
      toast.success('کد دوباره ارسال شد.');
    } catch (error) {
      toast.error(errorText(error));
    }
  }

  return (
    <m.div className="link__panel" {...fade}>
      <button type="button" className="link__back" onClick={onBack}>
        <ChevronRight size={18} /> تغییر شماره
      </button>
      <h1 className="link__title">کد تأیید</h1>
      <p className="link__lead">
        کد ۶ رقمی ارسال‌شده به <span className="ltr num">{faDigits(phone)}</span> را وارد کنید.
      </p>
      <input
        className="input ltr num link__code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        autoFocus
        disabled={busy}
        aria-label="کد تأیید"
        onChange={e => {
          const value = toLatinDigits(e.target.value).replace(/\D/g, '').slice(0, 6);
          setCode(value);
          if (value.length === 6) void verify(value);
        }}
      />
      <Button size="lg" block disabled={code.length !== 6} loading={busy} onClick={() => verify(code)}>
        ورود
      </Button>
      <button type="button" className="link__alt" disabled={resendIn > 0} onClick={resend}>
        {resendIn > 0 ? `ارسال دوباره تا ${faDigits(resendIn)} ثانیه` : 'ارسال دوباره‌ی کد'}
      </button>
    </m.div>
  );
}
