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

type ItemType = {
  name: string;
  count: number;
};

export default function ItemsPage({ items }: ItemsPageProps) {
  const itemTypes = items
    .reduce((acc, item) => {
      const typeIndex = acc.findIndex((type) => type.name === item.itemType);
      if (typeIndex >= 0) {
        return acc.map((type, index) =>
          index === typeIndex
            ? {
                ...type,
                count: type.count + 1,
              }
            : type
        );
      } else {
        return [...acc, { name: item.itemType, count: 1 }];
      }
    }, [] as ItemType[])
    .sort((a, b) => (a.count > b.count ? -1 : 1));

  return (
    <>
      <Head>
        <title>Items</title>
      </Head>
      <nav className="border-b py-2">
        <h1 className="px-4 text-3xl">Items</h1>

        <ul className="flex flex-wrap justify-center gap-1">
          {itemTypes.map((type) => (
            <li>
              <button className="btn-xs btn">
                {type.name.split(/(?=[A-Z])/).join(" ")} - ({type.count})
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* {items.map((item) => (
        <section>
          <header>{item.name}</header>
        </section>
      ))} */}
    </>
  );
}
