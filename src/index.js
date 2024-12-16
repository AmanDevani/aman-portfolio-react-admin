import React from 'react';
import ReactDOM from 'react-dom/client';
import { App, Button, ConfigProvider, message } from 'antd';
import './index.css';
import reportWebVitals from './reportWebVitals';
import './styles/main.less';
import themeJson from './styles/style.json';
import ConnectionMode from './components/ConnectionMode';
import CookieConsent from './components/CookieConsent';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import AppContextHolder from './components/AppContextHolder';
import RoutesWrapper from './RoutesWrapper';
import { AppContextProvider } from './AppContext';

// use this variable from envs so that we can active connection mode feature in app.
const connectionMode = process.env.REACT_APP_CONNECTION_MODE_ENABLE;

// use this variable from envs so that we can active cookie consent mode feature in app.
const cookieMode = process.env.REACT_APP_COOKIE_CONSENT_ENABLE;
// eslint-disable-next-line no-undef
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <AppContextProvider>
    <App>
      {/* Adding toast-container to render toast messages [ant v5.11.2] */}
      <AppContextHolder />
      <ConfigProvider theme={themeJson}>
        {/* Adding connection mode to notify user when they are offline/online */}
        {connectionMode === 'true' && <ConnectionMode />}
        {/* Adding cookie consent component to inform users about cookies we use */}
        {cookieMode === 'true' && <CookieConsent />}
        <RoutesWrapper />
      </ConfigProvider>
    </App>
  </AppContextProvider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorkerRegistration.unregister();
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    if (registration?.waiting) {
      // eslint-disable-next-line no-console
      console?.log('Inside registration');
      message?.info({
        content: (
          <>
            New version available! Click Reload to get the latest version.
            <Button
              className="ml-1 mb-0"
              type="link"
              onClick={() => {
                registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
                // eslint-disable-next-line no-undef
                window.location.reload();
              }}
            >
              Reload
            </Button>
          </>
        ),
        duration: 0,
      });
    }
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
