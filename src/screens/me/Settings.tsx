import { useMutation } from '@tanstack/react-query';
import { BellRing, ExternalLink, Globe, Headset, LogOut, Phone, ShieldCheck } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import { errorText } from '@/api/client';
import { telegramApi } from '@/api/endpoints';
import { markUnlinked, updateTelegram, useMe, useSession } from '@/auth/session';
import { env } from '@/lib/env';
import { faDigits } from '@/lib/format';
import { queryClient } from '@/lib/queries';
import { confirmDialog, haptic, openExternal, requestWriteAccess } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Screen } from '@/ui/Screen';
import { Switch } from '@/ui/Switch';
import { toast } from '@/ui/Toast';

import './me.css';

export default function Settings() {
  const me = useMe();
  const session = useSession();
  const telegram = session.status === 'ready' ? session.telegram : null;

  const notifications = useMutation({
    mutationFn: async (enabled: boolean) => {
      // The bot may only write to users who allowed it; ask Telegram first when turning alerts on.
      if (enabled && !telegram?.canMessage) {
        const granted = await requestWriteAccess();
        if (!granted) throw new Error('write_access_denied');
        return telegramApi.update({ notificationsEnabled: true, writeAccessGranted: true });
      }
      return telegramApi.update({ notificationsEnabled: enabled });
    },
    onSuccess: account => {
      updateTelegram(account);
      haptic.success();
    },
    onError: error =>
      toast.error(error instanceof Error && error.message === 'write_access_denied' ? 'بدون اجازه‌ی پیام، ربات نمی‌تواند اعلان بفرستد.' : errorText(error)),
  });

  const unlink = useMutation({
    mutationFn: telegramApi.unlink,
    onSuccess: () => {
      queryClient.clear();
      markUnlinked();
    },
    onError: error => toast.error(errorText(error)),
  });

  const enabled = Boolean(telegram?.notificationsEnabled && telegram.canMessage);

  return (
    <Screen title="تنظیمات" fallback="/me">
      <div className="stack" style={{ '--gap': '18px' } as CSSProperties}>
        {telegram && (
          <div className="card card--pad row">
            <Avatar name={telegram.firstName || telegram.username || 'T'} src={telegram.photoUrl || null} seed={telegram.telegramId % 97} size={52} />
            <div className="list-row__body">
              <div className="list-row__title">
                {`${telegram.firstName} ${telegram.lastName}`.trim() || 'حساب تلگرام'} {telegram.isPremium && '⭐'}
              </div>
              <div className="list-row__sub">{telegram.username ? <span className="ltr">@{telegram.username}</span> : 'متصل به تایتان'}</div>
            </div>
            <span className="badge badge--green">
              <ShieldCheck size={12} /> متصل
            </span>
          </div>
        )}

        <section>
          <h2 className="pd__label">اعلان‌ها</h2>
          <div className="list">
            <div className="list-row">
              <span className="list-row__icon">
                <BellRing size={18} />
              </span>
              <div className="list-row__body">
                <div className="list-row__title">اعلان در تلگرام</div>
                <div className="list-row__sub" style={{ whiteSpace: 'normal' }}>
                  تحویل سفارش، شروع مسابقه، دعوت تیم و پاسخ پشتیبانی
                </div>
              </div>
              <Switch label="اعلان در تلگرام" checked={enabled} disabled={notifications.isPending} onChange={v => notifications.mutate(v)} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="pd__label">حساب</h2>
          <div className="list">
            <div className="list-row">
              <span className="list-row__icon">
                <Phone size={18} />
              </span>
              <div className="list-row__body">
                <div className="list-row__title">شماره‌ی حساب</div>
                <div className="list-row__sub ltr num" style={{ textAlign: 'right' }}>
                  {faDigits(me.phone)}
                </div>
              </div>
            </div>
            <button className="list-row" onClick={() => openExternal(env.siteUrl)}>
              <span className="list-row__icon">
                <Globe size={18} />
              </span>
              <div className="list-row__body">
                <div className="list-row__title">وب‌سایت تایتان</div>
                <div className="list-row__sub">با همین شماره در سایت هم وارد شو</div>
              </div>
              <ExternalLink size={16} className="list-row__chev" />
            </button>
            <Link to="/support" className="list-row">
              <span className="list-row__icon">
                <Headset size={18} />
              </span>
              <div className="list-row__body">
                <div className="list-row__title">پشتیبانی</div>
              </div>
            </Link>
          </div>
        </section>

        <section>
          <div className="list">
            <button
              className="list-row"
              disabled={unlink.isPending}
              onClick={async () => {
                if (await confirmDialog('از حساب تایتان خارج می‌شوی؟ دفعه‌ی بعد با اشتراک شماره دوباره وارد می‌شوی.'))
                  unlink.mutate();
              }}
            >
              <span className="clay clay--red list-row__icon">
                <LogOut size={18} />
              </span>
              <div className="list-row__body">
                <div className="list-row__title">خروج از حساب</div>
              </div>
            </button>
          </div>
        </section>

        <p className="text-xs muted" style={{ textAlign: 'center' }}>
          Titan Mini App · v{__APP_VERSION__}
        </p>
      </div>
    </Screen>
  );
}
