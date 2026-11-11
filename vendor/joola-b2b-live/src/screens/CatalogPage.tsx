import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RECOMMENDED_META, money } from "../data/ledger";
import { useStore } from "../state/Store";
import { useScreenQuery } from "../hooks/useScreenQuery";
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  SyncBanner,
} from "../components/ui/primitives";

export function CatalogPage() {
  const { products, addToCart, account } = useStore();
  const [category, setCategory] = useState<string>("All");
  const list = Object.values(products);

  const { status, error, reload, syncing } = useScreenQuery(
    "catalog",
    () => list,
    [list.length],
  );

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(list.map((p) => p.category)))],
    [list],
  );

  const filtered =
    category === "All" ? list : list.filter((p) => p.category === category);

  const recommended = list.filter((p) => RECOMMENDED_META[p.id]);

  if (status === "loading") {
    return (
      <section className="page page--catalog">
        <h1>Catalog</h1>
        <Skeleton rows={5} />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--catalog">
        <h1>Catalog</h1>
        <ErrorState
          title="Could not load catalog"
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  if (status === "empty") {
    return (
      <section className="page page--catalog">
        <h1>Catalog</h1>
        <EmptyState>
          No products are available for this account yet.
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="page page--catalog">
      <h1>Catalog</h1>
      <p className="page-lede">
        Products available to {account?.name ?? "your account"}.
      </p>
      {syncing ? <SyncBanner /> : null}

      <div className="cat-chips" role="tablist" aria-label="Categories">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={c === category ? "on" : undefined}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {category === "All" && recommended.length > 0 ? (
        <div className="rec-block">
          <h2>Recommended</h2>
          <p className="rec-desc">Based on what this account already orders.</p>
          <div className="rec-rail">
            {recommended.map((p) => (
              <article className="rec-card" key={p.id}>
                <div className="media">
                  <img src={p.image} alt="" />
                </div>
                <div className="card-body">
                  <h3 className="title">{p.fullName}</h3>
                  <div className="price-row">
                    <span className="price tnum">{money(p.buyerPrice)}</span>
                    <span className="msrp tnum">{money(p.msrp)}</span>
                  </div>
                  <p className="why">{RECOMMENDED_META[p.id]?.reason}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      addToCart(p.id, Math.max(p.moq, p.presets[0] ?? p.moq));
                      toast.success(`Added ${p.name} to cart`);
                    }}
                  >
                    Add to cart
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <h2 className="section-title">All products</h2>
      {filtered.length === 0 ? (
        <EmptyState>No products in this category.</EmptyState>
      ) : (
        <div className="catalog-grid">
          {filtered.map((p) => (
            <article className="catalog-card" key={p.id}>
              <div className="media">
                <img src={p.image} alt="" />
              </div>
              <div className="card-body">
                <h3>{p.fullName}</h3>
                <div className="meta">SKU {p.sku}</div>
                <div className="price tnum">{money(p.buyerPrice)}</div>
                <Button
                  variant="primary"
                  onClick={() => {
                    addToCart(p.id, Math.max(p.moq, p.presets[0] ?? p.moq));
                    toast.success(`Added ${p.name} to cart`);
                  }}
                >
                  Add to cart
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CatalogPage;
