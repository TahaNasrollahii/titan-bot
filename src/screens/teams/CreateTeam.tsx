import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Shield } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';

import { errorText } from '@/api/client';
import { teamsApi } from '@/api/endpoints';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { toast } from '@/ui/Toast';

import './teams.css';

const MAX_LOGO = 2 * 1024 * 1024;

export default function CreateTeam() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!logo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(logo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  const create = useMutation({
    mutationFn: () => teamsApi.create(name.trim(), logo),
    onSuccess: team => {
      void queryClient.invalidateQueries({ queryKey: ['me', 'teams'] });
      toast.success('تیم ساخته شد! حالا هم‌تیمی‌هایت را دعوت کن.');
      navigate(`/teams/${team.id}`, { replace: true });
    },
    onError: error => toast.error(errorText(error)),
  });

  return (
    <Screen title="ساخت تیم" fallback="/teams" noTabs>
      <div className="team-hero">
        <label className="avatar" style={{ '--size': '96px', cursor: 'pointer' } as CSSProperties}>
          <span className="avatar__inner" style={{ background: 'var(--surface-3)' }}>
            {preview ? <img src={preview} alt="" /> : <ImagePlus size={30} color="var(--muted)" />}
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={e => {
              const file = e.target.files?.[0] ?? null;
              if (file && file.size > MAX_LOGO) {
                toast.error('حجم لوگو باید کمتر از ۲ مگابایت باشد.');
                return;
              }
              setLogo(file);
            }}
          />
        </label>
        <span className="text-xs muted">لوگوی تیم (اختیاری)</span>
      </div>
      <label className="field section">
        <span className="field__label">نام تیم</span>
        <input className="input ltr" maxLength={40} placeholder="Titan Esports" value={name} onChange={e => setName(e.target.value)} />
        <span className="text-xs muted">نام تیم در براکت‌ها و جدول رده‌بندی نمایش داده می‌شود.</span>
      </label>
      <div className="action-bar">
        <Button
          size="lg"
          block
          disabled={name.trim().length < 3}
          loading={create.isPending}
          onClick={() => create.mutate()}
          icon={<Shield size={20} />}
        >
          ساخت تیم
        </Button>
      </div>
    </Screen>
  );
}
