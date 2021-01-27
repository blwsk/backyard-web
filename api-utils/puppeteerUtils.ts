import { launchChromium } from "playwright-aws-lambda";

const { NODE_ENV } = process.env;

export const findEndPageUrl = async (startUrl) => {
  const browser = await launchChromium({
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

export const getPageContent = async (startUrl) => {
  const browser = await launchChromium({
    headless: NODE_ENV === "development" ? false : true,
  });

  const page = await browser.newPage();

  await page.goto(startUrl);

  const stats: { url: string; contentHtml: string } = await page.evaluate(
    () => {
      return {
        url: window.location.href,
        contentHtml: document.documentElement.innerHTML,
      };
    }
  );

  await browser.close();

  return stats;
};
