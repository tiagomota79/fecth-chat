let express = require('express');
let app = express();
let cookieParser = require('cookie-parser');
let multer = require('multer');
let upload = multer();
app.use(cookieParser());
let passwordsAssoc = {};
let sessions = {};
let messages = [];
app.use('/static', express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.post('/messages', upload.none(), (req, res) => {
  console.log('POST messages body', req.body);
  let user = sessions[req.cookies['sid']];
  let newMessage = {
    user: user,
    msg: req.body.message,
    color: passwordsAssoc[user].color,
    time: Date.now(),
  };
  messages.push(newMessage);
  res.sendFile(__dirname + '/public/chat.html');
});
app.get('/messages', (req, res) => {
  console.log('Sending back the messages');
  console.log(messages);
  console.log(passwordsAssoc);
  res.send(JSON.stringify(messages));
});
app.post('/signup', upload.none(), (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let color = req.body.color;
  if (passwordsAssoc.hasOwnProperty(username)) {
    return res.send(
      `<html>
      <body>
      User already exists, please try again.
      <form action="/signup" method="POST" enctype="multipart/form-data">
        <div>Enter your username</div>
        <input type="text" name="username"></input>
        <div>Enter your password</div>
        <input type="text" name="password"></input>
        <div>Which color would you like your username to be?</div>
        <input type="radio" name="color" value="red"><label style="color:red">Red</label></input>
        <input type="radio" name="color" value="pink"><label style="color:pink">Pink</label></input>
        <input type="radio" name="color" value="black">Black</input>
        <input type="submit" value="sign me up!"></input>
      </form>
      </body>
      </html>`
    );
  }
  passwordsAssoc[username] = {
    password: password,
    color: color,
  };
  res.send(`<html>
  <body>
  Signup successful!
  <form action="/login" method="POST" enctype="multipart/form-data">
    <div>Username</div>
    <input type="text" name="username"></input>
    <div>Password</div>
    <input type="text" name="password"></input>
    <input type="submit" value="log me in!"></input>   
  </form>
  </body>
  </html>`);
});
app.post('/login', upload.none(), (req, res) => {
  let username = req.body.username;
  let passwordGiven = req.body.password;
  let expectedPassword = passwordsAssoc[username].password;
  if (expectedPassword !== passwordGiven) {
    res.send(`<html>
    <body>
    Invalid username or password. Please try again.
    <form action="/login" method="POST" enctype="multipart/form-data">
    <div>Username</div>
    <input type="text" name="username"></input>
    <div>Password</div>
    <input type="text" name="password"></input>
    <input type="submit" value="log me in!"></input>   
    </form>
    </body>
    </html>`);
    return;
  }
  let sid = Math.floor(Math.random() * 10000000);
  sessions[sid] = username;
  res.cookie('sid', sid);
  res.sendFile(__dirname + '/public/chat.html');
});

app.post('/changeUsername', upload.none(), (req, res) => {
  let oldUsername = sessions[req.cookies['sid']];
  let newUsername = req.body.username;
  if (passwordsAssoc.hasOwnProperty(newUsername)) {
    return res.send(
      `<html>
      <body>
      User already exists, try again.
      <form action="/changeUsername" method="POST" enctype="multipart/form-data">
        <input type="text" name="username"></input>
        <input type="submit" value="Change"></input>
        </form>
      </body>
      </html>`
    );
  }
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].user === oldUsername) {
      messages[i].user = newUsername;
    }
  }
  passwordsAssoc[newUsername] = passwordsAssoc[oldUsername];
  delete passwordsAssoc[oldUsername];
  res.sendFile(__dirname + '/public/chat.html');
});
app.listen(4000);
