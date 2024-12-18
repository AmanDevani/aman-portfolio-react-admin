import { Button, Card, Col, Form, Input, Radio, Row } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  forgotPassword,
  formValidatorRules,
  handleProtectedNavigation,
  setDocTOFireStore,
} from '../../common/utils';
import { messageContext } from '../../components/AppContextHolder';
import RouterPrompt from '../../components/RouterPrompt';
import useRouter from '../../hooks/useRouter';
import {
  ADD_USER_TYPE,
  defaultDateFormat,
  FIRESTORE_DB,
  GUTTER_VARIATIONS,
  ROUTES,
} from '../../common/constants';

const { email } = formValidatorRules;

const initialValues = {
  type: ADD_USER_TYPE?.MANUAL,
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  password: 'Admin@25',
};

const AddEditUser = () => {
  const [form] = Form.useForm();
  const { navigate } = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPrompt, setIsPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const type = Form?.useWatch('type', form);

  const formattedDate = dayjs().format(defaultDateFormat);

  const addUserHandler = async (values) => {
    setLoading(true);
    if (type === ADD_USER_TYPE?.MANUAL) {
      const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values?.email,
            password: values?.password,
            returnSecureToken: false, // Disable auto-login
          }),
        });

        const data = await response.json();
        if (data) {
          await setDocTOFireStore(FIRESTORE_DB?.USERS, data?.localId, {
            email: data?.email?.trim(),
            firstName: values?.firstName?.trim(),
            lastName: values?.lastName?.trim(),
            userName: values?.userName?.trim(),
            createdAt: formattedDate,
          })
            .then(async () => {
              await forgotPassword(values?.email?.trim())
                .then(() => {
                  setLoading(false);
                  messageContext?.success('User Registered Successfully');
                  navigate(ROUTES?.USERS);
                  form?.resetFields();
                })
                .catch(() => {
                  messageContext?.error(
                    'Error while Storing data in firestore',
                  );
                });
            })
            .catch(() => {
              messageContext?.error('Error while Storing data in firestore');
            });
        }
      } catch (error) {
        messageContext?.error(error?.message);
        setLoading(false);
      }
    } else {
      await setDocTOFireStore(FIRESTORE_DB?.USERS, values?.uid?.trim(), {
        email: values?.email?.trim(),
        firstName: values?.firstName?.trim(),
        lastName: values?.lastName?.trim(),
        userName: values?.userName?.trim(),
        createdAt: formattedDate,
      })
        .then(async () => {
          await forgotPassword(values?.email?.trim())
            .then(() => {
              setLoading(false);
              messageContext?.success('User Added Successfully');
              navigate(ROUTES?.USERS);
              form?.resetFields();
            })
            .catch(() => {
              messageContext?.error('Error while Storing data in firestore');
            });
        })
        .catch(() => {
          messageContext?.error('Error while Storing data in firestore');
        });
    }
  };

  const handleOk = () => {
    handleProtectedNavigation(true, navigate, -1);
  };

  const handleCancel = () => {
    setIsPrompt(false);
  };

  const handleShowPrompt = () => {
    setShowPrompt(true);
  };

  const handleBack = () => {
    setIsPrompt(!handleProtectedNavigation(!showPrompt, navigate, -1));
  };

  return (
    <>
      <Card
        title={
          <>
            <Button
              type="text"
              shape="circle"
              onClick={handleBack}
              icon={<ArrowLeftOutlined />}
            />
            Create User
          </>
        }
      >
        <div className="add-user-wrapper">
          <div>
            <Form
              onFinish={addUserHandler}
              onValuesChange={handleShowPrompt}
              form={form}
              layout="vertical"
              disabled={loading}
              initialValues={initialValues}
            >
              <Row gutter={GUTTER_VARIATIONS}>
                <Col xs={24} sm={12} lg={12}>
                  <Form.Item name="type" label="Select Method">
                    <Radio.Group>
                      <Radio value={ADD_USER_TYPE?.BY_UID}>By Uid</Radio>
                      <Radio value={ADD_USER_TYPE?.MANUAL}>Manual</Radio>
                    </Radio.Group>
                  </Form.Item>
                  {type === ADD_USER_TYPE?.BY_UID && (
                    <Form.Item
                      name="uid"
                      label="Uid"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: 'Please Enter Uid!',
                        },
                      ]}
                    >
                      <Input placeholder="Enter Uid" />
                    </Form.Item>
                  )}
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: 'Please Enter First Name!',
                      },
                    ]}
                  >
                    <Input placeholder="Enter First Name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: 'Please Enter Email!',
                      },
                      email,
                    ]}
                  >
                    <Input placeholder="Enter Email" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={12}>
                  <Form.Item
                    name="userName"
                    label="User Name"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: 'Please Enter User Name!',
                      },
                    ]}
                  >
                    <Input placeholder="Enter User Name" />
                  </Form.Item>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: 'Please Enter Last Name!',
                      },
                    ]}
                  >
                    <Input placeholder="Enter Last Name" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: 'Please Enter Password!',
                      },
                    ]}
                  >
                    <Input.Password placeholder="Enter Password" />
                  </Form.Item>
                </Col>
              </Row>

              <div className="d-flex align-center">
                <Button
                  className="mr-8"
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Create User
                </Button>
                <Button
                  loading={loading}
                  disabled={loading}
                  onClick={handleBack}
                  type="link"
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Card>
      <RouterPrompt
        isPrompt={isPrompt}
        handleOK={handleOk}
        handleCancel={handleCancel}
      />
    </>
  );
};

export default AddEditUser;
