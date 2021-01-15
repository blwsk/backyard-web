const YOUTUBE_EMP = /https:\/\/(www\.|m\.)?youtube\.com\/watch\?v=/i;

export const isYouTube = (str) => YOUTUBE_EMP.test(str);

const TWITTER_EXP = /https:\/\/(mobile\.)?twitter\.com/i;

export const isTwitter = (str) => TWITTER_EXP.test(str);
