import Head from "next/head";

type ItemsPageProps = {};

export default function ItemsPage({}: ItemsPageProps) {
  return (
    <>
      <Head>
        <title>Items</title>
      </Head>
      <nav className="border-b px-4 py-2">
        <h1 className="text-3xl">Items</h1>
      </nav>
    </>
  );
}
