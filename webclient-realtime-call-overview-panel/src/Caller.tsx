import { CallerInfo } from './wsApiTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function Caller({ callerInfo }: { callerInfo: CallerInfo }) {
  const { t } = useTranslation();

  const type = useMemo(() => {
    switch (callerInfo.type) {
      case 'IVR':
        return t('IVR');
      case 'Voicemail':
        return t('Voicemail');
      case 'External':
        return t('External');
      case 'Internal':
        return t('Internal');
      default:
        return undefined;
    }
  }, [callerInfo.type, t]);

  const displayName = callerInfo.displayName || type;

  return (
    <span className="whitespace-pre-wrap">
      <span className="inline-block mr-1 last:mr-0">
        {displayName || callerInfo.phoneNumber || t('Unknown')}
      </span>
      {displayName && callerInfo.phoneNumber && callerInfo.phoneNumber !== displayName &&
        <span className="inline-block">({callerInfo.phoneNumber})</span>
      }
    </span>
  );
}