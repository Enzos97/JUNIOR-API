import bodyParser from 'body-parser';
import express from 'express';
import { CLIENT_URL, PORT } from './config.js';
import routes from './routes/index.routes.js'
import morgan from 'morgan';
const app = express()

app.set('port',PORT)

// Middlewares
app.use(bodyParser.json())
app.use(morgan('dev'))


// Enable CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", `https://appjunior.vercel.app`); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS, PUT, DELETE');
  next();
});

app.use("/", routes);

// app.use((req, res) => {
//   res.render("404");
// });

export default app;