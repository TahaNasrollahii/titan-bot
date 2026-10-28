import { RotateCw } from 'lucide-react';

import { Button } from '@/ui/Button';

/** Last resort when a screen crashes or its code fails to load (e.g. an old tab after a deploy). */
export function RouteError() {
  return (
    <div className="gate">
      <img className="gate__logo" src="/titan-logo.webp" alt="" />
      <h1 className="gate__title">یک لحظه، چیزی درست پیش نرفت</h1>
      <p className="gate__text">صفحه را دوباره بارگذاری کنید. اگر مشکل ادامه داشت، اپ را ببندید و دوباره باز کنید.</p>
      <Button onClick={() => window.location.reload()} icon={<RotateCw size={18} />}>
        بارگذاری دوباره
      </Button>
    </div>
  );
}
