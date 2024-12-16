import React from 'react';
import { Modal } from 'antd';

const CommonModal = (props) => {
  const {
    open = false,
    onOk,
    onCancel,
    title,
    children,
    okText = 'OK',
    showFooter = true,
    closable = true,
    ...rest
  } = props;
  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      title={title}
      okText={okText}
      destroyOnClose
      footer={showFooter ? undefined : null}
      closable={closable}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export default CommonModal;
