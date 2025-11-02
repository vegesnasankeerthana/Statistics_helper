import React, { useState } from 'react';
import axios from 'axios';

interface Schema {
  id: number;
  name: string;
  fields: string;
}

interface Field {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required: boolean;
}

interface DataEntryProps {
  schema: Schema;
  onEntryAdded: () => void;
}

const DataEntry: React.FC<DataEntryProps> = ({ schema, onEntryAdded }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const fields: Field[] = JSON.parse(schema.fields);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    for (const field of fields) {
      if (field.required && !formData[field.name]) {
        alert(`${field.name} is required`);
        return;
      }
    }

    try {
      setLoading(true);
      await axios.post('/api/entries', {
        schemaId: schema.id,
        data: formData
      });
      
      setFormData({});
      onEntryAdded();
      alert('Entry added successfully!');
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Error adding entry');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: Field) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || '')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Entry - {schema.name}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding Entry...' : 'Add Entry'}
        </button>
      </form>
    </div>
  );
};

export default DataEntry;