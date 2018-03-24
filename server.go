package main

import (
	"net/http"
	"fmt"
	"log"
	"database/sql"
	
	"github.com/labstack/echo"
	_ "github.com/denisenkom/go-mssqldb"
)

func main() {
	e := echo.New()

	e.GET("/", openConnection)

	e.Logger.Fatal(e.Start(":1323"))
}

func openConnection(c echo.Context) error {
	condb, errdb := sql.Open("mssql", "Server=movie-list.database.windows.net;Initial Catalog=movie_list;Persist Security Info=False;User ID=carmalou;Password=Triple@kids3;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;")

	if errdb != nil {
		fmt.Println("you done fucked up.");
	}

	var (
		sqlversion string
	  )
	  rows, err := condb.Query("select @@version")
	  if err != nil {
		log.Fatal(err)
	  }
	  for rows.Next() {
		err := rows.Scan(&sqlversion)
		if err != nil {
		  log.Fatal(err)
		}
		log.Println(sqlversion)
	  }
	//   defer condb.Close()

	  return c.String(http.StatusOK, "Hello World")
}

// func getAll(c echo.Context) error {
//
// }