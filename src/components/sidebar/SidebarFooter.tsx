
import React from 'react';

const SidebarFooter: React.FC = () => {
  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="text-center">
        <p className="text-xs text-gray-500">
          © 2024 学習アプリ
        </p>
        <p className="text-xs text-gray-400 mt-1">
          バージョン 1.0.0
        </p>
      </div>
    </div>
  );
};

export default SidebarFooter;
