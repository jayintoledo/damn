import React from 'react';
import Dashboard from '@/components/Dashboard';
import { Helmet } from 'react-helmet';

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Coinbase Webhook Bot Dashboard</title>
        <meta name="description" content="Monitor and control your Coinbase webhook trading bot" />
      </Helmet>
      <Dashboard />
    </>
  );
};

export default Home;
