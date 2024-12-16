import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Spin } from 'antd';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDoc } from 'firebase/firestore';
import { AppContext } from '../../AppContext';
import { FIRESTORE_DB, ROUTES } from '../../common/constants';
import { Aman } from '../../assets/svg';
import {
  formValidatorRules,
  getDocFromStore,
  signInWithEmail,
} from '../../common/utils';
import useRouter from '../../hooks/useRouter';
import './auth.less';
import { auth } from '../../common/firebase';
import { messageContext } from '../../components/AppContextHolder';

const { required, email } = formValidatorRules;

const Login = () => {
  const [form] = Form.useForm();
  const { navigate } = useRouter();
  const { initializeAuth } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  function successCallback(accessToken, userData) {
    initializeAuth(accessToken, userData);
    navigate('/');
  }

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formValues = {
        email: values?.email?.trim().toLowerCase(),
        password: values?.password,
      };
      const response = await signInWithEmail(
        formValues?.email,
        formValues?.password,
      );
      if (response?.user) {
        auth?.onAuthStateChanged(async (user) => {
          try {
            const currentUser = getDocFromStore(FIRESTORE_DB?.USERS, user?.uid);
            const userInfo = await getDoc(currentUser);
            if (userInfo?.exists()) {
              const userData = userInfo?.data();
              const accessToken = response?.user?.accessToken;
              if (successCallback) {
                successCallback(accessToken, userData);
                messageContext?.success('Successfully Logged in!');
              }
            } else {
              messageContext?.info('No user data found');
            }
          } catch (error) {
            messageContext?.error(error?.message);
          }
        });
      } else {
        form?.setFieldsValue(values);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      messageContext?.error(error?.message);
    }
  };

  return (
    <div className="auth-bg">
      <div className="login-wrap d-flex align-center justify-start">
        <Card className="full-width">
          <Spin spinning={loading} wrapperClassName="full-width">
            <div className="text-center">
              <Aman />
            </div>
            <Form
              name="Login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
              form={form}
              disabled={loading}
            >
              <Form.Item
                name="email"
                rules={[{ required, message: 'Please enter email!' }, email]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                name="password"
                className="mb-8"
                rules={[{ required, message: 'Please enter password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter password"
                />
              </Form.Item>
              <Form.Item className="text-right mb-8">
                <Link to={ROUTES?.FORGET_PASSWORD}>Forgot password ?</Link>
              </Form.Item>
              <Form.Item className=" full-width mb-8">
                <Button
                  type="primary"
                  className="full-width"
                  htmlType="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </Card>
        <div className="text-center login-copyrights">
          Aman Devani © {new Date()?.getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Login;
