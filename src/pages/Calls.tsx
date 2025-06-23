import React from 'react';
import Sidebar from '../components/Sidebar';
import { CallLogs } from '../components/CallLogs';

const Calls: React.FC = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 pt-24 bg-gray-50 min-h-screen">
        <CallLogs />
      </div>
    </div>
  );
};

export default Calls;
