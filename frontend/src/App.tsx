import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SchemaDesigner from './components/SchemaDesigner';
import DataEntry from './components/DataEntry';
import DataViewer from './components/DataViewer';
import StatisticalAnalysis from './components/StatisticalAnalysis';
import ExportImport from './components/ExportImport';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

interface Schema {
  id: number;
  name: string;
  fields: string;
  createdAt: string;
  entries?: Entry[];
}

interface Entry {
  id: number;
  schemaId: number;
  data: string;
  createdAt: string;
}

type ActiveTab = 'schema' | 'entry' | 'viewer' | 'analysis' | 'export';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('schema');
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchemas();
  }, []);
  
  const fetchSchemas = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/schemas');
      setSchemas(response.data);
      if (response.data.length > 0 && !selectedSchema) {
        setSelectedSchema(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching schemas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchemaCreated = () => {
    fetchSchemas();
  };

  const tabs = [
    { id: 'schema' as ActiveTab, name: 'Schema Designer', icon: '🎨' },
    { id: 'entry' as ActiveTab, name: 'Data Entry', icon: '✏️' },
    { id: 'viewer' as ActiveTab, name: 'Data Viewer', icon: '👁️' },
    { id: 'analysis' as ActiveTab, name: 'Statistical Analysis', icon: '📊' },
    { id: 'export' as ActiveTab, name: 'Export/Import', icon: '📤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Statistics Helper</h1>
              <span className="ml-2 text-sm text-gray-500">📈</span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedSchema?.id || ''}
                onChange={(e) => {
                  const schema = schemas.find(s => s.id === parseInt(e.target.value));
                  setSelectedSchema(schema || null);
                }}
                className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a schema...</option>
                {schemas.map(schema => (
                  <option key={schema.id} value={schema.id}>
                    {schema.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {activeTab === 'schema' && (
            <SchemaDesigner onSchemaCreated={handleSchemaCreated} />
          )}

          {activeTab === 'entry' && selectedSchema && (
            <DataEntry schema={selectedSchema} onEntryAdded={fetchSchemas} />
          )}

          {activeTab === 'viewer' && selectedSchema && (
            <DataViewer schema={selectedSchema} />
          )}

          {activeTab === 'analysis' && selectedSchema && (
            <StatisticalAnalysis schema={selectedSchema} />
          )}

          {activeTab === 'export' && selectedSchema && (
            <ExportImport schema={selectedSchema} />
          )}

          {activeTab !== 'schema' && !selectedSchema && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium">No Schema Selected</h3>
                <p className="mt-2">Please select a schema from the dropdown or create a new one.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;