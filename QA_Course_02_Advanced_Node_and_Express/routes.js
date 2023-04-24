const passport = require('passport');
const bcrypt = require('bcrypt')

module.exports = function (app, myDataBase) {
  
  // #2 - Use a Template Engine's Powers
  app.route('/').get((req, res) => {
    res.render('index', { title: 'Connected to Database', message: 'Please login', showLogin: true, showRegistration: true, showSocialAuth: true});
  });

  // #14 - Implementation of Social Authentication
  app.route('/auth/github').get(passport.authenticate('github'));

  app.route('/auth/github/callback').get(passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    req.session.user_id = req.user.id;
    res.redirect("/chat"); 
  });

  // #7 - How to Use Passport Strategies
  app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
    console.log(`User ${req.user.username} attempted to log in.`)
  });

  // #9 - How to Put a Profile Together
  app.route('/profile').get(ensureAuthenticated, (req,res) => {
    res.render('profile', { username: req.user.username });
  });

  // #11 - Registration of New Users
  app.route('/register')
  .post((req, res, next) => {
    // #12 - Hashing Your Passwords
    const hash = bcrypt.hashSync(req.body.password, 12);
    myDataBase.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect('/');
      } else {      
        myDataBase.insertOne({
          username: req.body.username,
          password: hash
        },
          (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              // The inserted document is held within
              // the ops property of the doc
              next(null, doc.ops[0]);
            }
          }
        )
      }
    })
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );

  // #10 - Logging a User Out
  app.route('/logout')
  .get((req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.use((req, res, next) => {
  res.status(404)
    .type('text')
    .send('Not Found');
  });
}

// #8 - Create New Middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};