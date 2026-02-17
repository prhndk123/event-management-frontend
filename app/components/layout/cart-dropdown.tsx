import { Link } from "react-router";
import { ShoppingCart, Trash2, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "~/store/cart-store";
import { Button } from "~/components/ui/button";

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { items, removeItem, getSubtotal } = useCartStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full hover:scale-105 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ShoppingCart className="h-5 w-5" />
        {/* Badge */}
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Shopping Cart
              </h3>
              <span className="text-xs text-muted-foreground">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Items */}
            <div className="max-h-64 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Your cart is empty
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.ticketType.id}
                    className="flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Ticket className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.event.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.ticketType.name} × {item.quantity}
                      </p>
                      <p className="text-xs font-semibold text-primary mt-0.5">
                        {formatPrice(item.ticketType.price * item.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.ticketType.id);
                      }}
                      className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-4 py-3 border-t border-border bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(getSubtotal())}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/checkout">View Cart</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/checkout">Checkout</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
