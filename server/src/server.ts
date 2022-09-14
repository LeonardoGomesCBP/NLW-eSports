import express from "express";
import { PrismaClient } from "@prisma/client";
import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string";
import cors from 'cors';
const app = express();

app.use(express.json())
const prisma = new PrismaClient({
  log: ["query"],
});

app.use(cors())

app.get("/games", async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return response.json(games);
});

app.post("/games/:id/ads", async (request, response) => {

  const gameId = request.params.id;
  const body: any = request.body;

  

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      weekDays: body.weekDays.join(','),
      useVoiceChannel: body.useVoiceChannel,
      yearsPlaying: body.yearsPlaying,
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      discord: body.discord,

    }
  })

  return response.status(201).json(ad);
});

app.get("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({

    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },

    where: {
      gameId: gameId,
    },

    orderBy: {
      createdAt: "desc"
    }
  });

  return response.json(ads.map(ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hoursStart: convertMinutesToHourString(ad.hourStart),
      hourEnd: convertMinutesToHourString(ad.hourEnd)
    }
  }));
});

app.get("/ads/:id/discord",  async (request, response) => {

  const adId = request.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord:true,
    },
    where: {
      id: adId,
    }
  })

  return response.json({
    discord: ad.discord,
  });
});

app.listen(3333);
