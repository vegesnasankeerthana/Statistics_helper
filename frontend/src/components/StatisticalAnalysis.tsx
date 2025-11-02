import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Schema {
  id: number;
  name: string;
  fields: string;
}

interface StatisticalAnalysisProps {
  schema: Schema;
}

const StatisticalAnalysis: React.FC<StatisticalAnalysisProps> = ({ schema }) => {
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, [schema.id]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/schemas/${schema.id}/statistics`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Calculating statistics...</div>;
  }

  const chartData = Object.keys(statistics).map(fieldName => ({
    name: fieldName,
    mean: statistics[fieldName].mean,
    median: statistics[fieldName].median,
    min: statistics[fieldName].min,
    max: statistics[fieldName].max
  }));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistical Analysis - {schema.name}</h2>
      
      {Object.keys(statistics).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No numerical data found for statistical analysis.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(statistics).map(([fieldName, stats]: [string, any]) => (
              <div key={fieldName} className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{fieldName}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Count:</span>
                    <span className="text-sm font-medium">{stats.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mean:</span>
                    <span className="text-sm font-medium">{stats.mean.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Median:</span>
                    <span className="text-sm font-medium">{stats.median.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Min:</span>
                    <span className="text-sm font-medium">{stats.min.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Max:</span>
                    <span className="text-sm font-medium">{stats.max.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Std Dev:</span>
                    <span className="text-sm font-medium">{stats.standardDeviation.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Statistical Overview</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mean" fill="#3B82F6" name="Mean" />
                  <Bar dataKey="median" fill="#10B981" name="Median" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticalAnalysis;