import { App } from 'antd';

// eslint-disable-next-line import/no-mutable-exports
let messageContext;
// eslint-disable-next-line import/no-mutable-exports
let modalContext;
// eslint-disable-next-line import/no-mutable-exports
let notificationContext;

// import/no-anonymous-default-export
export default () => {
  const { message, modal, notification } = App?.useApp();
  messageContext = message;
  modalContext = modal;
  notificationContext = notification;
  return null;
};

export { messageContext, modalContext, notificationContext };
