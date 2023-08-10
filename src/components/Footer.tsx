import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative flex min-h-screen w-0 items-start lg:w-min">
      <div className="sticky top-60 hidden w-48 rounded-br-lg rounded-tr-lg bg-neutral-content py-4 text-right text-primary-content lg:block [&>p]:px-2">
        <p>Pokèmon is trademark of Nintendo</p>
        <div className="divider divider-vertical my-1"></div>
        <p>
          This is a project by{" "}
          <Link
            href="https://github.com/smmmfrd"
            rel="noopener noreferrer"
            target="_blank"
            className="link font-bold"
          >
            @smmmfrd. &rarr;
          </Link>
        </p>
        <div className="divider divider-vertical my-1"></div>
        <p>
          View the source code{" "}
          <Link
            href="https://github.com/smmmfrd/pokebook"
            rel="noopener noreferrer"
            target="_blank"
            className="link font-bold"
          >
            on Github! &rarr;
          </Link>
        </p>
      </div>
    </footer>
  );
}
