import React, { createContext, useReducer } from 'react';
import { TOKEN, USER } from './common/constants';

const getLoggedInUser = () => {
  // eslint-disable-next-line no-undef
  let loggedInUser = localStorage?.getItem(USER);
  loggedInUser = loggedInUser ? JSON?.parse(loggedInUser) : null;

  return loggedInUser;
};

const initialState = {
  currentUser: getLoggedInUser() || {},
  // eslint-disable-next-line no-undef
  authToken: localStorage?.getItem(TOKEN),
  showPrompt: false,
};

const reducer = (state, action) => {
  switch (action?.type) {
    case 'SET_CURRENT_USER':
      // eslint-disable-next-line no-case-declarations
      const user = action?.data || {};
      // eslint-disable-next-line no-undef
      localStorage.setItem(
        USER,
        user && Object?.keys(user)?.length ? JSON?.stringify(user) : null,
      );
      return { ...state, currentUser: { ...user } };
    case 'LOGOUT':
      // eslint-disable-next-line no-undef
      localStorage?.clear();
      return {
        ...initialState,
        authenticated: false,
        authToken: null,
        user: {},
      };
    case 'SET_FETCHING_USER_DETAILS':
      return { ...state, fetchingUserDetails: action?.data };
    case 'SET_AUTHENTICATED':
      return { ...state, authenticated: action?.data };
    case 'SET_TOKEN':
      // eslint-disable-next-line no-undef
      localStorage.setItem(TOKEN, action?.data);
      return { ...state, authToken: action?.data };
    case 'SET_INITIAL_SHOW_ALL_FIELDS_STATUS':
      return { ...state, initialShowAllFieldStatus: action?.data };
    default:
      return { ...state };
  }
};

const AppContext = createContext({
  state: initialState,
  dispatch: () => {},
});

function AppContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getToken = () =>
    // eslint-disable-next-line no-undef
    localStorage?.getItem(TOKEN) || null;
  const getCurrentUser = () =>
    // eslint-disable-next-line no-undef
    localStorage?.getItem(USER)
      ? // eslint-disable-next-line no-undef
        JSON?.parse(localStorage?.getItem(USER))
      : {};
  const getCurrentUserRole = () => {
    const loggedInUser = getLoggedInUser();
    return loggedInUser?.roles?.[0] || '';
  };

  const isAuthenticated = () => state?.authenticated;

  const initializeAuth = (authToken, userData) => {
    const token = authToken || getToken();
    const user = userData || getCurrentUser();
    if (token) {
      dispatch({ type: 'SET_TOKEN', data: token });
      dispatch({ type: 'SET_AUTHENTICATED', data: true });
      dispatch({ type: 'SET_CURRENT_USER', data: user });
    }
  };

  const value = {
    state,
    dispatch,
    isAuthenticated,
    getToken,
    initializeAuth,
    getCurrentUserRole,
    getCurrentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const AppContextConsumer = AppContext?.Consumer;

export { AppContext, AppContextConsumer, AppContextProvider };
