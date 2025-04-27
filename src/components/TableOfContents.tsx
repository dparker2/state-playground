import { useLayoutEffect, useRef } from "react";

export default function () {
  const nav = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const currentPage = () => {};

    addEventListener("scroll", currentPage);

    () => {
      removeEventListener("scroll", currentPage);
    };
  }, [nav.current]);

  return (
    <aside>
      <nav ref={nav}>
        <ul>
          <li>
            <a href="#debounced-counter">Debounced Counter</a>
          </li>
          <li>
            <a href="#fetching-data">Fetching Data</a>
          </li>
          <li>
            <a href="#resizable-panel">Resizable Panel</a>
          </li>
          <li>
            <a href="#ten-thousand-items">10,000 Items</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
