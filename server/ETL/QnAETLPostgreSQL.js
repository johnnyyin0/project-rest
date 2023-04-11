const path = require('path')
const client = require('../database')

async function createTables() {
  try {
      // drop tables if exists
      await client.query(`DROP TABLE IF EXISTS questions, answers, answers_photos CASCADE`);

      // create questions table with indexes
      await client.query(`
          CREATE TABLE IF NOT EXISTS questions (
              question_id SERIAL PRIMARY KEY,
              product_id INT,
              question_body TEXT,
              question_date VARCHAR(255),
              asker_name VARCHAR(255),
              asker_email VARCHAR(255),
              reported INT,
              question_helpfulness INT
          );
          CREATE INDEX idx_questions_product_id ON questions (product_id);
          CREATE INDEX idx_questions_reported ON questions (reported);
          CREATE INDEX idx_questions_question_helpfulness ON questions (question_helpfulness);
      `);

      // create answers table with indexes
      await client.query(`
          CREATE TABLE IF NOT EXISTS answers (
              id SERIAL PRIMARY KEY,
              question_id INT REFERENCES questions(question_id),
              answer_body TEXT,
              answer_date VARCHAR(255) ,
              answerer_name VARCHAR(255),
              answerer_email VARCHAR(255),
              reported INT,
              answer_helpfulness INT
          );
          CREATE INDEX idx_answers_question_id ON answers (question_id);
          CREATE INDEX idx_answers_reported ON answers (reported);
          CREATE INDEX idx_answers_answer_helpfulness ON answers (answer_helpfulness);
      `);

      // create answers_photos table with indexes
      await client.query(`
          CREATE TABLE IF NOT EXISTS answers_photos (
              id SERIAL PRIMARY KEY,
              answer_id INT REFERENCES answers(id),
              url VARCHAR(255)
          );
          CREATE INDEX idx_answers_photos_answer_id ON answers_photos (answer_id);
      `);
  } catch (error) {
      console.error('Error creating tables:', error);
  }
}
  
  async function insertData() {
    try {
      // insert questions data
      await client.query(`
        COPY questions (question_id, product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness)
        FROM '${path.join(__dirname, '../../../sdc-data/questions.csv')}' 
        DELIMITER ',' 
        CSV HEADER;
      `);
  
      // insert answers data
      await client.query(`
        COPY answers (id, question_id, answer_body, answer_date, answerer_name, answerer_email, reported, answer_helpfulness)
        FROM '${path.join(__dirname, '../../../sdc-data/answers.csv')}' 
        DELIMITER ',' 
        CSV HEADER;
      `);
  
      // insert answers_photos data
      await client.query(`
        COPY answers_photos (id, answer_id, url)
        FROM '${path.join(__dirname, '../../../sdc-data/answers_photos.csv')}' 
        DELIMITER ',' 
        CSV HEADER;
      `);
  
      // convert Unix time to date format
      await client.query(`
      UPDATE questions
      SET question_date = to_timestamp(CAST(question_date AS BIGINT)/1000.0)   
      `);
  
      await client.query(`
      UPDATE answers
      SET answer_date = to_timestamp(CAST(answer_date AS BIGINT)/1000.0)
      `);
  
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }
  
  async function createQnAEtl() {
    await createTables();
    await insertData();
    await client.query(`SELECT setval('questions_question_id_seq', (SELECT MAX(question_id) FROM questions));`);
    await client.query(`SELECT setval('answers_id_seq', (SELECT MAX(id) FROM answers));`);
    await client.query(`SELECT setval('answers_photos_id_seq', (SELECT MAX(id) FROM answers_photos));`);
  }
  
  var start = new Date()

  client.connect()
    .then(() => {
      createQnAEtl()
        .then(() => {
          console.log('Q&A ETL process completed successfully.');
          client.end();
          var end = new Date()
          console.log('TIME TAKEN: ', end-start,'ms')
        })
        .catch((error) => {
          console.error('Q&A ETL process failed:', error);
          client.end();
        });
    })
    .catch((error) => {
      console.error('Error connecting to PostgreSQL:', error);
      client.end();
    });

module.exports = createQnAEtl