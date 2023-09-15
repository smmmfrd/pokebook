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
  const itemTypes = items.reduce((acc, item) => {
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
  }, [] as ItemType[]);

  return (
    <>
      <Head>
        <title>Items</title>
      </Head>
      <nav className="border-b px-4 py-2">
        <h1 className="text-3xl">Items</h1>

        <ul>
          {itemTypes.map((type) => (
            <li>
              <button>
                {type.name} - ({type.count})
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
