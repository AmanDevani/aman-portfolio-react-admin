/* ROUTERS  */
export const ROUTES = {
  MAIN: '/',
  LOGOUT: '/logout',
  LOGIN: '/login',
  FORGET_PASSWORD: '/forgot-password',
  RESET: '/reset-password',
  VERIFY: '/verify',
  AUTHENTICATION: '/authentication',
  USERS: '/users',
  PROFILE: '/profile',
  CONTACTS: '/contacts',
  ADD_USER: '/users/add',
};

/*  Modules */
export const MODULES = {
  DASHBOARD: 'Dashboard',
  USERS: 'Users',
  CONTACTS: 'Contacts',
};

/* Authentication */
export const TOKEN = 'TOKEN';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';
export const USER = 'USER';

export const REGEX = {
  NAME: /^[a-z ,.'-]+$/i,
  ZIPCODE: /^[0-9]{5,6}$/,
  CITY: /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/,
  WEB_URL:
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
  PASSWORD: /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  EMAIL:
    /^(([^<>()[\]\\.,;:!#$*%^'`~={}?/&\s@"]+(\.[^<>()[\]\\.,;:!#$*%^'`~={}?/&\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  AMOUNT: /^\d+$|^\d+\.\d*$/,
  OPTIONALNEGATIVEAMOUNT: /^[-]?\d+$|^[-]?\d+\.\d*$/,
  NUMBER: /^\d+$/,
  COUNTRY_CODE_PHONE: /^[0-9]{7,12}$/,
};

export const LIMIT = 10;
export const SCROLL_PERCENT = 0.85;

export const ERROR_PAGE_TITLE = 'Oops! An error occurred!';
export const ERROR_PAGE_SUBTITLE =
  'Something is broken. Please let us know what you were doing when this error occurred. We will fix it as soon as possible. Sorry for any inconvenience caused.';

export const GUTTER_VARIATIONS = { xs: 16, sm: 16, md: 24, lg: 32 };

export const BREAKPOINTS = {
  mobile: 550,
  tablet: 767,
  desktop: 1000,
  hd: 1200,
};

export const ORDER = [
  { name: 'Ascending', value: 'asc' },
  { name: 'Descending', value: 'desc' },
];

export const FIRESTORE_DB = {
  USERS: 'Users',
  CONTACTS: 'Contacts',
};

export const ADD_USER_TYPE = {
  BY_UID: 'uid',
  MANUAL: 'manual',
};

export const defaultDateFormat = 'DD/MM/YYYY | hh:mm:ss A';
