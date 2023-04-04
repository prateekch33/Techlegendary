import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("API is running Correctly");
});

app.get(`/getFollowerCount`, async (req, res) => {
  // var insta = req.query.insta;
  var twitch = req.query.twitch;
  // var twitter = req.query.twitter;
  var youtube = req.body.youtube;
  let finalData = {};
  var instaFollower, twitchFollower, twitterFollower, youtubeFollower;

  // fetch(``, {
  //   method: "GET",
  // })
  //   .then((res) => res.json())
  //   .then((data) => {
  //     instaFollower = data.followers;
  //   })
  //   .catch((err) => {
  //     return res.status(400).json({ status: -1, error: err.message });
  //   });
  let access_token = "";
  // const params = new URLSearchParams();
  // params.append();
  await fetch(`https://id.twitch.tv/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  })
    .then((res) => res.json())
    .then(async (data) => {
      access_token = data.access_token;
      console.log(access_token);
      await fetch(`https://api.twitch.tv/helix/users?login=${twitch}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Client-Id": process.env.CLIENT_ID,
        },
      })
        .then((res) => res.json())
        .then(async (data) => {
          console.log(data.data[0].id);
          await fetch(
            `https://api.twitch.tv/helix/users/follows?to_id=${data.data[0].id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${access_token}`,
                "Client-Id": process.env.CLIENT_ID,
              },
            }
          )
            .then((res) => res.json())
            .then((data) => {
              twitchFollower = data.total;
            })
            .catch((err) => {
              return res.status(401).json({ status: -1, error: err.message });
            });
        })
        .catch((err) => {
          return res.status(401).json({ status: -1, error: err.message });
        });
    })
    .catch((err) => {
      return res.status(400).json({ status: -1, error: err.message });
    });

  // fetch(``, {
  //   method: "GET",
  // })
  //   .then((res) => res.json())
  //   .then((data) => {
  //     twitterFollower = data.followers;
  //   })
  //   .catch((err) => {
  //     return res.status(400).json({ status: -1, error: err.message });
  //   });

  // fetch(``, {
  //   method: "GET",
  // })
  //   .then((res) => res.json())
  //   .then((data) => {
  //     youtubeFollower = data.followers;
  //   })
  //   .catch((err) => {
  //     return res.status(400).json({ status: -1, error: err.message });
  //   });

  finalData = {
    twitch: twitchFollower,
  };

  res.status(200).json({ finalData });
});

app.listen(process.env.PORT, () => {
  console.log(`Server Started at PORT: ${process.env.PORT}`);
});
