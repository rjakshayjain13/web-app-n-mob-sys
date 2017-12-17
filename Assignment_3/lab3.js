/*===========================
    SER 421 --- Lab 3
    Author - Akshay Jain
===========================*/

// JSON string BooksJSON
var BooksJSON = `{  
                                "books":[  
                                  {  
                                      "id":"book1",
                                      "name":"The Image-Guided Surgical Toolkit",
                                      "price":"0.99",
                                      "url":"http://www.igstk.org/IGSTK/help/documentation.html"
                                  },
                                  {  
                                      "id":"book2",
                                      "name":"Abraham Lincoln",
                                      "price":"19.95",
                                      "url":"http://www.learnlibrary.com/abraham-lincoln/lincoln.htm"
                                  },
                                  {  
                                      "id":"book3",
                                      "name":"Adventures of Tom Sawyer",
                                      "price":"10.50",
                                      "url":"http://www.pagebypagebooks.com/Mark_Twain/Tom_Sawyer/"
                                  },
                                  {  
                                      "id":"book4",
                                      "name":"Catcher in the Rye",
                                      "price":"22.95",
                                      "url":"https://www.goodreads.com/book/show/5107.The_Catcher_in_the_Rye"
                                  },
                                  {  
                                      "id":"book5",
                                      "name":"The Legend of Sleepy Hollow",
                                      "price":"15.99",
                                      "url":"http://www.learnlibrary.com/sleepy-hollow/sleepy-hollow.htm"
                                  },
                                  {  
                                      "id":"book6",
                                      "name":"Moby Dick",
                                      "price":"24.45",
                                      "url":"https://www.amazon.com/Moby-Dick-Herman-Melville/dp/1503280780"
                                  },
                                  {  
                                      "id":"book7",
                                      "name":"Java Programming 101",
                                      "price":"12.95",
                                      "url":"https://www.javaworld.com/blog/java-101/"
                                  },
                                  {  
                                      "id":"book8",
                                      "name":"Robinson Crusoe",
                                      "price":"11.99",
                                      "url":"http://www.learnlibrary.com/rob-crusoe/"
                                  },
                                  {  
                                      "id":"book9",
                                      "name":"The Odyssey",
                                      "price":"32.00",
                                      "url":"http://classics.mit.edu/Homer/odyssey.html"
                                  }
                                ]
                            }`;

// Parsed object obtained from JSON string
var bjson = JSON.parse(BooksJSON);

// Importing modules express, pug, body-parser, & express-session
var express = require('express');
var pug = require('pug');
var bodyParser = require('body-parser');
var session = require('express-session');

// Building the app
var app = express();

// Specifying the port number :8080: for the app to listen on
app.listen(8080, function(){
    console.log("http://localhost:8080/landing");
});

// Specifying our template engine as Pug
app.set('view engine', 'pug');

