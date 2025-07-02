import React from 'react';
import { BarChart3, TrendingUp, Users, Activity, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHealth } from '../../contexts/HealthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export function AnalyticsDashboard() {
  const { patients, consultations, referrals } = useHealth();

  // Calculate analytics data
  const totalPatients = patients.length;
  const totalConsultations = consultations.length;
  const totalReferrals = referrals.length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

  // Age group distribution
  const ageGroups = patients.reduce((acc, patient) => {
    const ageGroup = patient.age < 18 ? 'Children' : 
                    patient.age < 60 ? 'Adults' : 'Elderly';
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ageGroupData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

  // Gender distribution
  const genderData = patients.reduce((acc, patient) => {
    const gender = patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const genderChartData = Object.entries(genderData).map(([name, value]) => ({ name, value }));

  // Common symptoms analysis
  const symptomCounts = consultations.reduce((acc, consultation) => {
    consultation.symptoms.forEach(symptom => {
      acc[symptom] = (acc[symptom] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topSymptoms = Object.entries(symptomCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // Monthly consultation trends (simulated)
  const monthlyData = [
    { month: 'Jan', consultations: 12, referrals: 3 },
    { month: 'Feb', consultations: 15, referrals: 4 },
    { month: 'Mar', consultations: 18, referrals: 2 },
    { month: 'Apr', consultations: 22, referrals: 5 },
    { month: 'May', consultations: 25, referrals: 6 },
    { month: 'Jun', consultations: 20, referrals: 4 }
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Health Analytics</h2>
        <p className="text-gray-600">Community health insights and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Total Patients', 
            value: totalPatients, 
            icon: Users, 
            color: 'text-blue-600 bg-blue-100',
            change: '+12%',
            changeColor: 'text-green-600'
          },
          { 
            title: 'Consultations', 
            value: totalConsultations, 
            icon: Activity, 
            color: 'text-green-600 bg-green-100',
            change: '+8%',
            changeColor: 'text-green-600'
          },
          { 
            title: 'Active Referrals', 
            value: pendingReferrals, 
            icon: TrendingUp, 
            color: 'text-orange-600 bg-orange-100',
            change: '-5%',
            changeColor: 'text-red-600'
          },
          { 
            title: 'Total Referrals', 
            value: totalReferrals, 
            icon: BarChart3, 
            color: 'text-purple-600 bg-purple-100',
            change: '+15%',
            changeColor: 'text-green-600'
          }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <p className={`text-sm mt-1 ${metric.changeColor}`}>
                    {metric.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="consultations" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Consultations"
              />
              <Line 
                type="monotone" 
                dataKey="referrals" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Referrals"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Age Group Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Age Group Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageGroupData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ageGroupData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Common Symptoms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Common Symptoms</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSymptoms} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Gender Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genderChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Health Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Health Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Disease Surveillance</h4>
            <p className="text-sm text-blue-700">
              Fever cases increased by 20% this month. Consider community awareness program.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Preventive Care</h4>
            <p className="text-sm text-green-700">
              85% of patients received preventive counseling. Good adherence to protocols.
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Referral Efficiency</h4>
            <p className="text-sm text-orange-700">
              Average referral response time: 2.5 hours. Target: &lt;2 hours for emergencies.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Data Sovereignty Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-emerald-50 border border-emerald-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-emerald-900 mb-1">Community Data Sovereignty</h4>
            <p className="text-sm text-emerald-700">
              All health data remains under community control using Earthstar protocol. 
              Analytics are generated locally and shared only with explicit consent. 
              No external servers or third-party access to sensitive patient information.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}