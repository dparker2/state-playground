import ViewModel from "../viewmodel.ts";
import styles from "./ProductList.module.css";
import data from "./ProductList.json" with { type: "json" };

type Product = {
  id: number;
  title: string;
  price: number;
  stock: number;
};

type State = {
  products: Product[];
  sortBy: "title" | "price" | "stock";
  order: "asc" | "desc";
  hovered?: Product; // Just to have some state to frequently update
};
class ProductList extends ViewModel<State> {
  getVisibleProducts = this.memoize(
    ({ products, sortBy, order }) => [products, sortBy, order],
    (products, sortBy, order) => {
      console.log("Sorting products");

      return [...products].sort((p1, p2) => {
        const a = p1[sortBy];
        const b = p2[sortBy];

        if (order === "asc") {
          if (typeof a === "string" && typeof b === "string") {
            return a.localeCompare(b);
          }
          if (typeof a === "number" && typeof b === "number") {
            return a - b;
          }
          throw new Error("Sort error");
        }

        if (order === "desc") {
          if (typeof a === "string" && typeof b === "string") {
            return b.localeCompare(a);
          }
          if (typeof a === "number" && typeof b === "number") {
            return b - a;
          }
          throw new Error("Sort error");
        }
        throw new Error("Sort error");
      });
    },
  );

  sortBy(val: State["sortBy"]) {
    this.setState({ sortBy: val });
  }

  order(val: State["order"]) {
    this.setState({ order: val });
  }

  onMouseEnter(id: number) {
    const { products } = this.getState();
    const product = products.find((p) => p.id === id);
    if (product) {
      this.setState({ hovered: product });
    }
  }
}
const initialState: State = {
  products: data.products,
  sortBy: "title",
  order: "asc",
};

export default function () {
  const vm = ProductList.useModel(initialState);
  const { sortBy, order, hovered } = vm.getState();
  const stringSorting = sortBy === "title";

  return (
    <article id="product-list">
      <header>
        <h4>Product List</h4>
      </header>
      <p>
        Products are sorted only when the selected Sort values change, not when
        the hovered item changes.
      </p>
      <div className={styles["form-container"]}>
        <form>
          <label>Sort</label>
          <fieldset role="group">
            <select
              value={sortBy}
              onChange={({ target: { value } }) => {
                if (
                  value === "title" || value === "price" || value === "stock"
                ) {
                  vm.sortBy(value);
                }
              }}
            >
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
            </select>
            <select
              value={order}
              onChange={({ target: { value } }) => {
                if (value === "desc" || value === "asc") {
                  vm.order(value);
                }
              }}
            >
              <option value="desc">
                {stringSorting ? "Z to A" : "High to Low"}
              </option>
              <option value="asc">
                {stringSorting ? "A to Z" : "Low to High"}
              </option>
            </select>
          </fieldset>
        </form>
        <p>Hovered: {hovered?.title || "None"}</p>
      </div>
      <div className={styles["list-container"]}>
        {vm.getVisibleProducts().map((p) => (
          <article
            key={p.id}
            onMouseEnter={() => vm.onMouseEnter(p.id)}
          >
            <span>${p.price} — {p.title}</span>
            <span>({p.stock} in stock)</span>
          </article>
        ))}
      </div>
    </article>
  );
}
