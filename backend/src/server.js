const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Get all schemas
app.get('/api/schemas', async (req, res) => {
  try {
    const schemas = await prisma.schema.findMany({
      include: {
        entries: true
      }
    });
    res.json(schemas);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new schema
app.post('/api/schemas', async (req, res) => {
  try {
    const { name, fields } = req.body;
    const schema = await prisma.schema.create({
      data: {
        name,
        fields: JSON.stringify(fields)
      }
    });
    res.json(schema);
  } catch (error) {
    console.error('Error creating schema:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get schema by ID
app.get('/api/schemas/:id', async (req, res) => {
  try {
    const schema = await prisma.schema.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        entries: true
      }
    });
    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    res.json(schema);
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new entry
app.post('/api/entries', async (req, res) => {
  try {
    const { schemaId, data } = req.body;
    const entry = await prisma.entry.create({
      data: {
        schemaId: parseInt(schemaId),
        data: JSON.stringify(data)
      }
    });
    res.json(entry);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get entries for a schema
app.get('/api/schemas/:id/entries', async (req, res) => {
  try {
    const entries = await prisma.entry.findMany({
      where: { schemaId: parseInt(req.params.id) }
    });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete entry
app.delete('/api/entries/:id', async (req, res) => {
  try {
    await prisma.entry.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics for a schema
app.get('/api/schemas/:id/statistics', async (req, res) => {
  try {
    const entries = await prisma.entry.findMany({
      where: { schemaId: parseInt(req.params.id) }
    });
    
    const schema = await prisma.schema.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    
    const fields = JSON.parse(schema.fields);
    const data = entries.map(entry => JSON.parse(entry.data));
    
    const statistics = calculateStatistics(data, fields);
    res.json(statistics);
  } catch (error) {
    console.error('Error calculating statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Statistics calculation helper
function calculateStatistics(data, fields) {
  const stats = {};
  
  fields.forEach(field => {
    if (field.type === 'number') {
      const values = data
        .map(item => parseFloat(item[field.name]))
        .filter(v => !isNaN(v) && v !== null && v !== undefined);
      
      if (values.length > 0) {
        const sortedValues = values.sort((a, b) => a - b);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        
        stats[field.name] = {
          count: values.length,
          mean: mean,
          median: getMedian(sortedValues),
          min: Math.min(...values),
          max: Math.max(...values),
          standardDeviation: Math.sqrt(variance),
          variance: variance
        };
      }
    }
  });
  
  return stats;
}

function getMedian(sortedValues) {
  const mid = Math.floor(sortedValues.length / 2);
  return sortedValues.length % 2 !== 0 
    ? sortedValues[mid] 
    : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Statistics Helper Backend Ready!`);
  console.log(`🔗 Test the API at http://localhost:${PORT}/api/test`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});