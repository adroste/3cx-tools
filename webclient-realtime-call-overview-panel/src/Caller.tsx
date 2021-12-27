import { CallerInfo } from './wsApiTypes';
import { useTranslation } from 'react-i18next';

export function Caller({ callerInfo }: { callerInfo: CallerInfo }) {
  const { t } = useTranslation();

  return (
    <span className="whitespace-pre-wrap">
      <span className="inline-block mr-1 last:mr-0">{callerInfo.displayName || callerInfo.phoneNumber || t('Unknown')}</span>
      {callerInfo.displayName && callerInfo.phoneNumber && callerInfo.phoneNumber !== callerInfo.displayName &&
        <span className="inline-block">({callerInfo.phoneNumber})</span>
      }
    </span>
  );
}