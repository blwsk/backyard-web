import React from "react";
import Head from "next/head";
import withAuth from "../lib/withAuth";
import DragAndDrop from "../components/dragAndDrop";
import { AppProps } from "next/app";

import "../public/tailwind.css";
import "../public/basic.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <title>Backyard.wtf</title>
        <link rel="shortcut icon" href="/public/favicon.ico" />
      </Head>

      {/* <DragAndDrop
        style={{
          height: "100%",
          width: "100%",
        }}
      > */}
      <Component {...pageProps} />
      {/* </DragAndDrop> */}
    </>
  );
}

export default withAuth(MyApp);
