import React from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode, User, Calendar, MapPin, Shield,
  Clock, Info
} from 'lucide-react';

const memberLevelNames: Record<string, string> = {
  silver: '银卡',
  gold: '金卡',
  diamond: '钻石卡'
};

const getMemberLevelName = (level: string) => memberLevelNames[level] || '银卡';

const getMemberLevelColor = (level: string) => {
  switch (level) {
    case 'diamond': return 'bg-purple-500';
    case 'gold': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const ETicket: React.FC = () => {
  const { currentUser, memberInfo } = useApp();
  
  const currentLevel = memberInfo?.level || currentUser?.memberLevel || 'silver';
  const ticketCode = `TICKET${currentUser?.id || '202400001'}`.toUpperCase();

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              <span className="font-semibold">国际会展中心</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMemberLevelColor(currentLevel)}`}>
              {getMemberLevelName(currentLevel)}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{currentUser?.username || '访客'}</h3>
              <p className="text-primary-100 text-sm">
                {currentUser?.role === 'exhibitor' ? '参展商' : '专业观众'}
              </p>
              <p className="text-primary-200 text-xs mt-1">票号: {ticketCode}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 flex justify-center">
            <QRCodeSVG
              value={ticketCode}
              size={200}
              level="H"
              includeMargin
            />
          </div>

          <p className="text-center text-primary-100 text-sm mt-4">
            入场时请出示此二维码扫码核验
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary-600" />
            证件信息
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-2">
                <User className="w-4 h-4" />
                姓名
              </span>
              <span className="font-medium">{currentUser?.username || '访客'}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                票号
              </span>
              <span className="font-medium font-mono">{ticketCode}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                展会日期
              </span>
              <span className="font-medium">2024.12.20 - 2024.12.23</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                展馆地址
              </span>
              <span className="font-medium">国际会展中心</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                入场时间
              </span>
              <span className="font-medium">09:00 - 17:00</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            温馨提示
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 请在入场前出示此电子证件，配合工作人员扫码核验</li>
            <li>• 一人一证，不得转借他人使用</li>
            <li>• 此证件有效期为展会全程，请妥善保管</li>
            <li>• 如需帮助，请联系现场工作人员或拨打服务热线</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ETicket;
