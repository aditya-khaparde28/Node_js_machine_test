const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();
const app = express();

// Create connection to MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'product_management_db'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

// Category  CRUD operations
app.get('/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving categories');
      return;
    }
    res.render('categories', { categories: results });
  });
});

app.post('/categories', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO categories (name) VALUES (?)', [name], (err, result) => {
    if (err) {
      res.status(500).send('Error creating category');
      return;
    }
    res.redirect('/categories');
  });
});

//update
// Update category route
app.post('/categories/update/:id', (req, res) => {
    const categoryId = req.params.id;
    const { name } = req.body;
    
    db.query('UPDATE categories SET name = ? WHERE id = ?', [name, categoryId], (err, result) => {
      if (err) {
        res.status(500).send('Error updating category');
        return;
      }
      res.redirect('/categories'); 
    });
  });
  
  //delete
// Delete category route
app.post('/categories/delete/:id', (req, res) => {
    const categoryId = req.params.id;
  
    // Delete all products in the category first
    db.query('DELETE FROM products WHERE categoryId = ?', [categoryId], (err, result) => {
      if (err) {
        res.status(500).send('Error deleting products');
        return;
      }
  
      // Once products are deleted, delete the category
      db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err, result) => {
        if (err) {
          res.status(500).send('Error deleting category');
          return;
        }
        res.redirect('/categories'); // Redirect back to categories page
      });
    });
  });
  

app.get('/products', (req, res) => {
    const categoryId = req.query.categoryId;
    const page = req.query.page || 1; 
    const limit = 10; 
    const offset = (page - 1) * limit;

    db.query('SELECT COUNT(*) AS total FROM products', (err, result) => {
        if (err) {
            res.status(500).send('Error retrieving products');
            return;
        }
        const totalProducts = result[0].total;

        if (!categoryId) {
            db.query('SELECT * FROM products LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
                if (err) {
                    res.status(500).send('Error retrieving products');
                    return;
                }
                res.render('products', { products: results, totalProducts, page, limit });
            });
        } else {
          
            db.query('SELECT * FROM products WHERE categoryId = ? LIMIT ? OFFSET ?', [categoryId, limit, offset], (err, results) => {
                if (err) {
                    res.status(500).send('Error retrieving products');
                    return;
                }
                res.render('products', { products: results, totalProducts, page, limit });
            });
        }
    });
});


app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
      if (err) {
        res.status(500).send('Error retrieving products');
        return;
      }
    res.render('products', { products: products, categories: categories });
    });
  });

  
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));