const express = require('express');
const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const ejs = require('ejs')
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const fs = require('fs');
const cors = require('cors');

const HttpError = require('./helpers/http-error');
const userRoutes = require('./routes/user-routes');
const storeRouter = require('./routes/store-routes');
const categoryRouter = require('./routes/category-routes');
const itemRouter = require('./routes/item-routes');
const couponRouter = require('./routes/coupon-routes');
const transactionRouter = require('./routes/transaction-routes');
const sessionRouter = require('./routes/session-routes');
const barCodeRouter = require('./routes/barCode-routes');
const dealRouter = require('./routes/deal-routes');
const app = express();
const { CronJob } = require('cron');
const User= require('./models/user'); 
app.use(express.json());
app.use(cookieParser());
function checkForHTMLTags(req, res, next) {
  const { body } = req;
  const keys = Object.keys(body);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = body[key];

    if (typeof value === 'string' && sanitizeHtml(value) !== value) {
      return res
        .status(400)
        .json({ error: 'HTML tags are not allowed in the request body' });
    }
  }
  next();
}

app.use(checkForHTMLTags);
app.use(helmet());
app.use(mongoSanitize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'To many request from this IP now please wait for an hour!',
});

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   );
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
//   next();
// });
app.use(cors(
  {
    origin: 'http://localhost:3000',
    credentials: true
  }
));
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use('/uploads/category', express.static(path.join('uploads', 'category')));
app.use('/uploads/barcode', express.static(path.join('uploads', 'barcode')));
app.use('/uploads/store', express.static(path.join('uploads', 'store')));
app.use('/api', limiter);
app.use('/api/user', userRoutes);
app.use('/api/category', categoryRouter);
app.use('/api/store', storeRouter);
app.use('/api/item', itemRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/transaction', transactionRouter);
app.use('/api/session', sessionRouter);
app.use('/api/barCode', barCodeRouter);
app.use('/api/deal', dealRouter);

app.use((req, res, next) => {
  throw new HttpError('Could not find the route', 404);
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => console.log(err));
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occured' });
});
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connected to db on port ${process.env.PORT}`);
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });
  const job = new CronJob(
    '0 0 0 * * *',
    async function () {
      const currentTime = new Date();
      const usersToLock = await User.find({ unlockedTime: { $lt: currentTime } }); 
      console.log(usersToLock)
      for (const user of usersToLock) {
        user.isLocked = false;
        await user.save();
        console.log(`User ${user.name} is now unlocked.`);
      }
    },
    true,
  );
  job.start();





