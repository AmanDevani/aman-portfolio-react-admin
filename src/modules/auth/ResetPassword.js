import { LockOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Spin } from 'antd';
import React, { useState } from 'react';
import { Aman } from '../../assets/svg';
import { ROUTES } from '../../common/constants';
import { formValidatorRules, resetPassword } from '../../common/utils';
import useRouter from '../../hooks/useRouter';
import { messageContext } from '../../components/AppContextHolder';

const { required } = formValidatorRules;

const ChangePassword = () => {
  const {
    navigate,
    location: { search },
  } = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(search);
  const oobCode = params?.get('oobCode');

  const onFinish = async ({ password }) => {
    setLoading(true);
    try {
      await resetPassword(oobCode, password).then(() => {
        form?.resetFields();
        messageContext?.success('Password reset successfully!');
        navigate(ROUTES?.LOGIN);
      });
      setLoading(false);
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
            <h2 className="text-center">Reset Password</h2>
            <p className="text-center m-8">
              Enter a new password for your account
            </p>
          </div>
          <Spin spinning={loading}>
            <Form
              name="reset-password"
              form={form}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
              disabled={loading}
            >
              <Form.Item
                name="password"
                rules={[{ required, message: 'Please enter password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter password"
                />
              </Form.Item>
              <Form.Item
                name="retype-password"
                rules={[
                  { required, message: 'Please enter confirm password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value !== getFieldValue('password')) {
                        return Promise?.reject(
                          new Error('Passwords do not match'),
                        );
                      }
                      return Promise?.resolve();
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter confirm password"
                />
              </Form.Item>
              <Form.Item className="full-width mb-8">
                <Button
                  type="primary"
                  className="full-width"
                  htmlType="submit"
                  loading={loading}
                  disabled={loading}
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
                  loading={loading}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
