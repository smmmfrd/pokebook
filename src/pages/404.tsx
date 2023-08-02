import Head from "next/head";
import BackHeader from "~/components/BackHeader";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 | Pokebook</title>
      </Head>
      <BackHeader title="Go Back" />
      <p className="text-center">Page not found!</p>
    </>
  );
}
