import Head from "next/head";
import "../static/basic.css";
import withAuth from "../lib/withAuth";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Backyard.wtf</title>
        <link rel="shortcut icon" href="/static/favicon.ico" />
      </Head>
      <div
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default withAuth(MyApp);
