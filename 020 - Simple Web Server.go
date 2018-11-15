package main
import (
  "bufio"
  "io"
  "log"
  "net/http"
  "os"
  "time"
)

func main() {
  helloHandler := func(w http.ResponseWriter, req *http.Request) {
    file, err := os.Open("./901-Geo.txt")
    if err != nil {
      log.Fatal(err)
    }
    defer file.Close()

    scanner := bufio.NewScanner(file)
    for scanner.Scan() {             // internally, it advances token based on sperator
      io.WriteString(w, scanner.Text() + "\r\n")  // token in unicode-char
      time.Sleep(10 * time.Millisecond)
    }
  }

  http.HandleFunc("/901-Geo.txt", helloHandler)
  http.Handle("/", http.FileServer(http.Dir("./")))
  if err := http.ListenAndServe(":8080", nil); err != nil {
    panic(err)
  }
}

