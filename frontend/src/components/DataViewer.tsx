import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Schema {
  id: number;
  name: string;
  fields: string;
}

interface Entry {
  id: number;
  schemaId: number;
  data: string;
  createdAt: string;
}

interface Field {
  name: string;
  type: string;
  required: boolean;
}

interface DataViewerProps {
  schema: Schema;
}

const DataViewer: React.FC<DataViewerProps> = ({ schema }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  const fields: Field[] = JSON.parse(schema.fields);

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

  const deleteEntry = async (entryId: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`/api/entries/${entryId}`);
        fetchEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading entries...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Viewer - {schema.name}</h2>
      
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No entries found. Add some data using the Data Entry tab.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {fields.map((field, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {field.name}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => {
                const data = JSON.parse(entry.data);
                return (
                  <tr key={entry.id}>
                    {fields.map((field, index) => (
                      <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data[field.name] || '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataViewer;