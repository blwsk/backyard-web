interface TweetIdBrief {
  id?: string;
}

export const getTweetIdFromUrl = (url: string): TweetIdBrief => {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const pathnameParts = pathname.split("/");
  const statusIndex = pathnameParts.indexOf("status");

  if (statusIndex > -1) {
    return { id: pathnameParts[statusIndex + 1] };
  }

  return {};
};
