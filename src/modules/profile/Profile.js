import { LockOutlined } from '@ant-design/icons';
import { getDoc } from 'firebase/firestore';
import { Button, Card, Col, Form, Input, Row, Space, Spin } from 'antd';
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';
import useRouter from '../../hooks/useRouter';
import { auth } from '../../common/firebase';
import {
  formValidatorRules,
  getDocFromStore,
  handleProtectedNavigation,
  updateRecord,
} from '../../common/utils';
import { FIRESTORE_DB, ROUTES } from '../../common/constants';
import { messageContext } from '../../components/AppContextHolder';
import RouterPrompt from '../../components/RouterPrompt';
import CommonModal from '../../components/CommonModal';

const { required, name, email } = formValidatorRules;

function Profile() {
  const { dispatch, initializeAuth, getToken } = useContext(AppContext);
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [form] = Form?.useForm();
  const [changePassForm] = Form?.useForm();
  const { navigate } = useRouter();
  const idToken = getToken();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPrompt, setIsPrompt] = useState(false);

  const fetchUserDetails = () => {
    setUserInfoLoading(true); // Set loading to true before starting

    auth?.onAuthStateChanged(async (user) => {
      // Ensure the user object and UID are valid
      if (!user?.uid) {
        messageContext.error('User not found or not authenticated');
        setUserInfoLoading(false); // Set loading to false if user is not found
        return;
      }

      try {
        setUserId(user?.uid);
        // Fetch the document reference after validating the UID
        const currentUser = getDocFromStore(FIRESTORE_DB?.USERS, user?.uid);

        // Retrieve the user document
        const userInfo = await getDoc(currentUser);

        if (userInfo?.exists()) {
          const userData = userInfo?.data();
          // Optionally set form values
          form?.setFieldsValue({ ...userData });
        } else {
          messageContext.info('No user data found in Firestore');
        }
      } catch (error) {
        messageContext.error(error?.message);
      } finally {
        // Ensure loading is set to false after async operations
        setUserInfoLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleBack = () => {
    setIsPrompt(!handleProtectedNavigation(!showPrompt, navigate, -1));
  };

  const handleShowPrompt = () => {
    setShowPrompt(true);
  };

  const handleOk = () => {
    handleProtectedNavigation(true, navigate, -1);
  };

  const handleClose = () => {
    setIsPrompt(false);
  };

  const onFinish = async (values) => {
    setBtnLoading(true);
    setShowPrompt(false);
    const updatedData = {
      firstName: values?.firstName?.trim(),
      lastName: values?.lastName?.trim(),
      userName: values?.userName?.trim(),
      email: form?.getFieldValue('email'),
    };
    try {
      await updateRecord(FIRESTORE_DB?.USERS, userId, updatedData);
      dispatch({ type: 'SET_CURRENT_USER', data: updatedData });
      initializeAuth(idToken, updatedData);
      messageContext.success('Profile Updated Successfully');
    } catch (error) {
      messageContext?.error(error?.message);
    }
    setBtnLoading(false);
  };

  const onFinishChangePassword = async () => {
    changePassForm?.validateFields();
    const values = changePassForm?.getFieldsValue();
    try {
      setChangePassLoading(true);
      const authUser = getAuth();
      const user = authUser?.currentUser; // Get the currently logged-in user

      if (user) {
        const credential = EmailAuthProvider.credential(
          user?.email,
          values?.currentPassword,
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, values?.newPassword?.trim()); // Update the password
        setChangePassLoading(false);
        setIsModalOpen(false);
        changePassForm?.resetFields();
        messageContext.success('Password Updated Successfully!');
        navigate(ROUTES?.LOGOUT);
      }
    } catch (error) {
      messageContext.error(error?.message);
      setChangePassLoading(false);
    }
  };

  const onCancel = () => {
    setIsModalOpen(false);
    changePassForm?.resetFields();
  };

  return (
    <>
      {/* {userData?.getCurrentUser && ( */}
      <Spin spinning={userInfoLoading}>
        <Form
          form={form}
          className="sticky-action-form"
          onFieldsChange={handleShowPrompt}
          layout="vertical"
          disabled={userInfoLoading}
          // initialValues={userData?.getCurrentUser}
          onFinish={onFinish}
        >
          <Card
            className="ant-body-scroll"
            title={
              <>
                <div className="d-flex align-center justify-between">
                  Profile
                  <div className="text-right">
                    <Button
                      type="primary"
                      onClick={() => {
                        setIsModalOpen(true);
                      }}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </>
            }
            actions={[
              <div key="actionbutton" className="text-right">
                <Space>
                  <Button
                    onClick={handleBack}
                    disabled={btnLoading || userInfoLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    loading={btnLoading || userInfoLoading}
                    htmlType="submit"
                  >
                    Save
                  </Button>
                </Space>
              </div>,
            ]}
          >
            <div className="card-body-wrapper">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={8} xl={8}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      { ...required, message: 'Please Enter First Name' },
                      name,
                    ]}
                  >
                    <Input placeholder="Enter First Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8} xl={8}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      { ...required, message: 'Please Enter Last Name' },
                      name,
                    ]}
                  >
                    <Input placeholder="Enter Last Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8} xl={8}>
                  <Form.Item
                    name="userName"
                    label="User Name"
                    rules={[
                      { ...required, message: 'Please Enter User Name' },
                      name,
                    ]}
                  >
                    <Input placeholder="Enter User Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8} xl={8}>
                  <Form.Item
                    name="email"
                    label="Email Id"
                    rules={[
                      { ...required, message: 'Please Enter Email' },
                      email,
                    ]}
                  >
                    <Input disabled placeholder="Enter Email Id" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Card>
        </Form>
      </Spin>
      <RouterPrompt
        isPrompt={isPrompt}
        handleOK={handleOk}
        handleCancel={handleClose}
      />
      <CommonModal
        open={isModalOpen}
        title="Change Password"
        okText="Change Password"
        onOk={onFinishChangePassword}
        onCancel={onCancel}
      >
        <div className="change-pass-modal">
          <Spin spinning={changePassLoading}>
            <Form
              name="reset-password"
              form={changePassForm}
              size="large"
              disabled={changePassLoading}
              layout="vertical"
            >
              <Form.Item
                name="currentPassword"
                rules={[
                  { required, message: 'Please enter current password!' },
                ]}
                label="Current Password"
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter current password"
                />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[{ required, message: 'Please enter new password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter new password"
                />
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </CommonModal>
    </>
  );
}
export default Profile;
