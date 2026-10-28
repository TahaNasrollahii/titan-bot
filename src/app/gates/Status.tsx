import { RotateCw } from 'lucide-react';

import { signIn } from '@/auth/session';
import { Button } from '@/ui/Button';

export function Splash() {
  return (
    <div id="boot" role="status" aria-label="در حال ورود">
      <img src="/titan-logo.webp" alt="تایتان" width={96} height={96} />
    </div>
  );
}

export function SessionError({ message, expired }: { message: string; expired: boolean }) {
  return (
    <div className="gate">
      <img className="gate__logo" src="/titan-logo.webp" alt="" />
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
