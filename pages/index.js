import Head from "next/head";
import EkikiGwe from "../ekiki-gwe.jsx";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Ekiki Gwe</title>
        <meta name="description" content="A shared-device party card game for unforgettable group nights." />
        <meta name="theme-color" content="#07070f" />
      </Head>
      <EkikiGwe />
    </>
  );
}
