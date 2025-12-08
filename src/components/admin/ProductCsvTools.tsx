import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id?: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  featured: boolean | null;
}

interface ProductCsvToolsProps {
  products: Product[];
  onImportComplete: () => void;
}

const ProductCsvTools = ({ products, onImportComplete }: ProductCsvToolsProps) => {
  const [importing, setImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const exportToCsv = () => {
    if (products.length === 0) {
      toast({ title: 'No products to export', variant: 'destructive' });
      return;
    }

    const headers = ['id', 'name', 'description', 'price', 'stock', 'category', 'sizes', 'colors', 'images', 'featured'];
    
    const rows = products.map(product => [
      product.id || '',
      escapeCsvValue(product.name),
      escapeCsvValue(product.description || ''),
      product.price.toString(),
      product.stock.toString(),
      escapeCsvValue(product.category),
      escapeCsvValue(product.sizes?.join(';') || ''),
      escapeCsvValue(product.colors?.join(';') || ''),
      escapeCsvValue(product.images?.join(';') || ''),
      product.featured ? 'true' : 'false',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({ title: `Exported ${products.length} products` });
  };

  const escapeCsvValue = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have a header row and at least one data row');
      }

      const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
      const requiredHeaders = ['name', 'price', 'category'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      const results = { success: 0, failed: 0, errors: [] as string[] };
      const productsToInsert: Omit<Product, 'id'>[] = [];
      const productsToUpdate: { id: string; data: Partial<Product> }[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCsvLine(lines[i]);
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          const productData = {
            name: row.name,
            description: row.description || null,
            price: parseFloat(row.price) || 0,
            stock: parseInt(row.stock) || 0,
            category: row.category,
            sizes: row.sizes ? row.sizes.split(';').map(s => s.trim()).filter(Boolean) : [],
            colors: row.colors ? row.colors.split(';').map(c => c.trim()).filter(Boolean) : [],
            images: row.images ? row.images.split(';').map(i => i.trim()).filter(Boolean) : [],
            featured: row.featured?.toLowerCase() === 'true',
          };

          if (!productData.name || !productData.category) {
            throw new Error('Name and category are required');
          }

          if (row.id) {
            productsToUpdate.push({ id: row.id, data: productData });
          } else {
            productsToInsert.push(productData);
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      // Insert new products
      if (productsToInsert.length > 0) {
        const { error } = await supabase.from('products').insert(productsToInsert);
        if (error) {
          results.failed += productsToInsert.length;
          results.errors.push(`Insert error: ${error.message}`);
        } else {
          results.success += productsToInsert.length;
        }
      }

      // Update existing products
      for (const { id, data } of productsToUpdate) {
        const { error } = await supabase.from('products').update(data).eq('id', id);
        if (error) {
          results.failed++;
          results.errors.push(`Update ${id}: ${error.message}`);
        } else {
          results.success++;
        }
      }

      setImportResults(results);
      
      if (results.success > 0) {
        onImportComplete();
      }
    } catch (error: any) {
      toast({ 
        title: 'Import failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const headers = 'name,description,price,stock,category,sizes,colors,images,featured';
    const example = 'Example Product,"A great product description",99.99,100,Clothing,XS;S;M;L;XL,Black;White;Navy,https://example.com/image1.jpg;https://example.com/image2.jpg,false';
    const csvContent = `${headers}\n${example}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={exportToCsv} disabled={products.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </div>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Import Products from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk import or update products.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted/50 rounded-md space-y-2">
              <p className="text-sm font-medium">CSV Format Requirements:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Required columns: <code className="bg-muted px-1">name</code>, <code className="bg-muted px-1">price</code>, <code className="bg-muted px-1">category</code></li>
                <li>• Optional: <code className="bg-muted px-1">id</code> (for updates), <code className="bg-muted px-1">description</code>, <code className="bg-muted px-1">stock</code>, <code className="bg-muted px-1">sizes</code>, <code className="bg-muted px-1">colors</code>, <code className="bg-muted px-1">images</code>, <code className="bg-muted px-1">featured</code></li>
                <li>• Use semicolons (;) to separate multiple values in sizes, colors, images</li>
                <li>• Include <code className="bg-muted px-1">id</code> column to update existing products</li>
              </ul>
              <Button variant="link" size="sm" className="p-0 h-auto" onClick={downloadTemplate}>
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                Download template
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md p-8">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                {importing ? 'Processing...' : 'Select CSV File'}
              </Button>
            </div>

            {importResults && (
              <div className={`p-4 rounded-md ${importResults.failed > 0 ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {importResults.failed > 0 ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <span className="font-medium">
                    {importResults.success} imported, {importResults.failed} failed
                  </span>
                </div>
                {importResults.errors.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                    {importResults.errors.slice(0, 10).map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                    {importResults.errors.length > 10 && (
                      <li>...and {importResults.errors.length - 10} more errors</li>
                    )}
                  </ul>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => {
                setImportDialogOpen(false);
                setImportResults(null);
              }}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCsvTools;
