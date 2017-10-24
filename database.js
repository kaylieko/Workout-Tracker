var express = require('express');
var request = require('request');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 4486);

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'mysql.eecs.oregonstate.edu',
  user            : 'cs290_kohy',
  password        : '0971',
  database        : 'cs290_kohy'
});

app.get('/', function(req,res){
    res.render('home');
});

/* Write a server-side app.get() route to handle incoming GET requests */
app.get('/getReq',function(req,res,next){
	console.log("Step2/ I got a GET request");
	
	/* make a simple query to the database (SELECT * from [table];) */
    	pool.query('SELECT id,name,reps,weight,DATE_FORMAT(date, "%Y-%m-%d") AS date ,lbs FROM workouts', function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        res.type('text/plain');
        res.send(rows); //Send the database data back with res.send() 
    });
});

app.get('/reset-table',function(req,res,next){
  	var context = {};
  	pool.query("DROP TABLE IF EXISTS workouts", function(err){ 
    		var createString = "CREATE TABLE workouts("+
   		"id INT PRIMARY KEY AUTO_INCREMENT,"+
    		"name VARCHAR(255) NOT NULL,"+
    		"reps INT,"+
    		"weight INT,"+
    		"date DATE,"+
    		"lbs BOOLEAN)";
    		pool.query(createString, function(err){
      			context.results = "Table reset";
      			res.render('home',context);
    		})
  	});
});



app.get('/edit', function(req,res,next) {
    	pool.query('SELECT id,name,reps,weight,DATE_FORMAT(date, "%Y-%m-%d") AS date,lbs FROM workouts WHERE id=(?)', 
        [req.query.id], function(err, rows, fields){
            	if(err) {
                	next(err);
                	return;
            	}
        	context = rows[0]; 
        	res.render('edit', context);
        });
});

app.get('/update', function(req,res,next) {
    	var context = {};
    	pool.query('UPDATE workouts SET date=?, name=?, reps=?, weight=?, lbs=? WHERE id=?', 
        [req.query.date, req.query.name, req.query.reps, req.query.weight, req.query.units, req.query.id], 
        function(err, result){
            	if(err) {
               		next(err);
                	return;
            	}
        	res.render('home');
        });
});



app.post('/insert', function(req,res,next){
	pool.query("INSERT INTO workouts (date, name, reps, weight, lbs) VALUES (?,?,?,?,?)", 
        [req.body.date, req.body.name, req.body.reps, req.body.weight, req.body.units], 
        function(err, result) {
        	if(err) {
            		next(err);
            		return;
        	}
        pool.query('SELECT id,name,reps,weight,DATE_FORMAT(date, "%Y-%m-%d") AS date,lbs FROM workouts', function(err, rows, fields){
            	if(err){
                	next(err);
                	return;
            	}
            	res.type('text/plain');
            	res.send(rows);
        });
    });
});

app.post('/delete', function(req,res) {
    	pool.query('DELETE FROM workouts WHERE id = (?)', [req.body.id], function(err, result){
        if(err) {
            	next(err);
            	return;
        }
        pool.query('SELECT id,name,reps,weight,DATE_FORMAT(date, "%Y-%m-%d") AS date,lbs FROM workouts', function(err, rows, fields){
            	if(err){
               		next(err);
                	return;
            	}
            	res.type('text/plain');
            	res.send(rows);
        });
    });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
