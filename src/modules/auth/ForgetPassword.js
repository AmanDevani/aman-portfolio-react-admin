import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Spin } from 'antd';
import React, { useState } from 'react';
import { Aman } from '../../assets/svg';
import { ROUTES } from '../../common/constants';
import { forgotPassword, formValidatorRules } from '../../common/utils';
import useRouter from '../../hooks/useRouter';
import { messageContext } from '../../components/AppContextHolder';

const { required, email } = formValidatorRules;

const ForgetPassword = () => {
  const { navigate } = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formValues = {
        email: values?.email?.trim()?.toLowerCase(),
      };
      await forgotPassword(formValues?.email);
      setLoading(false);
      messageContext?.success('Reset password link sent successfully!');
      form?.resetFields();
    } catch (error) {
      setLoading(false);
      messageContext?.error(error?.message);
    }
  };
  return (
    <div className="auth-bg">
      <div className="login-wrap d-flex align-center justify-center">
        <Card className="full-width">
          <div className="text-center">
            <Aman />
            <h2 className="text-center mb-8">Forgot Your Password ?</h2>
            <p className="text-center mb-8">
              Don't worry. Recovering the password is easy. Just tell us the
              email.
            </p>
          </div>
          <Spin spinning={false}>
            <Form
              layout="vertical"
              onFinish={onFinish}
              size="large"
              form={form}
            >
              <Form.Item
                name="email"
                rules={[{ required, message: 'Please enter email!' }, email]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter email" />
              </Form.Item>
              <Form.Item className="full-width mb-8">
                <Button
                  type="primary"
                  loading={loading}
                  disabled={loading}
                  className="full-width"
                  htmlType="submit"
                >
                  Reset Password
                </Button>
              </Form.Item>
              <Form.Item className="text-center mb-0">
                <Button
                  type="link"
                  onClick={() => {
                    navigate(ROUTES?.LOGIN);
                  }}
                >
                  Cancel
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

export default ForgetPassword;
