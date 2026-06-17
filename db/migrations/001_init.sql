-- Adnanpay PPOB Web v2 — initial schema.
-- Run with: mysql -u root -p < db/migrations/001_init.sql

CREATE DATABASE IF NOT EXISTS adnanpay_ppob
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE adnanpay_ppob;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category ENUM('Pulsa','Data','Game') NOT NULL,
  base_price INT NOT NULL,
  buyer_sku_code VARCHAR(100),
  needs_zone BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  digiflazz_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pricing_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NULL,
  category ENUM('Pulsa','Data','Game') NULL,
  margin_type ENUM('fixed','percentage') NOT NULL,
  margin_value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_code VARCHAR(50) UNIQUE NOT NULL,
  product_id INT NOT NULL,
  product_name_snapshot VARCHAR(200) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  zone_id VARCHAR(50) NULL,
  base_price_snapshot INT NOT NULL,
  sell_price_snapshot INT NOT NULL,
  profit INT NOT NULL,
  payment_status ENUM('pending','success','failed','expired') DEFAULT 'pending',
  fulfillment_status ENUM('pending','processing','success','failed') DEFAULT 'pending',
  sn VARCHAR(255) NULL,
  midtrans_order_id VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_orders_invoice ON orders(invoice_code);
CREATE INDEX idx_orders_payment ON orders(payment_status);

-- Seed admin user. Username: admin, Password: admin123
-- Hash generated with bcrypt (cost 10). To regenerate:
--   node -e "import('bcryptjs').then(b => console.log(b.hashSync('admin123', 10)))"
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$8K1P/aQ9dVc2dF5t2vFpdeK7HvN7KQXfH8d/3jRw8eV2cM4nLZb1K')
ON DUPLICATE KEY UPDATE username = username;
