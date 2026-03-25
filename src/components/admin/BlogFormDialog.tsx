import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateSlug } from "@/hooks/use-products";
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

const blogSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z.string().trim().min(1, "Slug is required"),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().min(1, "Content is required"),
  cover_image: z.string().trim().optional().or(z.literal("")),
  author: z.string().trim().min(1),
  published: z.boolean(),
  tags: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: any | null;
}

export function BlogFormDialog({ open, onOpenChange, post }: BlogFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!post;

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      author: "91Fitz",
      published: false,
      tags: "",
    },
  });

  useEffect(() => {
    if (open && post) {
      form.reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        cover_image: post.cover_image || "",
        author: post.author,
        published: post.published,
        tags: post.tags?.join(", ") || "",
      });
    } else if (open) {
      form.reset({
        title: "", slug: "", excerpt: "", content: "",
        cover_image: "", author: "91Fitz", published: false, tags: "",
      });
    }
  }, [open, post, form]);

  const watchTitle = form.watch("title");
  useEffect(() => {
    if (!isEdit && watchTitle) {
      form.setValue("slug", generateSlug(watchTitle));
    }
  }, [watchTitle, isEdit, form]);

  const onSubmit = async (values: BlogFormValues) => {
    const tags = values.tags
      ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt || null,
      content: values.content,
      cover_image: values.cover_image || null,
      author: values.author,
      published: values.published,
      tags,
      updated_at: new Date().toISOString(),
    };

    const { error } = isEdit
      ? await supabase.from("blog_posts").update(payload).eq("id", post.id)
      : await supabase.from("blog_posts").insert({ ...payload, related_product_ids: [] });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEdit ? "Post updated" : "Post created");
    queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-primary">
            {isEdit ? "Edit Post" : "New Blog Post"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit ? "Update the post details." : "Create a new blog post."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Title</FormLabel>
                <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Slug</FormLabel>
                <FormControl><Input {...field} className="bg-background border-border font-mono text-sm" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="excerpt" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Excerpt</FormLabel>
                <FormControl><Textarea {...field} rows={2} placeholder="Short preview..." className="bg-background border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Content</FormLabel>
                <FormControl><Textarea {...field} rows={10} placeholder="Write your post... Use # for headings, - for lists" className="bg-background border-border font-mono text-sm" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="cover_image" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Cover Image URL</FormLabel>
                <FormControl><Input {...field} placeholder="https://..." className="bg-background border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="author" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Author</FormLabel>
                  <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="tags" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Tags (comma-separated)</FormLabel>
                  <FormControl><Input {...field} placeholder="styling, hoodies" className="bg-background border-border" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="published" render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormLabel className="text-foreground mt-0">Published</FormLabel>
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
                {form.formState.isSubmitting ? "Saving..." : isEdit ? "Update" : "Create Post"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
