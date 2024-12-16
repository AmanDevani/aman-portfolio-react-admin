import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { getIdToken } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { AppContext } from './AppContext';
import Error404 from './Error404';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import App from './app/App';
import history from './historyData';
import { FIRESTORE_DB, ROUTES } from './common/constants';
import MaintenancePage from './components/MaintenancePage';
import Dashboard from './modules/Dashboard/Dashboard';
import Users from './modules/Users/Users';
import ForgetPassword from './modules/auth/ForgetPassword';
import Login from './modules/auth/Login';
import Logout from './modules/auth/Logout';
import ResetPassword from './modules/auth/ResetPassword';
import Profile from './modules/profile/Profile';
import AddEditUser from './modules/Users/AddEditUser';
import { messageContext } from './components/AppContextHolder';
import { getDocFromStore } from './common/utils';
import { auth } from './common/firebase';
import LoaderComponent from './components/LoaderComponent';
import Contacts from './modules/Contacts/Contacts';

const RoutesCollection = () => {
  const AUTH_MODULES = [
    {
      path: ROUTES?.LOGIN,
      element: <PublicRoute />,
      // Nested routes use a children property
      children: [{ path: ROUTES?.LOGIN, element: <Login /> }],
    },
    {
      path: ROUTES?.FORGET_PASSWORD,
      element: <PublicRoute />,
      children: [
        { path: ROUTES?.FORGET_PASSWORD, element: <ForgetPassword /> },
      ],
    },
    {
      path: ROUTES?.RESET,
      element: <PublicRoute />,
      children: [{ path: ROUTES?.RESET, element: <ResetPassword /> }],
    },
    {
      path: ROUTES?.LOGOUT,
      element: <PrivateRoute />,
      children: [{ path: ROUTES?.LOGOUT, element: <Logout /> }],
    },
  ];

  const DASHBOARD_MODULES = [
    {
      path: ROUTES?.MAIN,
      element: <PrivateRoute />,
      children: [
        {
          path: ROUTES?.MAIN,
          element: <App />,
          children: [{ path: ROUTES?.MAIN, element: <Dashboard /> }],
        },
      ],
    },
  ];
  const USERS_MODULE = [
    {
      path: ROUTES?.MAIN,
      element: <PrivateRoute />,
      children: [
        {
          path: ROUTES?.MAIN,
          element: <App />,
          children: [
            { path: ROUTES?.USERS, element: <Users /> },
            { path: ROUTES?.ADD_USER, element: <AddEditUser /> },
          ],
        },
      ],
    },
  ];

  const USER_MODULES = [
    {
      path: ROUTES?.MAIN,
      element: <PrivateRoute />,
      children: [
        {
          path: ROUTES?.MAIN,
          element: <App />,
          children: [
            {
              path: ROUTES?.PROFILE,
              element: <Profile />,
            },
          ],
        },
      ],
    },
  ];

  const CONTACTS_MODULES = [
    {
      path: ROUTES?.MAIN,
      element: <PrivateRoute />,
      children: [
        {
          path: ROUTES?.MAIN,
          element: <App />,
          children: [{ path: ROUTES?.CONTACTS, element: <Contacts /> }],
        },
      ],
    },
  ];

  const OTHER_MODULES = [
    {
      path: ROUTES?.MAIN,
      element: <PrivateRoute />,
      children: [
        {
          path: ROUTES?.MAIN,
          element: <App />,
          children: [
            {
              path: '*',
              element: <Error404 />,
            },
          ],
        },
      ],
    },
  ];

  const element = useRoutes([
    ...AUTH_MODULES,
    ...DASHBOARD_MODULES,
    ...USERS_MODULE,
    ...USER_MODULES,
    ...CONTACTS_MODULES,
    ...OTHER_MODULES,
  ]);
  return element;
};

const checkTokenExpiry = (token) => {
  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT to get payload
    const expirationTime = decodedToken?.exp * 1000;
    const currentTime = Date.now();

    const isExpired = currentTime > expirationTime;

    return isExpired;
  } catch (error) {
    messageContext.error(error?.message);
  }
};

const RoutesWrapper = () => {
  const { initializeAuth, getToken } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const path = history?.location?.pathname;
  const idToken = getToken();

  const fetchUserDetails = async () => {
    auth?.onAuthStateChanged(async (user) => {
      // Ensure the user object and UID are valid
      if (!user?.uid) {
        messageContext.error('User not found or not authenticated');
        return;
      }

      try {
        // Fetch the document reference after validating the UID
        const currentUser = getDocFromStore(FIRESTORE_DB?.USERS, user?.uid);

        // Retrieve the user document
        const userInfo = await getDoc(currentUser);

        if (userInfo?.exists()) {
          const userData = userInfo?.data();
          if (userData && idToken) {
            const isExpired = checkTokenExpiry(idToken);
            if (isExpired) {
              const token = await getIdToken(user, true);
              initializeAuth(token, userData);
              messageContext.success('Refreshed Token Generated');
            } else {
              initializeAuth(idToken, userData);
            }
          }
          setLoading(false);
        } else {
          messageContext?.info('No user data found in Firestore');
        }
      } catch (error) {
        messageContext?.error(error?.message);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    if (path === ROUTES?.LOGOUT || idToken) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, []);

  // use this variable from envs so that we can able to run maintenance page on runtime.
  const maintenance = process.env.REACT_APP_MAINTENANCE_ENABLE;

  if (loading) return <LoaderComponent />;
  return (
    <Router>
      {maintenance === 'true' ? <MaintenancePage /> : <RoutesCollection />}
    </Router>
  );
};
export default RoutesWrapper;
