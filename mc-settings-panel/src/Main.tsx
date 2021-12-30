import { useContext, useMemo, useState } from 'react';

import { CsvContactsConverter } from './CsvContactsConverter';
import { LoginView } from './LoginView';
import { useTranslation } from 'react-i18next';
import { wsApiContext } from './WsApiContext';

export function Main() {
  const { loggedIn, connected } = useContext(wsApiContext);
  const { t } = useTranslation();
  const [navKey, setNavKey] = useState<string>('dialcodes');

  const tabs = useMemo(() => {
    return [
      {
        key: 'dialcodes',
        name: t('Dial codes'),
        component: <span>dial codes</span>,
        click: () => setNavKey('dialcodes'),
      },
      {
        key: 'csv-converter',
        name: t('CSV Contacts Converter'),
        component: <CsvContactsConverter />,
        click: () => setNavKey('csv-converter'),
      }
    ];
  }, [t]);

  const activeComponent = useMemo(() => {
    return tabs.find(t => t.key === navKey)?.component;
  }, [navKey, tabs]);

  if (!loggedIn)
    return <LoginView />;

  if (!connected)
    return (
      <div className="w-full h-full z-50 flex items-center justify-center">
        <div className="text-xl">{t('Connecting')}...</div>
      </div>
    );

  return (
    <div className="bg-white rounded p-4">
      <div className="border-b border-gray-200">
        <div className="sm:flex sm:items-baseline">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            3CX Tools
          </h3>
          <div className="mt-4 sm:mt-0 sm:ml-10">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={tab.click}
                  className={`
                  ${tab.key === navKey
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                `}
                  aria-current={tab.key === navKey ? 'page' : undefined}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {activeComponent}
      </div>
    </div>
  );
}
