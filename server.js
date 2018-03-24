const express = require('express');
const app = express();
var connection;

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/getAll', connectToDB);

app.listen(3000, () => console.log('Example app listening on port 3000!'));

function connectToDB() {
    var Connection = require('tedious').Connection;
    var Request = require('tedious').Request;

    var config = {
        userName: '', // this would probs be an env variable
        password: '', // this would probs be an env variable
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
            // executeStatement();
        }
    });

    function executeStatement() {
        request = new Request("select * from movies", function(err, rowCount) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' rows');
            }
            connection.close();
        });

        request.on('row', function(columns) {
            columns.forEach(function(column) {
            if (column.value === null) {
                console.log('NULL');
            } else {
                console.log(column.value);
            }
            });
        });

        connection.execSql(request);
    }
}