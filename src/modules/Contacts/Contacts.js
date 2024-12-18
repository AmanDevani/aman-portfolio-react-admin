import React, { useEffect, useState } from 'react';
import { Button, Card, Select, Space, Tooltip, Typography } from 'antd';
import { map } from 'lodash';
import { CloudDownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { FIRESTORE_DB, ORDER } from '../../common/constants';
import TableComponent from '../../components/CommonTable';
import {
  deleteDocument,
  exportDataAsCSV,
  getAllDocsFromStore,
} from '../../common/utils';
import {
  messageContext,
  modalContext,
} from '../../components/AppContextHolder';

const { Title, Text } = Typography;
const { Option } = Select;

const Contacts = () => {
  const [sort, setSort] = useState('desc');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    filters: [],
    order: [{ field: 'email', direction: 'desc' }],
    pagination: { pageSize: 10, lastVisible: null },
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

  const exportContactFields = [
    'id',
    'createdAt',
    'name',
    'email',
    'subject',
    'message',
  ];

  const fetchContacts = () => {
    setLoading(true);
    getAllDocsFromStore(FIRESTORE_DB?.CONTACTS, options)
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
      order: [{ field: 'createdAt', direction: value }],
    });
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    modalContext?.confirm({
      title: 'Are you sure, you want to delete this contact?',
      centered: true,
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        try {
          const res = deleteDocument(FIRESTORE_DB?.CONTACTS, id);
          if (res) {
            fetchContacts();
            messageContext?.success('Contact deleted successfully');
          }
        } catch (error) {
          messageContext?.error(error?.message);
        }
      },
    });
  };

  const Action = ({ id }) => (
    <Tooltip title="Delete Contact">
      <Button
        type="text"
        className="text-btn"
        onClick={(e) => handleDelete(e, id)}
      >
        <DeleteOutlined width={25} height={25} className="mb-4" />
      </Button>
    </Tooltip>
  );

  const columns = [
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Name',
      width: '10%',
      fixed: 'left',
    },
    {
      key: 'email',
      dataIndex: 'email',
      title: 'Email',
      width: '20%',
    },
    {
      key: 'subject',
      dataIndex: 'subject',
      title: 'Subject',
      width: '20%',
    },
    {
      key: 'message',
      dataIndex: 'message',
      title: 'Message',
      width: '25%',
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: 'Created At',
      width: '15%',
    },
    {
      title: 'Action',
      dataIndex: 'id',
      width: '20%',
      render: (value) => <Action id={value} />,
    },
  ];

  useEffect(() => {
    fetchContacts();
  }, [options]);

  return (
    <>
      <Title className="site-page-header p-0 mb-8 mt-0" level={3}>
        Contacts
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
                  <Tooltip title="Export Contacts">
                    <Button
                      className="ml-16 export-icon"
                      type="text"
                      onClick={() =>
                        exportDataAsCSV(
                          FIRESTORE_DB.CONTACTS,
                          exportContactFields,
                        )
                      }
                      icon={<CloudDownloadOutlined />}
                    />
                  </Tooltip>
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

export default Contacts;
