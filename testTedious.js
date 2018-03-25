function connectToDB() {
    var Connection = require('tedious').Connection;
    var Request = require('tedious').Request;

    var config = {
        userName: 'fake_user', // update me
        password: 'p@sswordpassword1', // update me
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
            executeStatement();
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

connectToDB();