const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('App is online!'));
app.get('/getAllMovies', getAllMovies);
app.delete('/deleteMovie/:id', deleteMovie);
app.put('/updateMovie', updateMovie);

app.listen(3000, connectToDB);

function connectToDB(req, res) {
    var config = {
        userName: 'fake_user', // this would probs be an env variable
        password: 'p@sswordpassword1', // this would probs be an env variable
        server: 'movie-list.database.windows.net',
        options: {
            encrypt: true,
            database: 'movie_list'
        }
    };

    var connection = new Connection(config);

    connection.on('connect', function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("i'm in the else");
            app.locals.connection = connection;
        }
    });
}

function getAllMovies(req, res) {
    var arr = [];

    var sqlStr = "select * from movies \n"
    + "inner join \n" 
    + "movie_details on movies.movie_id = movie_details.movie_id \n"
    + "inner join \n"
    + "ratings on movie_details.rating_id = ratings.rating_id \n";

    var request = new Request(sqlStr, function(err, rowCount) {
        if (err) {
            console.log(err);
        } else {
            console.log(rowCount + ' rows');
        }
    });

    request.on('row', function(columns) {
        var tmpObj = {};
        columns.forEach(function(column) {
            if (column.value === null) {
                console.log('NULL');
            } else {
                tmpObj[column.metadata.colName] = column.value;
            }
        });
        arr.push(tmpObj);
    });

    request.on('error', function(err) {
        res.send(err);
        return;
    });

    req.app.locals.connection.execSql(request);

    request.on('requestCompleted', function() {
        console.log('doneeeeee');
        res.send(arr);
    });
}

function deleteMovie(req, res) {

    if(req.params.id == null) {
        res.send("Must send movie id!");
        return;
    }
    
    var movieID = req.params.id;
    var sqlStr = "delete from movies where movie_id=" + movieID + "\n"
    + "delete from movie_details where movie_id=" + movieID;

    var request = new Request(sqlStr, function(err, rowCount) {
        if (err) {
            console.log(err);
            res.send(err);
            return;
        } else {
            console.log(rowCount + ' rows');
        }
    });

    req.app.locals.connection.execSql(request);

    request.on('error', function(err) {
        res.send(err);
        return;
    });

    request.on('requestCompleted', function() {
        console.log('doneeeeee');
        console.log(res.app.response);
        res.sendStatus(200);
    });
}

function updateMovie(req, res) {
    var movie = req.body;

    if(movie.movie_id == null) {
        res.send("Must send movie id!");
        return;
    }

    for(var prop in movie) {
        console.log('req.params.movie[prop].value ', movie[prop]);
    }
}