import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Schema {
  id: number;
  name: string;
  fields: string;
}

interface ExportImportProps {
  schema: Schema;
}

const ExportImport: React.FC<ExportImportProps> = ({ schema }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [schema.id]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/schemas/${schema.id}/entries`);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (entries.length === 0) {
      alert('No data to export');
      return;
    }

    const fields = JSON.parse(schema.fields);
    const csvHeaders = fields.map((f: any) => f.name).join(',');
    
    const csvRows = entries.map(entry => {
      const data = JSON.parse(entry.data);
      return fields.map((f: any) => data[f.name] || '').join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schema.name}_export.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (entries.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = {
      schema: schema,
      entries: entries.map(entry => ({
        ...entry,
        data: JSON.parse(entry.data)
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schema.name}_export.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Export/Import - {schema.name}
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
          <div className="flex space-x-4">
            <button
              onClick={exportToCSV}
              disabled={loading || entries.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              Export as CSV
            </button>
            <button
              onClick={exportToJSON}
              disabled={loading || entries.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300"
            >
              Export as JSON
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Total entries: {entries.length}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Import Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import functionality can be added here for CSV/JSON files
          </p>
          <input
            type="file"
            accept=".csv,.json"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled
          />
          <p className="mt-1 text-xs text-gray-400">Import feature coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default ExportImport;