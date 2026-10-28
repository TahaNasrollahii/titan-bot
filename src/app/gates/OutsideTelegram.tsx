import { Send } from 'lucide-react';

import { miniAppLink } from '@/lib/env';

export function OutsideTelegram() {
  return (
    <div className="gate">
      <img className="gate__logo" src="/titan-logo.webp" alt="" />
      <h1 className="gate__title">تایتان را در تلگرام باز کنید</h1>
      <p className="gate__text">این اپ داخل تلگرام اجرا می‌شود. برای ادامه، ربات تایتان را در تلگرام باز کنید.</p>
      <a className="btn btn--primary btn--lg" href={miniAppLink()}>
        <Send size={20} />
        باز کردن در تلگرام
      </a>
    </div>
  );
}
