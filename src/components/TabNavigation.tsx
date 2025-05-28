'use client';

import { useState } from 'react';
import RealBusData from './RealBusData';
import RouteSearch from './RouteSearch';

type Tab = 'nearby' | 'routes';

interface TabItem {
  id: Tab;
  label: string;
  icon: string;
  description: string;
}

const tabs: TabItem[] = [
  {
    id: 'nearby',
    label: '주변 정류장',
    icon: '📍',
    description: '현재 위치 기반 정류장 검색'
  },
  {
    id: 'routes',
    label: '노선 검색',
    icon: '🚌',
    description: '버스 노선 정보 검색'
  }
];

export default function TabNavigation() {
  const [activeTab, setActiveTab] = useState<Tab>('nearby');

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 탭 헤더 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-center bg-white rounded-lg p-2 shadow-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">{tab.icon}</span>
                <div className="text-left">
                  <div className="font-bold">{tab.label}</div>
                  <div className={`text-xs ${
                    activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="min-h-[600px]">
        {activeTab === 'nearby' && <RealBusData />}
        {activeTab === 'routes' && <RouteSearch />}
      </div>
    </div>
  );
} 