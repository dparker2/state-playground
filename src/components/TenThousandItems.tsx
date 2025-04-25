import React from "react";
import ViewModel from "../viewmodel.ts";

type VirtualizedListState = {
  startIndex: number;
  itemHeight: number;
  scrollHeight: number;
};
class VirtualizedListVM extends ViewModel<VirtualizedListState> {
  data: number[] = Array(10000)
    .fill(0)
    .map((_, i) => i + 1);
  itemHeight: number = 0;
  container: HTMLElement | null = null;
  items: HTMLElement[] = [];

  onScroll(event: React.UIEvent) {
    const { itemHeight } = this.getState();
    const scrollTop = event.currentTarget.scrollTop;

    this.setState({
      startIndex: Math.floor(scrollTop / itemHeight),
    });
  }

  scrollerStyle() {
    const { scrollHeight } = this.getState();

    return {
      overflow: "auto",
      height: scrollHeight,
    } as const;
  }

  containerStyle() {
    const { itemHeight, startIndex } = this.getState();

    return {
      height: itemHeight * this.data.length,
      paddingTop: startIndex * itemHeight,
    } as const;
  }

  visibleItems() {
    const { startIndex, itemHeight, scrollHeight } = this.getState();
    const endIndex = startIndex + Math.ceil(scrollHeight / itemHeight);

    return this.data.slice(startIndex, endIndex);
  }
}

export default function () {
  const vm = VirtualizedListVM.useModel({
    startIndex: 0,
    itemHeight: 61.5,
    scrollHeight: 400,
  });
  return (
    <article>
      <header>
        <h4>10,000 Items</h4>
      </header>
      <div style={vm.scrollerStyle()} onScroll={(e) => vm.onScroll(e)}>
        <div style={vm.containerStyle()}>
          {vm.visibleItems().map((val) => (
            <article key={val}>{val}</article>
          ))}
        </div>
      </div>
    </article>
  );
}
