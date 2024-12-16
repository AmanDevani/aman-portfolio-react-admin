import React, { useEffect, useState } from 'react';
import { Button, Card, Select, Space, Tooltip, Typography } from 'antd';
import { map } from 'lodash';
import { DeleteOutlined } from '@ant-design/icons';
import { FIRESTORE_DB, ORDER, ROUTES } from '../../common/constants';
import useRouter from '../../hooks/useRouter';
import SearchComponent from '../../components/SearchComponent';
import TableComponent from '../../components/CommonTable';
import {
  deleteDocument,
  forgotPassword,
  getAllDocsFromStore,
} from '../../common/utils';
import { ResetPasswordIcon } from '../../assets/svg';
import {
  messageContext,
  modalContext,
} from '../../components/AppContextHolder';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Users = () => {
  const { navigate } = useRouter();
  const [sort, setSort] = useState('desc');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetPassLoading, setResetPassLoading] = useState(false);
  const [options, setOptions] = useState({
    filters: [],
    order: [{ field: 'email', direction: 'desc' }],
    pagination: { pageSize: 10, lastVisible: null },
    search: {},
  });

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 1,
      position: 'bottomRight',
      lastVisible: null,
    },
  });

  const handleSearchChange = (value) => {
    const searchValue = value;
    setOptions({
      ...options,
      search: { field: 'email', value: searchValue },
    });
  };

  const fetchUsers = () => {
    setLoading(true);
    getAllDocsFromStore(FIRESTORE_DB?.USERS, options)
      .then(async (res) => {
        setLoading(false);
        setData(res?.data);
        setTableParams((prevState) => ({
          ...prevState,
          pagination: {
            ...prevState.pagination,
            total: res?.totalCount,
            lastVisible: res?.lastVisible,
          },
        }));
      })
      .catch((error) => {
        setLoading(false);
        messageContext?.error(error?.message);
      });
  };

  const handleResetPassWord = async (email) => {
    setResetPassLoading(true);
    await forgotPassword(email)
      .then(() => {
        setResetPassLoading(false);
        messageContext?.success('Passwords reset link sent successfully');
      })
      .catch((error) => {
        setResetPassLoading(false);
        messageContext?.error(error?.message);
      });
  };

  const handleTableChange = (pagination) => {
    setTableParams((prevState) => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        current: pagination?.current,
        pageSize: pagination?.pageSize,
      },
    }));
    setOptions({
      ...options,
      pagination: {
        pageSize: pagination?.pageSize,
        ...(pagination?.current !== 1 && {
          lastVisible: tableParams?.pagination?.lastVisible,
        }),
      },
    });
  };

  const handleSortOrderChange = (value) => {
    setSort(value);
    setOptions({
      ...options,
      order: [{ field: 'email', direction: value }],
    });
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    modalContext?.confirm({
      title: 'Are you sure, you want to delete this user?',
      centered: true,
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        try {
          const res = deleteDocument(FIRESTORE_DB?.USERS, id);
          if (res) {
            fetchUsers();
            messageContext?.success('User deleted successfully');
          }
        } catch (error) {
          messageContext?.error(error?.message);
        }
      },
    });
  };

  const Action = ({ email, id }) => (
    <div className="d-flex align-center">
      <Button type="text" className="text-btn">
        <Paragraph
          className="copy-uid-icon"
          copyable={{
            onCopy: (e) => {
              e.stopPropagation();
            },
            text: id,
            tooltips: 'Copy UID',
          }}
        />
      </Button>
      <Tooltip title="Reset Password">
        <Button
          type="text"
          className="text-btn"
          onClick={() => handleResetPassWord(email)}
          loading={resetPassLoading}
        >
          <ResetPasswordIcon width={25} height={25} className="mb-4" />
        </Button>
      </Tooltip>
      <Tooltip title="Delete User">
        <Button
          type="text"
          className="text-btn"
          onClick={(e) => handleDelete(e, id)}
        >
          <DeleteOutlined width={25} height={25} className="mb-4" />
        </Button>
      </Tooltip>
    </div>
  );

  const columns = [
    {
      key: 'firstName',
      dataIndex: 'firstName',
      title: 'First Name',
      width: '15%',
      fixed: 'left',
    },
    {
      key: 'lastName',
      dataIndex: 'lastName',
      title: 'Last Name',
      width: '15%',
    },
    {
      key: 'userName',
      dataIndex: 'userName',
      title: 'User Name',
      width: '15%',
    },
    {
      key: 'email',
      dataIndex: 'email',
      title: 'Email',
      width: '20%',
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: 'Created At',
    },
    {
      title: 'Action',
      dataIndex: 'id',
      width: '15%',
      render: (value, record) => <Action id={value} email={record?.email} />,
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, [options]);

  return (
    <>
      <Title className="site-page-header p-0 mb-8 mt-0" level={3}>
        Users
      </Title>
      <Card
        className="ant-body-scroll"
        title={
          <>
            <div className="movies-sidebar">
              <div className="movie-filter-left">
                <div className="movie-filter">
                  <Space size="small" wrap>
                    <Text type="secondary">Sort Records By</Text>
                    <Select
                      defaultValue={sort}
                      onChange={handleSortOrderChange}
                    >
                      {map(ORDER, (orderType) => (
                        <Option key={orderType?.value} value={orderType?.value}>
                          {orderType?.name}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </div>
              </div>
              <div className="movie-filter-right">
                <div className="movie-filter">
                  <SearchComponent getData={handleSearchChange} />
                  <Button
                    className="ml-8"
                    key="1"
                    type="primary"
                    onClick={() => {
                      navigate(`${ROUTES?.ADD_USER}`);
                    }}
                  >
                    Add User
                  </Button>
                </div>
              </div>
            </div>
          </>
        }
      >
        <div className="card-body-wrapper">
          <TableComponent
            columns={columns}
            data={data}
            loadingData={loading}
            paginationConfig={tableParams?.pagination}
            rowKey={(record) => record?.id}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Card>
    </>
  );
};

export default Users;
