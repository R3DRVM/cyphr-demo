import React, { useState } from 'react';

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const activeOrders = [
    {
      id: 'ORD-001',
      token: 'PEPE',
      type: 'BUY',
      amount: '1000',
      price: '$0.00001234',
      status: 'pending',
      time: '2 minutes ago',
      progress: 75
    },
    {
      id: 'ORD-002',
      token: 'DOGE',
      type: 'SELL',
      amount: '500',
      price: '$0.0789',
      status: 'executing',
      time: '5 minutes ago',
      progress: 45
    },
    {
      id: 'ORD-003',
      token: 'SHIB',
      type: 'BUY',
      amount: '2000',
      price: '$0.00002345',
      status: 'pending',
      time: '8 minutes ago',
      progress: 20
    }
  ];

  const orderHistory = [
    {
      id: 'ORD-004',
      token: 'PEPE',
      type: 'BUY',
      amount: '500',
      price: '$0.00001230',
      status: 'completed',
      time: '1 hour ago',
      executedPrice: '$0.00001232'
    },
    {
      id: 'ORD-005',
      token: 'DOGE',
      type: 'SELL',
      amount: '1000',
      price: '$0.0790',
      status: 'cancelled',
      time: '2 hours ago',
      executedPrice: null
    },
    {
      id: 'ORD-006',
      token: 'BONK',
      type: 'BUY',
      amount: '1500',
      price: '$0.00004500',
      status: 'completed',
      time: '3 hours ago',
      executedPrice: '$0.00004567'
    }
  ];

  const orderStats = {
    totalOrders: 156,
    completedOrders: 142,
    pendingOrders: 8,
    cancelledOrders: 6,
    totalVolume: '$45,234.56',
    successRate: '91.0%'
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-cyphr-white mb-2 font-nulshock">Orders</h1>
        <p className="text-cyphr-gray font-sf-pro">Manage your trading orders and view order history</p>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="cyphr-card p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.15) 0%, rgba(189,73,111,0.15) 100%)',
            border: '2px solid rgba(45,186,161,0.3)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-cyphr-gray text-sm font-semibold mb-2">Total Orders</div>
          <div className="text-2xl font-bold text-cyphr-white">{orderStats.totalOrders}</div>
        </div>
        
        <div className="cyphr-card p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
            border: '2px solid rgba(45,186,161,0.25)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-cyphr-gray text-sm font-semibold mb-2">Success Rate</div>
          <div className="text-2xl font-bold text-cyphr-teal">{orderStats.successRate}</div>
        </div>
        
        <div className="cyphr-card p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
            border: '2px solid rgba(45,186,161,0.25)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-cyphr-gray text-sm font-semibold mb-2">Total Volume</div>
          <div className="text-xl font-bold text-cyphr-white">{orderStats.totalVolume}</div>
        </div>
        
        <div className="cyphr-card p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
            border: '2px solid rgba(45,186,161,0.25)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-cyphr-gray text-sm font-semibold mb-2">Pending</div>
          <div className="text-2xl font-bold text-cyphr-pink">{orderStats.pendingOrders}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex bg-cyphr-dark-gray rounded-2xl p-2 border border-cyphr-gray">
          {['active', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-cyphr-teal text-cyphr-black shadow-lg'
                  : 'text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Content */}
      {activeTab === 'active' && (
        <div className="cyphr-card p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
            border: '2px solid rgba(45,186,161,0.25)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">Active Orders</h3>
            <span className="text-cyphr-teal text-lg">⚡</span>
          </div>
          
          {activeOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-cyphr-gray text-4xl mb-4">📋</div>
              <div className="text-cyphr-gray font-sf-pro text-lg">No active orders</div>
              <div className="text-cyphr-gray text-sm">Your active orders will appear here</div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="p-6 rounded-xl bg-cyphr-black/50 border border-cyphr-gray/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyphr-teal to-cyphr-pink rounded-xl flex items-center justify-center text-cyphr-black font-bold text-lg shadow-lg">
                        {order.token.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-cyphr-white text-lg">{order.token}</div>
                        <div className="text-cyphr-gray text-sm">Order #{order.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        order.type === 'BUY' ? 'text-cyphr-teal' : 'text-cyphr-pink'
                      }`}>
                        {order.type}
                      </div>
                      <div className="text-cyphr-gray text-sm">{order.time}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-cyphr-gray text-sm">Amount</div>
                      <div className="font-bold text-cyphr-white">${order.amount}</div>
                    </div>
                    <div>
                      <div className="text-cyphr-gray text-sm">Price</div>
                      <div className="font-bold text-cyphr-white">{order.price}</div>
                    </div>
                    <div>
                      <div className="text-cyphr-gray text-sm">Status</div>
                      <div className={`font-semibold ${
                        order.status === 'pending' ? 'text-cyphr-pink' : 'text-cyphr-teal'
                      }`}>
                        {order.status.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-cyphr-gray text-sm">Progress</div>
                      <div className="font-bold text-cyphr-white">{order.progress}%</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-cyphr-dark-gray rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-cyphr-teal to-cyphr-pink h-2 rounded-full transition-all duration-300"
                      style={{ width: `${order.progress}%` }}
                    ></div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray transition-all duration-200 border border-cyphr-gray/30">
                      Cancel Order
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray transition-all duration-200 border border-cyphr-gray/30">
                      Modify
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyphr-dark-gray text-cyphr-gray hover:text-cyphr-white hover:bg-cyphr-gray transition-all duration-200 border border-cyphr-gray/30">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="cyphr-card p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,186,161,0.12) 0%, rgba(189,73,111,0.12) 100%)',
            border: '2px solid rgba(45,186,161,0.25)',
            boxShadow: '0 8px 32px 0 rgba(45,186,161,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-cyphr-teal font-nulshock text-lg font-semibold">Order History</h3>
            <span className="text-cyphr-teal text-lg">📊</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-cyphr-gray">
                  <th className="px-6 py-4 text-left text-cyphr-teal font-bold text-sm tracking-wide">Order ID</th>
                  <th className="px-6 py-4 text-left text-cyphr-teal font-bold text-sm tracking-wide">Token</th>
                  <th className="px-6 py-4 text-left text-cyphr-teal font-bold text-sm tracking-wide">Type</th>
                  <th className="px-6 py-4 text-left text-cyphr-teal font-bold text-sm tracking-wide">Amount</th>
                  <th className="px-6 py-4 text-left text-cyphr-teal font-bold text-sm tracking-wide">Price</th>
                  <th className="px-6 py-4 text-left text-cyphr-teal font-bold text-sm tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-cyphr-teal font-bold text-sm tracking-wide">Executed Price</th>
                  <th className="px-6 py-4 text-left text-cyphr-teal font-bold text-sm tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((order) => (
                  <tr key={order.id} className="border-b border-cyphr-gray/30 hover:bg-cyphr-black/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="font-mono text-cyphr-white text-sm">{order.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyphr-teal to-cyphr-pink rounded-lg flex items-center justify-center text-cyphr-black font-bold text-sm shadow-lg">
                          {order.token.charAt(0)}
                        </div>
                        <span className="font-bold text-cyphr-white">{order.token}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.type === 'BUY' ? 'bg-cyphr-teal text-cyphr-black' : 'bg-cyphr-pink text-cyphr-white'
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-cyphr-white">${order.amount}</td>
                    <td className="px-6 py-4 font-bold text-cyphr-white">{order.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'completed' ? 'bg-cyphr-teal text-cyphr-black' : 
                        order.status === 'cancelled' ? 'bg-cyphr-pink text-cyphr-white' : 
                        'bg-cyphr-gray text-cyphr-black'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-cyphr-gray text-sm">
                        {order.executedPrice || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-cyphr-gray text-sm">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 