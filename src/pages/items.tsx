import { Item } from "@prisma/client";
import Head from "next/head";
import { caller } from "~/server/api/root";

export async function getStaticProps() {
  const items = await caller.item.getAll();
  return { props: { items } };
}

type ItemsPageProps = {
  items: Item[];
};

export default function ItemsPage({ items }: ItemsPageProps) {
  return (
    <>
      <Head>
        <title>Items</title>
      </Head>
      <nav className="border-b px-4 py-2">
        <h1 className="text-3xl">Items</h1>
      </nav>
      {items.map((item) => (
        <section>
          <header>{item.name}</header>
        </section>
      ))}
    </>
  );
}
