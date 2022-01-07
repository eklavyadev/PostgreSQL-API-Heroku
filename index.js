// Importing Packages
const express = require('express');
const LimitingMiddleware = require('limiting-middleware');
const cors = require('cors'); 
const client = require("./database")
const app = express();

// App function
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    type: 'error', message: err.message
  });
});

// Connecting to Database
client.connect();

// Fetching All Posts
app.get('/', async(req, res, next) => {
  var sql = "select * from Post"
  var params = []
  client.query(sql, params, async(err, rows) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message":"success",
          "data":rows.rows
      })
    });
});

// Fetching post by slug
app.get("/api/post/:id", (req, res, next) => {
    var sql = "select * from Post where slug = $1"
    var params = [req.params.id]
    client.query(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row.rows
        })
    });
});

// Adding Post
app.post("/api/post/", (req, res, next) => {
    var errors=[]
    // Validations
    if (!req.body.title){
        errors.push("No title specified");
    }
    if (!req.body.slug){
        errors.push("No slug specified");
    }
    if (!req.body.content){
        errors.push("No content specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        title: req.body.title,
        slug: req.body.slug,
        content : req.body.content,
        date: Date.now();
    }
    var sql ='INSERT INTO Post (title, slug, content, date) VALUES ($1,$2,$3,$4)'
	  var params =[data.title, data.slug, data.content, data.date]
	  client.query(sql, params, function (err, result) {
	        if (err){
	            res.status(400).json({"error": err.message})
	            return;
	        }
	        res.json({
	            "message": "success",
	            "data": data
	        })
	    });
    }
})

// Delete Post
app.delete("/api/post/:sno", (req, res) => {
	   client.query(
        'DELETE FROM Post WHERE sno = $1',
        [req.params.sno],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"Deleted", changes: result.rowCount})
    });
    }
})

// Edit Post
app.patch("/api/post/:id", (req, res, next) => {
    var errors=[]
    if (!req.body.title){
        errors.push("No title specified");
    }
    if (!req.body.slug){
        errors.push("No slug specified");
    }
    if (!req.body.content){
        errors.push("No content specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
      title: req.body.title,
      slug: req.body.slug,
      content : req.body.content
    }
    client.query(
      `UPDATE Post set 
         title = COALESCE($1,title), 
         slug = COALESCE($2,slug), 
         content = COALESCE($3,content) 
         WHERE sno = $4`,
      [data.title, data.slug, data.content, req.params.id],
      function (err, result) {
          if (err){
              res.status(400).json({"error": err})
              return;
          }
          res.json({
              message: "Success!",
              data: data,
              changes: this.changes
          })
    });
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
