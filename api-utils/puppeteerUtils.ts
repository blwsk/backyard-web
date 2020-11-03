import puppeteer from "puppeteer";

const { NODE_ENV } = process.env;

export const findEndPageUrl = async (startUrl) => {
  const browser = await puppeteer.launch({
    headless: NODE_ENV === "development" ? false : true,
  });

  const page = await browser.newPage();

  await page.goto(startUrl);

  const stats = await page.evaluate(() => {
    return {
      url: window.location.href,
    };
  });

  await browser.close();

  return stats.url;
};
