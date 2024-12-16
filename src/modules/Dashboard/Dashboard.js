import { ArrowUpOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import React from 'react';
import { GUTTER_VARIATIONS } from '../../common/constants';
import './dashboard.less';

const { Title } = Typography;
const Dashboard = () => (
  <>
    <Title className="site-page-header p-0 mb-8 mt-0" level={3}>
      Dashboard
    </Title>
    <div className="site-statistic-demo-card">
      <Row gutter={[GUTTER_VARIATIONS, GUTTER_VARIATIONS]}>
        <Col xs={{ span: 24 }} lg={{ span: 8 }}>
          <Card>
            <Statistic
              title="Active User"
              value={11.28}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 8 }}>
          <Card>
            <Statistic
              title="Idle User"
              value={11.28}
              precision={2}
              valueStyle={{ color: '#faad14' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 8 }}>
          <Card>
            <Statistic
              title="Deactivate User"
              value={11.28}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
    </div>
  </>
);

export default Dashboard;
