import React, { useState } from 'react';
import { Card, CardContent } from '../../components/common';
import {
Users, Building2, Briefcase, Eye, TrendingUp, ShieldAlert,
AlertTriangle, Cpu, Database,
Globe, Zap, ArrowUpRight, ArrowDownRight,
Bell, RefreshCw, Calendar, BarChart2, UserPlus
} from 'lucide-react';
import {
AreaChart, Area, BarChart, Bar,
XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// 🔥 FIREBASE
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const db = getFirestore();

const weekData = [
{ name: 'Mon', users: 4200, active: 2400, signups: 120 },
{ name: 'Tue', users: 4800, active: 2900, signups: 145 },
{ name: 'Wed', users: 5300, active: 3400, signups: 189 },
{ name: 'Thu', users: 6100, active: 4000, signups: 210 },
{ name: 'Fri', users: 6700, active: 4500, signups: 175 },
{ name: 'Sat', users: 7200, active: 4900, signups: 140 },
{ name: 'Sun', users: 7800, active: 5300, signups: 230 },
];

const trafficData = [
{ name: 'Students', value: 68, color: '#3b82f6' },
{ name: 'Companies', value: 18, color: '#8b5cf6' },
{ name: 'Staff', value: 14, color: '#10b981' },
];

const featureUsage = [
{ name: 'Resume', uses: 4200 },
{ name: 'Internships', uses: 3800 },
{ name: 'Community', uses: 3100 },
{ name: 'Courses', uses: 2800 },
{ name: 'Practice', uses: 2400 },
{ name: 'Career', uses: 1900 },
];

const CUSTOM_TOOLTIP_STYLE = {
borderRadius: '12px',
border: 'none',
boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
fontSize: '12px',
};

export const AdminDashboardPage: React.FC = () => {

const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('7d');
const [refreshing, setRefreshing] = useState(false);
const [loadingAI, setLoadingAI] = useState(false);

// 🔥 AI AUTO ADD FUNCTION
const handleAutoAdd = async (type: string) => {
setLoadingAI(true);

```
try {
  const data = [
    {
      title: `New ${type} Opportunity`,
      link: "https://example.com",
      date: new Date().toISOString()
    }
  ];

  for (let item of data) {
    await addDoc(collection(db, "posts"), {
      title: item.title,
      link: item.link,
      type: type,
      status: "approved",
      createdAt: serverTimestamp(),
      expiryDate: new Date(item.date)
    });
  }

  alert(`${type} added successfully ✅`);
} catch (e) {
  console.error(e);
  alert("Error ❌");
}

setLoadingAI(false);
```

};

const handleRefresh = () => {
setRefreshing(true);
setTimeout(() => setRefreshing(false), 1500);
};

return ( <div className="space-y-6 animate-fade-in">

```
  {/* 🔥 AI BUTTONS */}
  <div className="flex gap-3 flex-wrap">
    <button onClick={() => handleAutoAdd("event")} className="px-4 py-2 bg-blue-600 text-white rounded-xl">
      Add Events (AI)
    </button>

    <button onClick={() => handleAutoAdd("course")} className="px-4 py-2 bg-green-600 text-white rounded-xl">
      Add Courses (AI)
    </button>

    <button onClick={() => handleAutoAdd("internship")} className="px-4 py-2 bg-purple-600 text-white rounded-xl">
      Add Internships (AI)
    </button>
  </div>

  {loadingAI && (
    <p className="text-sm text-blue-500">AI fetching data...</p>
  )}

  {/* HEADER */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>

    <button onClick={handleRefresh} className="flex items-center gap-2">
      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
      {refreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  </div>

  {/* CHART */}
  <Card>
    <div className="p-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={weekData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
          <Area dataKey="users" stroke="#3b82f6" />
          <Area dataKey="active" stroke="#10b981" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>

</div>
```

);
};
