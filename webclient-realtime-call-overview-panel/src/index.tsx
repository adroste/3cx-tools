import './index.css';
import './i18n';

import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import { WsApiContextProvider } from './WsApiContext';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { initHistory } from './history';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import reportWebVitals from './reportWebVitals';

dayjs.extend(localizedFormat)
dayjs.extend(duration);

initHistory();

const root = document.createElement('div');
root.id = 'tcx-tools-panel-app';
root.className = 'tcx-tools-wrapper';
document.body.appendChild(root);

ReactDOM.render(
  <React.StrictMode>
    <WsApiContextProvider>
      <App />
    </WsApiContextProvider>
  </React.StrictMode>,
  root
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
