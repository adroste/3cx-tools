import { CallOverview } from './CallOverview';
import { LoginView } from './LoginView';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { wsApiContext } from './WsApiContext';

export function Main() {
  const { loggedIn, connected } = useContext(wsApiContext);
  const { t } = useTranslation();

  if (!loggedIn)
    return <LoginView />;
  
  if (!connected)
    return (
      <div className="w-full h-full z-50 flex items-center justify-center">
        <div className="text-xl">{t('Connecting')}...</div>
      </div>
    );

  return <CallOverview />;
}
