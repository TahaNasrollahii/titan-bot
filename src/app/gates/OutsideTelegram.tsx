import { Send } from 'lucide-react';

import { miniAppLink } from '@/lib/env';
import { Icon3D } from '@/ui/Icon3D';

export function OutsideTelegram() {
  return (
    <div className="gate">
      <div className="gate__stage">
        <span className="gate__sticker gate__sticker--1" aria-hidden>
          <Icon3D name="crown" size={32} anim="float" />
        </span>
        <span className="gate__sticker gate__sticker--2" aria-hidden>
          <Icon3D name="sparkles" size={26} anim="pulse" />
        </span>
        <img className="gate__logo" src="/titan-logo.webp" alt="" />
        <span className="gate__sticker gate__sticker--3" aria-hidden>
          <Icon3D name="trophy" size={30} anim="bounce" />
        </span>
        <span className="gate__sticker gate__sticker--4" aria-hidden>
          <Icon3D name="joystick" size={28} anim="wiggle" />
        </span>
      </div>
      <h1 className="gate__title">تایتان را در تلگرام باز کنید</h1>
      <p className="gate__text">این سوپراپ گیمینگ داخل تلگرام اجرا می‌شود. برای دسترسی به فروشگاه آنی، فورتنایت شاپ و تورنمنت‌ها وارد ربات شوید.</p>
      <div className="gate__pills" aria-hidden>
        <span className="gate__pill">
          <Icon3D name="shopping-bags" size={18} />
          فروشگاه آنی آیتم
        </span>
        <span className="gate__pill">
          <Icon3D name="trophy" size={18} />
          تورنمنت‌های جایزه‌دار
        </span>
        <span className="gate__pill">
          <Icon3D name="fire" size={18} />
          آیتم‌شاپ زنده فورتنایت
        </span>
      </div>
      <a className="btn btn--primary btn--lg" href={miniAppLink()}>
        <Send size={20} />
        باز کردن در تلگرام
      </a>
    </div>
  );
}
