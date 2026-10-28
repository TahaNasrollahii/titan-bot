import { Link } from 'react-router';

import { Empty } from '@/ui/Empty';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';

export default function NotFound() {
  return (
    <Screen title="پیدا نشد">
      <Empty
        icon={<Icon3D name="magnifying-glass-tilted-left" size={52} />}
        title="این صفحه وجود ندارد"
        text="شاید لینک قدیمی باشد. از خانه ادامه بده."
        action={
          <Link to="/" replace className="btn btn--primary btn--sm">
            بازگشت به خانه
          </Link>
        }
      />
    </Screen>
  );
}
