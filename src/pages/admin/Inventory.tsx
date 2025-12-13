import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  History,
  Plus,
  Minus,
  Search,
  RefreshCw,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  stock: number;
  low_stock_threshold: number | null;
  category: string;
  price: number;
  images: string[];
}

interface StockMovement {
  id: string;
  product_id: string;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  movement_type: string;
  reason: string | null;
  notes: string | null;
  created_at: string;
  products?: { name: string } | null;
}

const movementTypes = [
  { value: "in", label: "Stock In", icon: Plus },
  { value: "out", label: "Stock Out", icon: Minus },
  { value: "adjustment", label: "Adjustment", icon: ArrowUpDown },
];

const reasons = {
  in: ["purchase", "return", "transfer_in", "found", "other"],
  out: ["damage", "theft", "expired", "transfer_out", "sample", "other"],
  adjustment: ["correction", "count_adjustment", "system_error", "other"],
};

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  
  // Adjustment modal
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"in" | "out" | "adjustment">("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Threshold modal
  const [thresholdOpen, setThresholdOpen] = useState(false);
  const [thresholdValue, setThresholdValue] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [productsRes, movementsRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, stock, low_stock_threshold, category, price, images")
        .order("name"),
      supabase
        .from("stock_movements")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (movementsRes.data) setMovements(movementsRes.data as StockMovement[]);
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const threshold = product.low_stock_threshold || 10;
    
    if (filter === "low") return matchesSearch && product.stock > 0 && product.stock <= threshold;
    if (filter === "out") return matchesSearch && product.stock === 0;
    return matchesSearch;
  });

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => {
      const threshold = p.low_stock_threshold || 10;
      return p.stock > 0 && p.stock <= threshold;
    }).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + p.stock * p.price, 0),
  };

  const openAdjustment = (product: Product, type: "in" | "out" | "adjustment") => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setQuantity("");
    setReason("");
    setNotes("");
    setAdjustmentOpen(true);
  };

  const openThreshold = (product: Product) => {
    setSelectedProduct(product);
    setThresholdValue(String(product.low_stock_threshold || 10));
    setThresholdOpen(true);
  };

  const handleAdjustment = async () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    setSubmitting(true);
    try {
      const quantityChange = adjustmentType === "out" 
        ? -parseInt(quantity) 
        : parseInt(quantity);

      const { error } = await supabase.rpc("adjust_stock", {
        p_product_id: selectedProduct.id,
        p_quantity_change: quantityChange,
        p_movement_type: adjustmentType,
        p_reason: reason,
        p_notes: notes || null,
      });

      if (error) throw error;

      toast.success("Stock adjusted successfully");
      setAdjustmentOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to adjust stock");
    } finally {
      setSubmitting(false);
    }
  };

  const handleThresholdUpdate = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({ low_stock_threshold: parseInt(thresholdValue) || 10 })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      toast.success("Threshold updated");
      setThresholdOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to update threshold");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStockStatus = (product: Product) => {
    const threshold = product.low_stock_threshold || 10;
    if (product.stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (product.stock <= threshold) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "outline" as const };
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage stock levels</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className={stats.lowStock > 0 ? "border-yellow-500/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>

          <Card className={stats.outOfStock > 0 ? "border-destructive/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of Stock
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
              <p className="text-xs text-muted-foreground">Unavailable items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stock Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total inventory value</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stock" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stock">Stock Levels</TabsTrigger>
            <TabsTrigger value="history">Movement History</TabsTrigger>
            <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
          </TabsList>

          {/* Stock Levels Tab */}
          <TabsContent value="stock" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="low">Low Stock Only</SelectItem>
                  <SelectItem value="out">Out of Stock Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Threshold</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const status = getStockStatus(product);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-stone rounded overflow-hidden">
                                {product.images?.[0] && (
                                  <img
                                    src={product.images[0]}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {product.category}
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {product.stock}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openThreshold(product)}
                              className="font-mono text-muted-foreground"
                            >
                              {product.low_stock_threshold || 10}
                            </Button>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openAdjustment(product, "in")}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openAdjustment(product, "out")}
                                disabled={product.stock === 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openAdjustment(product, "adjustment")}
                              >
                                <ArrowUpDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Movement History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-center">Change</TableHead>
                    <TableHead className="text-center">Before → After</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No stock movements recorded yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(movement.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {movement.products?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {movement.movement_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground">
                          {movement.reason?.replace(/_/g, " ") || "-"}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          <span
                            className={
                              movement.quantity_change > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {movement.quantity_change > 0 ? "+" : ""}
                            {movement.quantity_change}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-mono text-muted-foreground">
                          {movement.previous_stock} → {movement.new_stock}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {movement.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Low Stock Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {stats.lowStock === 0 && stats.outOfStock === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">All stock levels are healthy!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {products
                  .filter((p) => {
                    const threshold = p.low_stock_threshold || 10;
                    return p.stock <= threshold;
                  })
                  .sort((a, b) => a.stock - b.stock)
                  .map((product) => {
                    const threshold = product.low_stock_threshold || 10;
                    const isOut = product.stock === 0;
                    return (
                      <Card
                        key={product.id}
                        className={isOut ? "border-destructive/50" : "border-yellow-500/50"}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-stone rounded overflow-hidden">
                                {product.images?.[0] && (
                                  <img
                                    src={product.images[0]}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {product.category}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p
                                  className={`text-2xl font-bold ${
                                    isOut ? "text-destructive" : "text-yellow-600"
                                  }`}
                                >
                                  {product.stock}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Threshold: {threshold}
                                </p>
                              </div>
                              <Button
                                onClick={() => openAdjustment(product, "in")}
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Stock
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Stock Adjustment Modal */}
      <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === "in"
                ? "Add Stock"
                : adjustmentType === "out"
                ? "Remove Stock"
                : "Adjust Stock"}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-stone rounded-lg">
                <div className="w-12 h-12 bg-background rounded overflow-hidden">
                  {selectedProduct.images?.[0] && (
                    <img
                      src={selectedProduct.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Current stock: {selectedProduct.stock}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Movement Type</Label>
                <div className="flex gap-2">
                  {movementTypes.map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={adjustmentType === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setAdjustmentType(type.value as any);
                        setReason("");
                      }}
                    >
                      <type.icon className="h-4 w-4 mr-2" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={adjustmentType === "out" ? selectedProduct.stock : undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
                {adjustmentType === "out" && (
                  <p className="text-xs text-muted-foreground">
                    Maximum: {selectedProduct.stock}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons[adjustmentType].map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">
                        {r.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={2}
                />
              </div>

              {quantity && parseInt(quantity) > 0 && (
                <div className="p-3 bg-stone rounded-lg text-sm">
                  <p>
                    New stock level:{" "}
                    <span className="font-bold">
                      {adjustmentType === "out"
                        ? selectedProduct.stock - parseInt(quantity)
                        : selectedProduct.stock + parseInt(quantity)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustmentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustment} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Threshold Modal */}
      <Dialog open={thresholdOpen} onOpenChange={setThresholdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Low Stock Threshold</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Set the minimum stock level for <strong>{selectedProduct.name}</strong>. 
                You'll see alerts when stock falls below this level.
              </p>

              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setThresholdOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleThresholdUpdate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Inventory;
