import { RotateCw } from 'lucide-react';

import { signIn } from '@/auth/session';
import { Button } from '@/ui/Button';
import { Icon3D } from '@/ui/Icon3D';

export function Splash() {
  return (
    <div id="boot" role="status" aria-label="در حال ورود">
      <div className="gate__stage">
        <span className="gate__sticker gate__sticker--1" aria-hidden>
          <Icon3D name="crown" size={28} anim="float" />
        </span>
        <span className="gate__sticker gate__sticker--2" aria-hidden>
          <Icon3D name="sparkles" size={24} anim="pulse" />
        </span>
        <img className="gate__logo" src="/titan-logo.webp" alt="تایتان" width={96} height={96} />
        <span className="gate__sticker gate__sticker--3" aria-hidden>
          <Icon3D name="joystick" size={26} anim="wiggle" />
        </span>
        <span className="gate__sticker gate__sticker--4" aria-hidden>
          <Icon3D name="trophy" size={24} anim="bounce" />
        </span>
      </div>
    </div>
  );
}

export function SessionError({ message, expired }: { message: string; expired: boolean }) {
  return (
    <div className="gate">
      <div className="gate__stage">
        <span className="gate__sticker gate__sticker--1" aria-hidden>
          <Icon3D name="high-voltage" size={28} anim="wiggle" />
        </span>
        <span className="gate__sticker gate__sticker--2" aria-hidden>
          <Icon3D name="sparkles" size={22} anim="pulse" />
        </span>
        <img className="gate__logo" src="/titan-logo.webp" alt="" />
        <span className="gate__sticker gate__sticker--3" aria-hidden>
          <Icon3D name="hourglass-not-done" size={26} anim="float" />
        </span>
      </div>
      <h1 className="gate__title">{expired ? 'نشست شما تمام شده' : 'ورود انجام نشد'}</h1>
      <p className="gate__text">{message}</p>
      {!expired && (
        <Button onClick={() => void signIn()} icon={<RotateCw size={18} />}>
          تلاش دوباره
        </Button>
      )}
    </div>
  );
}