// Setting up session's secret, and body parser
app.use(session({ secret: 'secret_hai_na_bhai', resave: true, saveUninitialized: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Landing page for the bookstore application
app.get('/landing', function (req, res) {
    req.session.username = "";
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.render('landing', { blist: bjson.books });
});

// Login page for the bookstore application
app.get('//login.html', function (req, res) {
    res.render('login_html');
});

/*========================================
    Welcome page if user enters correct credentials, else 
    redirected to login page with proper error message.
========================================*/
app.post('//login', function (req, res) {

    var f = false, e = false;

    var username = req.body.uname;
    var password = req.body.pwd;

    // If username or password field is blank, redirect back to login page
    if(username == "" || password == ""){
        e = true;
        res.render('login_html', { empty: e });
    } 
    // If valid username and password, login successful
    else if (username === password) {
        req.session.username = username;
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render('login', { name: req.session.username });
    }
    // If invalid credentials, redirect back to login page
    else {
        f = true;
        res.render('login_html', { flag: f });
    }
});

/*========================================
    List page if user enters with authorization, 
    else redirected to landing page.
========================================*/
app.get('/list', function (req, res) {
    if(req.session.username == undefined || req.session.username == ""){
        res.redirect('/landing');
    }
    else{
        res.render('list', { name: req.session.username, blist: bjson.books });
    }
});

/*========================================
    Purchase page if user makes selection of book(s),
    and enters correct quantity of book(s), 
    else redirected to list page, indicating missing/invalid values.
========================================*/
app.post('/purchase', function(req, res){
    
    var qty = req.body.Quantity;
    var bks = req.body.Books;
    var b = [], bb, cc = 0, ttprice = 0;
    var f = false, q = false, u = false;

    // Check to validate the quantity of books
    if(qty == undefined || qty < 1 || qty % 1 != 0){
        q = true;
        res.render('list', { name: req.session.username, blist: bjson.books, invalidQty: q });
    }
    // Check to make sure one or more books are selected
    if(bks == undefined){
        u = true;
        res.render('list', { name: req.session.username, blist: bjson.books, noSelection: u });
    }

    // When a single book is selected for the purchase
    if(bks[0].length<=1){
        for(var i=0; i<bjson.books.length; i++){
            if(bks == bjson.books[i].id){
                b = bjson.books[i];
                cc = qty * bjson.books[i].price;
                cc = cc.toFixed(2);
            }
        }
    }
    // When multiple books are selected for the purchase
    else{
        f = true;
        for(var i=0; i<bks.length; i++){
            for(var j=0; j<bjson.books.length; j++){
                if(bks[i] == bjson.books[j].id){
                    var tid = bjson.books[j].id;
                    var tname = bjson.books[j].name;
                    var tprice = bjson.books[j].price;
                    ttprice =  parseFloat(tprice*qty).toFixed(2);   // rounding off the values to two decimal places
                    bb = new msel(tid, tname, tprice, ttprice);
                }
            } 
            cc += parseFloat(ttprice);
            b = b.concat(bb);   // adding cost of all the books to get total cost
        }
        cc = cc.toFixed(2); // rounding off the values to two decimal places
    }
    req.session.totalcost = cc;

    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('purchase', { name: req.session.username, qnty: qty, book: bks, blist: b, flag: f, totalCost: req.session.totalcost });
});

// To create new object to pass in when multiple books are selected
function msel(bid, bname, bprice, btprice){
    this.id = bid;
    this.name = bname;
    this.price = bprice;
    this.tprice = btprice;
}

/*===============================================
    Confirm page after user has entered the purchase credentials,
    like creditcard name, creditcard number, & express delivery option.
===============================================*/
app.post('/confirm', function(req, res){
    
    var ccard = req.body.Creditcard;
    var cardno = req.body.Cardnumber;
    var ed = req.body.expressdelivery;

    //Determining if Express delivery is selected or not
    if(ed== undefined){
        ed = "No";
    }
    else if(ed == "on"){
        ed = "Yes";
    }

    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('confirm', { name: req.session.username, card: ccard, cardNo: cardno, ed: ed, amount: req.session.totalcost });

});

// Redirecting user to the landing page if attempts to GET //login page
app.get('//login', function (req, res) {
    res.redirect('/landing');
});

// Redirecting user to the landing page if attempts to GET /login page
app.get('/login', function (req, res) {
    res.redirect('/landing');
});

// Redirecting user to the landing page if attempts to GET /purchase page
app.get('/purchase', function (req, res) {
    res.redirect('/landing');
});

// Redirecting user to the landing page if attempts to GET /confirm page
app.get('/confirm', function (req, res) {
    res.redirect('/landing');
});

// Error handling for 400 and 500 level errors
app.use(function (req, res, next) {
    if(req.method != "GET" && req.method != "POST"){    // 405: sending wrong HTTP method to a URL
        res.status(405).send('The method you are using to access the file is not allowed. <a href="/landing">Go back to landing page</a>');
    }
    else if(res.status(404)){   // 404: Not Found, error caught
        res.send('The page you requested is not available. <a href="/landing">Go back to landing page</a>');
    }
    else if(res.status(403)){
        res.send('Forbidden to see the document you requested. <a href="/landing">Go back to landing page</a>');
    }
    else if(res.status(401)){
        res.send('Unauthorized. <a href="/landing">Go back to landing page</a>');
    }
    else if(res.status(400)){
        res.send('Bad Request. <a href="/landing">Go back to landing page</a>');
    }
    else if(res.status(500)){
        res.send('Internal Server Error. <a href="/landing">Go back to landing page</a>');
    }
  });
