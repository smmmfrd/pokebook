import { Item } from "@prisma/client";
import Head from "next/head";
import Image from "next/image";
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
      <nav className="px-4">
        <h1 className="py-2 text-4xl">Items</h1>

        <h2 className="mx-4 mb-2 text-xl">Choose by Category:</h2>
        <ul className="mx-4 flex flex-col justify-end gap-4 rounded-xl bg-base-300 py-3">
          {itemTypes.map((type) => (
            <li
              key={type.name}
              className="border-b border-b-neutral px-4 pb-3 last:-mb-2 last:border-none"
            >
              <button className="group flex w-full justify-between text-left font-mono text-xl transition-all hover:py-1">
                <span className="group-hover:underline">
                  {type.name.split(/(?=[A-Z])/).join(" ")}
                </span>{" "}
                <span>({type.count}) &rarr;</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* {items.map((item) => (
        <section key={item.id} className="w-full border-b px-2 py-2">
          <header className="flex">
            <h2 className="text-xl">{item.name}</h2>
            <Image
              src={item.sprite}
              alt={`${item.name}'s sprite`}
              height={30}
              width={30}
            />
          </header>
          <p>{item.effect}</p>
        </section>
      ))} */}
    </>
  );
}
