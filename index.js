const express = require("express");
const cors = require("cors");
const path = require("path");
const ejs = require("ejs");
const SGmail = require("@sendgrid/mail");

const port = process.env.PORT || 4000;

const app = express();

//to enable cors
app.use(cors());

//set ecpress view engine
app.set("view engine", "ejs");

let SendGrid_Key = "YOUR_SG_API_KEY_HERE";

SGmail.setApiKey(SendGrid_Key);

//routes which handles the requests
app.get("/hello", (req, res, next) => {
  let emailTemplate;
  let capitalizedFirstName = "John";
  let userEmail = "John@example.com";
  ejs
    .renderFile(path.join(__dirname, "views/welcome-mail.ejs"), {
      user_firstname: capitalizedFirstName,
      confirm_link: "http://www.8link.in/confirm=" + userEmail
    })
    .then(result => {
      emailTemplate = result;

      const message = {
        to: userEmail,
        from: { email: "welcome@8link.in", name: "8link" },
        subject: "Welcome link",
        html: emailTemplate
      };

      return SGmail.send(message)
        .then(sent => {
          // Awesome Logic to check if mail was sent
          res.status(200).json({
            message: "Welcome mail was sent"
          });
        })
        .catch(err => {
          console.log("Error sending mail", err);
          res.status(400).json({
            message: "Welcome mail was not sent",
            error: err
          });
        });

      //res.send(emailTemplate);
    })
    .catch(err => {
      res.status(400).json({
        message: "Error Rendering emailTemplate",
        error: err
      });
    });
});

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}..`);
});
