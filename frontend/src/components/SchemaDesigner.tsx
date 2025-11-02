import React, { useState } from 'react';
import axios from 'axios';

interface Field {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required: boolean;
}

interface SchemaDesignerProps {
  onSchemaCreated: () => void;
}

const SchemaDesigner: React.FC<SchemaDesignerProps> = ({ onSchemaCreated }) => {
  const [schemaName, setSchemaName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [newField, setNewField] = useState<Field>({
    name: '',
    type: 'text',
    required: false
  });
  const [selectOptions, setSelectOptions] = useState('');
  const [loading, setLoading] = useState(false);

  const addField = () => {
    if (!newField.name) return;
    
    const field: Field = { ...newField };
    if (newField.type === 'select') {
      field.options = selectOptions.split(',').map(opt => opt.trim()).filter(opt => opt);
    }
    
    setFields([...fields, field]);
    setNewField({ name: '', type: 'text', required: false });
    setSelectOptions('');
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const createSchema = async () => {
    if (!schemaName || fields.length === 0) return;
    
    try {
      setLoading(true);
      await axios.post('/api/schemas', {
        name: schemaName,
        fields: fields
      });
      
      setSchemaName('');
      setFields([]);
      onSchemaCreated();
      alert('Schema created successfully!');
    } catch (error) {
      console.error('Error creating schema:', error);
      alert('Error creating schema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Schema Designer</h2>
      
      {/* Schema Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Schema Name
        </label>
        <input
          type="text"
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Survey Data, Experiment Results"
        />
      </div>

      {/* Add New Field */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Field</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Name
            </label>
            <input
              type="text"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Age, Score"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Type
            </label>
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value as Field['type'] })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select Options</option>
            </select>
          </div>
          
          {newField.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (comma-separated)
              </label>
              <input
                type="text"
                value={selectOptions}
                onChange={(e) => setSelectOptions(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Required</span>
            </label>
          </div>
        </div>
        
        <button
          onClick={addField}
          disabled={!newField.name}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Add Field
        </button>
      </div>

      {/* Fields List */}
      {fields.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schema Fields</h3>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{field.name}</span>
                  <span className="text-sm text-gray-500">({field.type})</span>
                  {field.required && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>}
                  {field.options && (
                    <span className="text-xs text-gray-600">
                      Options: {field.options.join(', ')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeField(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Schema Button */}
      <button
        onClick={createSchema}
        disabled={!schemaName || fields.length === 0 || loading}
        className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Schema'}
      </button>
    </div>
  );
};

export default SchemaDesigner;