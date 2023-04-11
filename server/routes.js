const router = require('express').Router();
const client = require('./database.js')

router.get('/loaderio-03691a8a9e4b96aea7c1084802a6e014', (req,res) => {
    res.sendFile('/home/ec2-user/loaderio-03691a8a9e4b96aea7c1084802a6e014.txt')
})

router.get('/qa/questions', (req, res) => {
    let productId = req.query.productId;
    let page = req.query.page || 0;
    let count = req.query.count || 5;
  
    client.query(`
      SELECT q.question_id, q.question_body, q.question_date, q.asker_name, q.question_helpfulness, 
        CASE q.reported WHEN 1 THEN TRUE ELSE FALSE END AS reported,
        json_agg(
          json_build_object(
            'id', a.id, 
            'body', a.answer_body, 
            'date', a.answer_date, 
            'answerer_name', a.answerer_name, 
            'helpfulness', a.answer_helpfulness,
            'photos', (
              SELECT 
                CASE 
                  WHEN COUNT(ap.id) = 0 THEN json_build_array() 
                  ELSE json_agg(json_build_object('id', ap.id, 'url', ap.url)) 
                END
              FROM answers_photos ap 
              WHERE ap.answer_id = a.id
            )
          )
          ORDER BY a.answer_date DESC
        ) AS answers
      FROM questions q 
      LEFT JOIN answers a ON q.question_id = a.question_id AND a.reported = 0 
      WHERE q.product_id = $1 
      GROUP BY q.question_id, q.question_body, q.question_date, q.asker_name, q.question_helpfulness, q.reported 
      ORDER BY q.question_date DESC 
      LIMIT $2 
      OFFSET $3;
      `,
      [productId, count, page], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error executing query');
          } else {
            const finalData = {
              product_id: productId,
              results: result.rows.map(row => ({
                question_id: row.question_id,
                question_body: row.question_body,
                question_date: row.question_date,
                asker_name: row.asker_name,
                question_helpfulness: row.question_helpfulness,
                reported: row.reported,
                answers: ((row.answers ?? []).length > 0
                ? row.answers.reduce((obj, answer) => {
                    if (answer.id === null) return obj;
                    obj[answer.id] = {
                      id: answer.id,
                      body: answer.body,
                      date: answer.date,
                      answerer_name: answer.answerer_name,
                      helpfulness: answer.helpfulness,
                      photos: answer.photos
                    };
                    return obj;
                  }, {}): {})
              }))
            };
            res.status(200).send(finalData);
          }
      }
    );
  });
  
router.get('/qa/questions/:question_id/answers', (req, res) =>{
    console.log(req.query)
    let questionId = req.params.question_id
    let page = req.query.page || 0
    let count = req.query.count || 5

    client.query(`
    SELECT answers.id AS answer_id, answers.answer_body AS body, answers.answer_date AS date, answers.answerer_name, answers.answer_helpfulness AS helpfulness,
        CASE 
            WHEN COUNT(answers_photos.id) = 0 THEN json_build_array()
            ELSE json_agg(json_build_object('id', answers_photos.id, 'url', answers_photos.url))
        END AS photos
    FROM answers
    LEFT JOIN answers_photos ON answers.id = answers_photos.answer_id
    WHERE question_id = $1
    AND reported = 0 
    GROUP BY answers.id
    ORDER BY answer_date DESC 
    LIMIT $2
    OFFSET $3;
    `, [questionId, count, page], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error executing query');
        } else {
            let finalData = {
                question: questionId,
                page,
                count,
                results: result.rows,
            }
            res.status(200).send(finalData);
        }
    })
})

router.put('/qa/answers/:answer_id/helpful', (req, res) => {
    let answerId = req.body.params.answerId
    client.query(`
        UPDATE answers SET answer_helpfulness = answer_helpfulness + 1 WHERE id = $1
    `,[answerId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error executing query');
        } else {
            res.send(result);
        }
    })
})

router.put('/qa/questions/:questions_id/helpful', (req, res) =>{
    let questionId = req.body.params.questionId
    client.query(`
        UPDATE questions SET question_helpfulness = question_helpfulness + 1 WHERE question_Id = $1
    `,[questionId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error executing query');
        } else {
            res.send(result);
        }
    })
})

router.post('/qa/questions/:question_id/answer', (req,res) => {
    let question_id = req.body.params.question_id
    let answer_body = req.body.params.body
    let answerer_name = req.body.params.name
    let answerer_email = req.body.params.email
    let photos = req.body.params.photos
    let answer_date = new Date()
    let reported = 0
    let answer_helpfulness = 0

    client.query(`
    INSERT INTO answers (question_id, answer_body, answerer_name, answerer_email, answer_date, reported, answer_helpfulness)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;
`,[question_id, answer_body, answerer_name, answerer_email, answer_date, reported, answer_helpfulness], (err, result) => {
    if (err) {
        console.error('Error inserting answer:', err);
        res.sendStatus(500);
        return;
    }

    let answer_id = result.rows[0].id

    if (photos && photos.length > 0) {
        let values = photos.map((url) => `(${answer_id}, '${url}')`).join(',');
        client.query(`
        INSERT INTO answers_photos (answer_id, url)
        VALUES ${values};
        `, (err) => {
            if (err) {
                console.error('Error inserting answer photos:', err);
                res.sendStatus(500);
                return;
            }
            
            res.sendStatus(200);
        });
    } else {
        res.sendStatus(200);
    }
});
})

router.post('/qa/questions', (req, res) => {
    let product_id = req.body.params.productId
    let question_body = req.body.params.body
    let asker_name = req.body.params.name
    let asker_email =req.body.params.email
    let question_date = new Date()
    let reported = 0
    let question_helpfulness = 0

    client.query(`
    INSERT INTO questions (product_id, question_body, asker_name, asker_email, question_date, reported, question_helpfulness)
    VALUES($1, $2, $3, $4, $5, $6, $7)
    `, [product_id, question_body, asker_name, asker_email, question_date, reported, question_helpfulness], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error executing query');
        } else {
            res.send(result);
        }
    })
})

router.put('/qa/answer/:answer_id/report', (req, res) => {
    let id = req.body.answerId

    client.query(`
        UPDATE answers SET reported = 1  WHERE id = $1
    `,[id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error executing query');
        } else {
            res.send(result);
        }
    })
})


module.exports = router;