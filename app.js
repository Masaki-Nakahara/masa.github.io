const express = require('express');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Nakahara0730',
  database: 'list_app'
});



connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

app.use(express.static('public'));


app.get('/', (req, res) => {
  connection.query(
    'SELECT * FROM users',
    (error, results) => {
      res.render('top.ejs');
    }
  );
});


app.get('/top', (req, res)=>{
  res.redirect('top.ejs');
});

app.get('/index', (req, res) => {
  connection.query(
    'SELECT * FROM users',
    (error, results) => {
      res.render('index.ejs', {users: results});
    }
  );
});

app.post('/decide', (req, res) => {
  connection.query(
    (error, results) => {
      res.redirect('/main');
    }
  );
});

app.get('/new', (req, res)=>{
  res.render('new.ejs');
});

app.get('/main', (req, res)=>{
  connection.query(
    'SELECT * FROM users',
    (error, results) => {
      res.render('main.ejs', {users: results});
    }
  );
 
});


app.post('/create', (req, res) => {
  // データベースに追加する処理を書いてください
  if( req.body.itemName){
    connection.query(
      "insert into users(name,pay,must,shortage,extra) values(?,?,?,?,?)",
      [req.body.itemName,0,0,0,0],
      (error, results)=>{
        res.redirect('/index');
      }
      
      
    );
  }else{
    console.log("Input Name");
  }
  
  
  

});
      
app.post('/delete/:id', (req, res) =>{
  connection.query(
    'DELETE FROM users WHERE id = ?',
    [ req.params.id],
    (error, results) =>{
      res.redirect('/index');
 
    }
  );

  
});

app.get('/edit/:id', (req, res) =>{
  connection.query(
    'SELECT * FROM users WHERE id = ?',
    [req.params.id],
    (error, results) => {
      res.render('edit.ejs', {item: results[0]});
    }
  );
});

app.post('/update/:id', (req, res) => {
  connection.query(
    'UPDATE users SET name = ? WHERE id = ?',
    [req.body.itemName, req.params.id],
    (error, results) => {
      res.redirect('/index');
    }
  );
});



app.post('/calculate', (req, res)=>{
  const must = req.body.pay / req.body.paid_ids.length;
  const paid_ids = req.body.paid_ids;


  
  connection.query(
    'UPDATE users SET  pay = pay + ? WHERE id = ?',
    [req.body.pay, req.body.pay_id],
    (error, results) => {
    }
  );
    

  paid_ids.forEach((paid_id)=>{
    connection.query(
      'UPDATE users SET  must = must + ? WHERE id = ?',
      [must, paid_id],
      (error, results) => {
      }
    );
  });

  connection.query(
    'UPDATE users SET  extra = pay - must, shortage = 0  WHERE pay >= must',
    (error, results) => {
    }
  );

  connection.query(
    'UPDATE users SET  shortage = must - pay, extra = 0 WHERE pay < must',
    (error, results) => {
    }
  );



  connection.query(
    'select * from users',
    (error, results) => {
      console.log(results);
    }
  );

  res.redirect('/main');
  
  





});

app.post('/reset',(req,res)=>{

  connection.query(
    'update users set must = 0, pay = 0, shortage = 0, extra = 0',
    (error, results) => {
    }
  );

  connection.query(
     'select * from users',
     (error, results) => {
       console.log(results);
       res.redirect('/main');
     }
   );
});

app.get('/end', (req,res)=>{
  var personGets = {};
  var personPays = {};

  connection.query(
   'select name, extra from users where pay > must',
   (error, results) => {
    personGets = results;
  }
  );

  connection.query(
    'select name, shortage from users where pay < must',
    (error, results) => {
     personPays = results;
     res.render('end.ejs', {personGets: personGets, personPays: personPays})

    }
   );



});

// app.get('/end',(req,res)=>{
//   var personGets = {};
//   var personPays = {};
  
  // connection.query(
  //   'select name, extra from items where pay >= must',
  //   (error, results) => {
  //     personGets = results;
  //     console.log('払い過ぎな人:');
  //     console.log(personGets);
      
  //   }
  // );

  // connection.query(
  //   'select name, shortage from items where pay < must',
  //   (error, results) => {
  //     personPays = results;
  //     console.log('払い足りていない人:');
  //     console.log(personPays);
  //     res.render('end.ejs', {item: results[0]})
    
      
  //     // personGets.forEach((personGet)=> {
  //     //   personPays.forEach((personPay)=>{
  //     //     if(personGet.extra > personPay.shortage){
  //     //       personGet.extra -= personPay.shortage;
  //     //       console.log(personPay.name + 'が' + personGet.name + 'へ' + personPay.shortage + '円払う');
  //     //       personPay.shortage = 0;
       
  //     //     }else if(personGet.extra < personPay.shortage){
  //     //       personPay.shortage -= personGet.extra;
  //     //       console.log(personPay.name + 'が' + personGet.name + 'へ' + personGet.extra + '円払う');
  //     //       personGet.extra = 0;

  //     //     }else{
  //     //       console.log(personPay.name + 'が' + personGet.name + 'へ' + personGet.extra + '円払う');
  //     //       personPay.shortage = 0;
  //     //       personGet.extra = 0;
  
  //     //     }
  //     //   });
  //     // });
      
  //   }
  // );

  

  



//   res.redirect('/main');

// });



app.listen(3000);

