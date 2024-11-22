import mysql from 'mysql2';
import dotenv from 'dotenv';


//?Express Application: REST API to contact the database using node.js

//Initializes dotenv
dotenv.config(); 

//MySQL connection:
const pool = mysql
    .createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    })
    //*Converts the MySQL connection into a Promise-based interface. All calls to this connection return Promises, which are cleaner and allow error handeling
    .promise();  

//?Auth Requests: ---------------------------------------------------------------------------------------------------------------------------------------------
export async function getUser(email, password){
   try {
      const [result] = await pool.query(
   
         `
         SELECT
         *
         FROM accounts
         WHERE email = ? AND password = ?;
         `,
         [email, password]
      );
   
      return result[0];
   } catch (error) {
      console.log('Error querying the database: ', error)
   }
}

async function userExists(email){
   try {
      const [result] = await pool.query(
         `
         SELECT *
         FROM accounts
         WHERE email = ?;
         `,
         [email]
      );

      return result.length > 0;
      
   } catch (error) {
      console.log('Error querying the database: ', error);
   }
}

export async function registerNewUser(username, password, email) {
   // Get a connection from the pool
   const connection = await pool.getConnection(); 
   
   try {
      // Start the transaction
      await connection.beginTransaction();

      // Check if the user already exists
      const exists = await userExists(email);
      if (exists) {
         console.log('User already exists');
         connection.release(); // Release the connection back to the pool
         return false;
      }

      // Insert the new user into the accounts table
      const [result] = await connection.query(
         `
         INSERT INTO accounts (username, password, email, activation_code, admin) 
         VALUES (?, ?, ?, 'activated', 'diy')
         `,
         [username, password, email]
      );

      // Commit the transaction
      await connection.commit();

      console.log('User registered successfully:', result);
      connection.release(); // Release the connection back to the pool
      return true;

   } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      console.log('Error during registration:', error);
      connection.release(); 
      throw error; 
   }
}


//? Waste Data Input Requests: ---------------------------------------------------------------------------------------------------------------------------------
export async function getCategories() {
   try {
      const [result] = await pool.query(
         `
         SELECT
            id,
            name,
            icon_name
         FROM CATEGORIES;
         `
      );
      return result;
   } catch (error) {
      console.log('Error querying the database', error);
   }
}

export async function getWasteItemsByCategory(categoryID){

   try {
      const [result] = await pool.query(
         `SELECT
            id,
            name,
            category_id
         FROM wasteitems
         WHERE category_id = ?;`,
         [categoryID]
      );
      console.log(result);
      return result;
   } catch (error) {
      console.log('Error querying the database', error);
   }
}

export async function createNewWasteRecord (username, wasteItemID, unitOfMeasurement, categoryID) {
   // Get a connection from the pool
   const connection = await pool.getConnection(); 
   
   try {
      // Start the transaction
      await connection.beginTransaction();

      let result;

      //Common waste table
      if(categoryID === 2 || categoryID === 3 || categoryID === 4 || categoryID === 11 ){
         [result] = await connection.query(
            `
            INSERT INTO common_waste_history (username, waste_item_id, weight, modified_date)
            VALUES(?, ?, ?, NOW());
            `,
            [username, wasteItemID, unitOfMeasurement]
         );
      } 
      //Bulk waste table
      else{
         [result] = await connection.query(
            `
            INSERT INTO bulk_waste_history (username, waste_item_id, units, modified_date)
            VALUES(?, ?, ?, NOW());
            `,
            [username, wasteItemID, unitOfMeasurement]
         );
      }      

      // Commit the transaction
      await connection.commit();

      console.log('Record added successfully', result);
      connection.release(); // Release the connection back to the pool
      return true;

   } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      connection.release(); 
      return false;
   }
}

export async function getCommonWasteHistory(username) {
   try {
      const [result] = await pool.query(
         `SELECT 
            t1.waste_item_id,
            t2.name,
            t1.weight
         FROM common_waste_history t1
         LEFT JOIN wasteitems t2 on t1.waste_item_id = t2.id
         WHERE username = ?; `,
         [username]
      );
      console.log(result);
      return result;
   } catch (error) {
      console.log('Error querying the database', error);
   }
}

export async function getBulkWasteHistory(username) {
   try {
      const [result] = await pool.query(
         `SELECT 
            t1.waste_item_id,
            t2.name,
            t1.units
         FROM bulk_waste_history t1
         LEFT JOIN wasteitems t2 on t1.waste_item_id = t2.id
         WHERE username = ?; `,
         [username]
      );
      console.log(result);
      return result;
   } catch (error) {
      console.log('Error querying the database', error);
   }
}


