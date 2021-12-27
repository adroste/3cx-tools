import { CallOverview } from './CallOverview';
import { LoginView } from './LoginView';
import { useContext } from 'react';
import { wsApiContext } from './WsApiContext';

export function Main() {
  const { loggedIn } = useContext(wsApiContext);

  if (!loggedIn)
    return <LoginView />;

  return <CallOverview />;
}
