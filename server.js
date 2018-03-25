const express = require('express');
const app = express();
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;

app.get('/', (req, res) => res.send('App is online!'));
app.get('/getAllMovies', getAllMovies);

app.listen(3000, () => console.log('Example app listening on port 3000!'));

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

connectToDB()

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

    req.app.locals.connection.execSql(request);

    request.on('requestCompleted', function() {
        console.log('doneeeeee');
        res.send(arr);
    });
}