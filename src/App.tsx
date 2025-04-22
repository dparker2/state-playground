import TableOfContents from "./components/TableOfContents.tsx";
import UserTable from "./components/UserTable.tsx";
import DebouncedCounter from "./components/DebouncedCounter.tsx";
import ResizablePanel from "./components/ResizablePanel.tsx";
import MillionItems from "./components/MillionItems.tsx";

export default function () {
  return (
    <>
      <TableOfContents />
      <div>
        <DebouncedCounter />
        <UserTable />
        <ResizablePanel />
        <MillionItems />
      </div>
    </>
  );
}
