var express = require('express')

var app = express()
app.use(express.static(__dirname+"/public"))



app.get("/",(req,res)=>{
    res.send("server is running")
})

app.get("/",(req,res)=>{
    res.send("server is running")
})

app.listen(8090,()=>{
    console.log('server is running on 8090')
})