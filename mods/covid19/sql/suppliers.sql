CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER ,
  publickey TEXT ,
  name TEXT ,
  address TEXT ,
  phone INTEGER , 
  email VARCHAR(255) ,
  wechat VARCHAR(255) ,
  notes TEXT , 
  PRIMARY KEY(id ASC)
);

