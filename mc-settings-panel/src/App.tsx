import { Main } from './Main';
import { NavButton } from './NavButton';
import { createPortal } from 'react-dom';
import { useMemo } from 'react';
import { useRouter } from './useRouter';

function App() {
  const [hash,] = useRouter();

  const isActive = useMemo(() => {
    return hash.includes('tcx-tools-settings-active');
  }, [hash]);

  return (
    <>
      {isActive && createPortal(
        <div className="tcx-tools-wrapper absolute w-full h-full top-0 left-0 bottom-0 right-0 z-10 p-6">
          <Main />
        </div>,
        document.querySelector('.app-content')!
      )}
      {createPortal(
        <div className="tcx-tools-wrapper w-full z-10">
          <NavButton />
        </div>,
        document.querySelector('nav')!
      )}
    </>
  );
}

export default App;
