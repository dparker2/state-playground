import React from "react";
import ViewModel from "../viewmodel.ts";

type VirtualizedListState = {
  startIndex: number;
  itemHeight: number;
  visibleHeight: number;
};
class VirtualizedListVM extends ViewModel<VirtualizedListState> {
  data: number[] = Array(10000)
    .fill(0)
    .map((_, i) => i + 1);

  onScroll(event: React.UIEvent) {
    const { itemHeight, startIndex } = this.getState();
    const scrollTop = event.currentTarget.scrollTop;
    const newIndex = Math.floor(scrollTop / itemHeight);

    if (newIndex !== startIndex) {
      this.setState({
        startIndex: newIndex,
      });
    }
  }

  scrollerStyle() {
    const { visibleHeight } = this.getState();

    return {
      overflow: "auto",
      height: visibleHeight,
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
    const { startIndex, itemHeight, visibleHeight } = this.getState();
    const endIndex = startIndex + Math.ceil(visibleHeight / itemHeight);

    return this.data.slice(startIndex, endIndex);
  }
}

export default function () {
  const vm = VirtualizedListVM.useModel({
    startIndex: 0,
    itemHeight: 61.5,
    visibleHeight: 400,
  });
  return (
    <article id="ten-thousand-items">
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
