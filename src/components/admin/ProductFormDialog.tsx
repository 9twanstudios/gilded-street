import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CATEGORIES = ["Hoodies", "T-Shirts", "Pants", "Caps", "Sneakers", "Accessories"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const BADGES = ["New", "Sale", "Hot", "Limited"];

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  price: z.coerce.number().int().positive("Price must be positive"),
  original_price: z.coerce.number().int().positive().optional().or(z.literal("")),
  image: z.string().trim().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  sizes: z.array(z.string()).min(1, "Select at least one size"),
  badge: z.string().optional().or(z.literal("")),
  in_stock: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string;
  category: string;
  sizes: string[];
  badge: string | null;
  in_stock: boolean;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      original_price: "",
      image: "",
      category: "",
      sizes: [],
      badge: "",
      in_stock: true,
    },
  });

  useEffect(() => {
    if (open && product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        original_price: product.original_price || "",
        image: product.image,
        category: product.category,
        sizes: product.sizes,
        badge: product.badge || "",
        in_stock: product.in_stock,
      });
    } else if (open) {
      form.reset({
        name: "", description: "", price: 0, original_price: "",
        image: "", category: "", sizes: [], badge: "", in_stock: true,
      });
    }
  }, [open, product, form]);

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || null,
      price: values.price,
      original_price: values.original_price ? Number(values.original_price) : null,
      image: values.image,
      category: values.category,
      sizes: values.sizes,
      badge: values.badge || null,
      in_stock: values.in_stock,
    };

    const { error } = isEdit
      ? await supabase.from("products").update(payload).eq("id", product!.id)
      : await supabase.from("products").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEdit ? "Product updated" : "Product added");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-primary">
            {isEdit ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit ? "Update the product details below." : "Fill in the product details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Name</FormLabel>
                <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Description</FormLabel>
                <FormControl><Textarea {...field} rows={3} className="bg-background border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Price (KES)</FormLabel>
                  <FormControl><Input type="number" {...field} className="bg-background border-border" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="original_price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Original Price</FormLabel>
                  <FormControl><Input type="number" placeholder="Optional" {...field} className="bg-background border-border" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="image" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Image URL</FormLabel>
                <FormControl><Input {...field} placeholder="https://..." className="bg-background border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-border">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sizes" render={() => (
              <FormItem>
                <FormLabel className="text-foreground">Sizes</FormLabel>
                <div className="flex flex-wrap gap-3">
                  {SIZES.map((size) => (
                    <FormField key={size} control={form.control} name="sizes" render={({ field }) => (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={field.value?.includes(size)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            field.onChange(
                              checked ? [...current, size] : current.filter((s: string) => s !== size)
                            );
                          }}
                        />
                        <span className="text-sm text-foreground">{size}</span>
                      </label>
                    )} />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="badge" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Badge (optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="">None</SelectItem>
                    {BADGES.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="in_stock" render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormLabel className="text-foreground mt-0">In Stock</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
                className="border-border text-muted-foreground">
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}
                className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-primary/90">
                {form.formState.isSubmitting ? "Saving..." : isEdit ? "Update" : "Add Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
