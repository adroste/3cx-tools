import { CallOverview } from './CallOverview';
import { LoginView } from './LoginView';
import { cxContext } from './CxContext';
import { useContext } from 'react';

export function Main() {
  const { loggedIn } = useContext(cxContext);

  if (!loggedIn)
    return <LoginView />;

  return <CallOverview />;
}
