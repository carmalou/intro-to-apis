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
        res.sendStatus(200);
    });
}

function updateMovie(req, res) {
    var movie = req.body;
    var movieArr = ['movie_id', 'movie_title'];
    var movieDetailsArr = ['description', 'year_released', 'pic_link', 'year_released', 'rating'];
    var tmpMovie = {};
    var tmpMovieDetails = {};
    var sqlStr1 = "update movies \n set ";
    var sqlStr2 = "update movie_details \n set ";

    if(movie.movie_id == null) {
        res.send("Must send movie id!");
        return;
    }

    for(var prop in movie) {
        if(movieArr.indexOf(prop) >= 0) {
            tmpMovie[prop] = movie[prop];
        } else if(movieDetailsArr.indexOf(prop) >= 0) {
            tmpMovieDetails[prop] = movie[prop];
        }
    }

    var tmp1 = Object.keys(tmpMovie);

    tmp1.forEach(function (m, i) {
        sqlStr1 += m + " = " + tmpMovie[m];
        if((tmp1.length - 1) != i) {
            sqlStr1 += ", ";
        } else {
            sqlStr1 += "\n";
        }
    });

    sqlStr1 += "where movie_id = " + movie.movie_id;

    var tmp2 = Object.keys(tmpMovieDetails);

    tmp2.forEach(function (m, i) {
        sqlStr2 += m + " = " + tmpMovieDetails[m];
        if((tmp2.length - 1) != i) {
            sqlStr2 += ", ";
        } else {
            sqlStr2 += "\n";
        }
    });

    sqlStr2 += "where movie_id = " + movie.movie_id;
}