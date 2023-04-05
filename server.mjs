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
  var instagram = req.query.insta;
  var twitch = req.query.twitch;
  var youtube = req.body.youtube;
  let finalData = {};
  var instaFollower, twitchFollower, youtubeFollower;
  await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&fields=items%2Fsnippet%2FchannelId&q=${youtube}&key=${process.env.YOUTUBE_API_KEY}`,
    {
      method: "GET",
    }
  )
    .then((res) => res.json())
    .then(async (data) => {
      await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${data.items[0].snippet.channelId}&key=${process.env.YOUTUBE_API_KEY}`,
        {
          method: "GET",
        }
      )
        .then((res) => res.json())
        .then(async (data) => {
          youtubeFollower = await data.items[0].statistics.subscriberCount;
        })
        .catch((err) => {
          return res.status(400).json({ status: -1, error: err.message });
        });
    })
    .catch((err) => {
      return res.status(400).json({ status: -1, error: err.message });
    });
  let access_token = "";
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
      await fetch(`https://api.twitch.tv/helix/users?login=${twitch}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Client-Id": process.env.CLIENT_ID,
        },
      })
        .then((res) => res.json())
        .then(async (data) => {
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
  await fetch(
    `https://instagram28.p.rapidapi.com/user_info?user_name=${instagram}`,
    {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": `${process.env.INSTAGRAM_API_KEY}`,
        "X-RapidAPI-Host": "instagram28.p.rapidapi.com",
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      instaFollower = data.data.user.edge_followed_by.count;
    })
    .catch((err) => {
      return res.status(400).json({ status: -1, error: err.message });
    });

  finalData = {
    instagram: instaFollower,
    twitch: twitchFollower,
    youtube: youtubeFollower,
  };

  return res.status(200).json(finalData);
});

app.listen(process.env.PORT, () => {
  console.log(`Server Started at PORT: ${process.env.PORT}`);
});
