const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'ordersStatusData.json');

app.use(cors());
app.use(express.json());

// Helper function to read data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading file:', error);
    return [];
  }
}

// Helper function to write data
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
}

// GET: Lấy danh sách domains
app.get("/api/orders-status", async (req, res) => {
  try {
    const domains = await readData();
    res.status(200).json(domains);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// POST: Thêm domain mới
// new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
app.post("/api/orders-status", async (req, res) => {
  try {
    const domains = await readData();
    const newDomain = {
      id: req.body.id,
      ip: req.body.ip,
      domain: req.body.domain,
      date: req.body.date
    };
    domains.push(newDomain);
    await writeData(domains);
    res.status(201).json(newDomain);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// PUT: Cập nhật domain
app.put("/api/orders-status/:id", async (req, res) => {
  try {
    const domains = await readData();
    const index = domains.findIndex(domain => domain.id === req.params.id);
    if (index === -1) {
      return res.status(404).send('Domain not found');
    }
    domains[index] = { ...domains[index], ...req.body, id: req.params.id };
    await writeData(domains);
    res.status(200).json(domains[index]);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// DELETE: Xóa domain
app.delete("/api/orders-status/:id", async (req, res) => {
  try {
    let domains = await readData();
    const initialLength = domains.length;
    domains = domains.filter(domain => domain.id !== req.params.id);
    if (domains.length === initialLength) {
      return res.status(404).send('Domain not found');
    }
    await writeData(domains);
    res.status(200).send('Domain deleted successfully');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});