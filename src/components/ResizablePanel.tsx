import React, { useLayoutEffect, useRef } from "react";
import ViewModel from "../viewmodel.ts";
import styles from "./ResizablePanel.module.css";

class OffsetModel extends ViewModel<number> {
  static minOffset = 100;

  initialize(containerWidth: number) {
    this.setState(containerWidth / 2);
  }

  onMouseDown(container: HTMLDivElement | null, e: React.MouseEvent) {
    if (!container) return;
    e.preventDefault();

    const maxOffset = container.clientWidth - OffsetModel.minOffset;
    const containerX = container.getBoundingClientRect().x;
    const minClientX = containerX + OffsetModel.minOffset;
    const maxClientX = containerX + maxOffset;
    const mouseMove = (e: MouseEvent) => {
      const origX = e.clientX - e.movementX;
      if (origX < minClientX || maxClientX < origX) return;
      this.setState((curr) =>
        Math.max(
          OffsetModel.minOffset,
          Math.min(maxOffset, (curr += e.movementX))
        )
      );
    };
    const mouseUp = () => {
      removeEventListener("mousemove", mouseMove);
      removeEventListener("mouseup", mouseUp);
    };
    addEventListener("mousemove", mouseMove);
    addEventListener("mouseup", mouseUp);
  }
}

export default function () {
  const offsetModel = OffsetModel.useModel(OffsetModel.minOffset);
  const container = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!container.current) return;
    offsetModel.initialize(container.current.clientWidth);
  }, [container.current]);

  const offset = offsetModel.getState();
  return (
    <article id="resizable-panel">
      <header>
        <h4>Resizable Panel</h4>
      </header>
      <div className={styles.container} ref={container}>
        <textarea
          className={styles.panel}
          rows={10}
          style={{ flexBasis: offset }}
        ></textarea>
        <div
          className={styles.divider}
          onMouseDown={(e) => offsetModel.onMouseDown(container.current, e)}
          style={{ left: offset }}
        ></div>
        <textarea className={styles.panel} rows={10}></textarea>
      </div>
    </article>
  );
}
