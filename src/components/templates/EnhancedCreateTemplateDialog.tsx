import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Editor } from '@tinymce/tinymce-react';
import { createTemplate, getTemplateCategories } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FileUploadWithProgress } from "@/components/ui/file-upload-with-progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  FileText, 
  DollarSign, 
  Eye, 
  Palette,
  MessageSquare,
  Link,
  Plus,
  X,
  Percent
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category_id: z.string().min(1, "Category is required"),
  file_url: z.string().optional(),
  preview_image_url: z.string().optional(),
  watermarked_preview_url: z.string().optional(),
  is_free: z.boolean().default(true),
  price: z.number().min(0).optional(),
  discount_price: z.number().min(0).optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  discount_end_date: z.string().optional(),
  currency: z.string().default("NGN"),
  supports_international: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  license_type: z.enum(['personal', 'commercial', 'both']).default('personal'),
  demo_url: z.string().url().optional().or(z.literal('')),
  instructions_url: z.string().url().optional().or(z.literal('')),
  file_size: z.number().optional(),
  file_type: z.string().optional(),
  max_file_size_mb: z.number().default(50),
  post_purchase_questions: z.array(z.object({
    question: z.string(),
    type: z.enum(['text', 'textarea', 'select', 'rating']),
    required: z.boolean(),
    options: z.array(z.string()).optional()
  })).default([]),
  cta_buttons: z.array(z.object({
    text: z.string(),
    url: z.string().url(),
    style: z.enum(['primary', 'secondary', 'outline'])
  })).default([]),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EnhancedCreateTemplateDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateTemplateDialogProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: categories } = useQuery({
    queryKey: ['template-categories'],
    queryFn: getTemplateCategories,
  });

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      is_free: true,
      price: 0,
      currency: "NGN",
      supports_international: false,
      tags: [],
      license_type: 'personal' as const,
      demo_url: "",
      instructions_url: "",
      max_file_size_mb: 50,
      post_purchase_questions: [],
      cta_buttons: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return createTemplate({
        name: data.name,
        description: data.description,
        author_id: user.id,
        category_id: data.category_id,
        file_url: data.file_url,
        preview_image_url: data.preview_image_url,
        watermarked_preview_url: data.watermarked_preview_url,
        is_free: data.is_free,
        price: data.price,
        discount_price: data.discount_price,
        discount_percentage: data.discount_percentage,
        discount_end_date: data.discount_end_date,
        currency: data.currency,
        supports_international: data.supports_international,
        published: false,
        tags: data.tags,
        license_type: data.license_type,
        demo_url: data.demo_url || null,
        instructions_url: data.instructions_url || null,
        file_size: data.file_size,
        file_type: data.file_type,
        max_file_size_mb: data.max_file_size_mb,
        post_purchase_questions: data.post_purchase_questions as Array<{question: string; type: 'text' | 'textarea' | 'select' | 'rating'; required: boolean; options?: string[]}>,
        cta_buttons: data.cta_buttons as Array<{text: string; url: string; style: 'primary' | 'secondary' | 'outline'}>,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template created successfully!",
      });
      form.reset();
      setCurrentStep(1);
      onSuccess();
    },
    onError: (error) => {
      console.error('Template creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    createMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const addTag = () => {
    if (tagInput.trim() && !form.watch('tags').includes(tagInput.trim())) {
      const currentTags = form.watch('tags');
      form.setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.watch('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const addPostPurchaseQuestion = () => {
    if (questionInput.trim()) {
      const currentQuestions = form.watch('post_purchase_questions');
      form.setValue('post_purchase_questions', [
        ...currentQuestions,
        {
          question: questionInput.trim(),
          type: 'text' as const,
          required: false,
          options: []
        }
      ]);
      setQuestionInput('');
    }
  };

  const removeQuestion = (index: number) => {
    const currentQuestions = form.watch('post_purchase_questions');
    form.setValue('post_purchase_questions', currentQuestions.filter((_, i) => i !== index));
  };

  const addCtaButton = () => {
    if (ctaText.trim() && ctaUrl.trim()) {
      const currentButtons = form.watch('cta_buttons');
      form.setValue('cta_buttons', [
        ...currentButtons,
        {
          text: ctaText.trim(),
          url: ctaUrl.trim(),
          style: 'primary' as const
        }
      ]);
      setCtaText('');
      setCtaUrl('');
    }
  };

  const removeCtaButton = (index: number) => {
    const currentButtons = form.watch('cta_buttons');
    form.setValue('cta_buttons', currentButtons.filter((_, i) => i !== index));
  };

  const getCategorySpecificFields = () => {
    const selectedCat = categories?.find(cat => cat.id === selectedCategory);
    if (!selectedCat) return null;

    // Add category-specific customization based on template type
    const categoryName = selectedCat.name.toLowerCase();
    
    if (categoryName.includes('notion')) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Notion Template Specific</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="demo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notion Template Link *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://notion.so/your-template" {...field} />
                  </FormControl>
                  <FormDescription>
                    Direct link to your Notion template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText },
    { number: 2, title: "Rich Description", icon: FileText },
    { number: 3, title: "Files & Preview", icon: Upload },
    { number: 4, title: "Pricing (NGN)", icon: DollarSign },
    { number: 5, title: "Customer Questions", icon: MessageSquare },
    { number: 6, title: "Marketing & CTAs", icon: Link },
    { number: 7, title: "Review & Create", icon: Eye },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Create your template with rich descriptions, secure payments (NGN), and customer feedback
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center min-w-fit">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs ${
                currentStep >= step.number ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <step.icon className="h-3 w-3" />
              </div>
              <div className="ml-2 text-xs font-medium min-w-fit">
                {step.title}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Professional Resume Template" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedCategory(value);
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags */}
                    <div className="space-y-2">
                      <FormLabel>Tags</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tags..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {form.watch('tags').map((tag) => (
                          <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                            {tag} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {getCategorySpecificFields()}
              </div>
            )}

            {/* Step 2: Rich Description */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rich Description</CardTitle>
                    <CardDescription>
                      Use the rich text editor to create compelling descriptions with images
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Description *</FormLabel>
                          <FormControl>
                            <div className="border rounded-lg">
                              <Editor
                                apiKey="hblwwgctvkf8ip8w7m3dnhtvamb1oxfxg6ib8mfkyz8693bp"
                                value={field.value}
                                onEditorChange={(content) => field.onChange(content)}
                                init={{
                                  height: 400,
                                  menubar: false,
                                  plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                                  ],
                                  toolbar: 'undo redo | blocks | ' +
                                    'bold italic forecolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | help | image link',
                                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                  image_upload_handler: async (blobInfo) => {
                                    // Handle image upload to Supabase
                                    const file = blobInfo.blob();
                                    const fileName = `${Math.random()}.${file.type.split('/')[1]}`;
                                    const { data, error } = await supabase.storage
                                      .from('Template Files')
                                      .upload(`description-images/${fileName}`, file);
                                    
                                    if (error) throw error;
                                    
                                    const { data: { publicUrl } } = supabase.storage
                                      .from('Template Files')
                                      .getPublicUrl(data.path);
                                    
                                    return publicUrl;
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Create a detailed description with images, bullet points, and formatting
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Files & Preview */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Template Files & Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FileUploadWithProgress
                      title="Template File"
                      description="Supported: PDF, DOCX, XLSX, PSD, AI, ZIP, etc."
                      accept=".zip,.rar,.pdf,.docx,.xlsx,.psd,.ai,.sketch,.figma,.indd,.csv,.txt,.mp4"
                      maxSize={form.watch('max_file_size_mb')}
                      enforceZipForLargeFiles={true}
                      largeFileThreshold={25}
                      bucketName="Template Files"
                      folder="templates"
                      onFileUpload={(url, fileInfo) => {
                        form.setValue('file_url', url);
                        form.setValue('file_size', fileInfo.size);
                        form.setValue('file_type', fileInfo.type);
                      }}
                    />

                    <FileUploadWithProgress
                      title="Preview Image"
                      description="Recommended: 800x600px, Max: 10MB"
                      accept="image/*"
                      maxSize={10}
                      bucketName="Template Files"
                      folder="previews"
                      onFileUpload={(url) => {
                        form.setValue('preview_image_url', url);
                      }}
                    />

                    {/* Watermark Option */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Watermark Options
                      </h4>
                      <FileUploadWithProgress
                        title="Watermarked Preview (Optional)"
                        description="Upload a watermarked version to prevent theft"
                        accept="image/*"
                        maxSize={10}
                        bucketName="Template Files"
                        folder="watermarked-previews"
                        onFileUpload={(url) => {
                          form.setValue('watermarked_preview_url', url);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Pricing (NGN) */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Pricing & License (Nigerian Naira Only)
                    </CardTitle>
                    <CardDescription>
                      International payments coming soon!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="is_free"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Free Template</FormLabel>
                            <FormDescription>
                              Make this template available for free
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!form.watch('is_free') && (
                      <>
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (NGN) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="5000"
                                  step="100"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                Set your price in Nigerian Naira (NGN)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Discount Options */}
                        <div className="space-y-4 border rounded-lg p-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Discount Options (Optional)
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="discount_price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Discount Price (NGN)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="3000"
                                      step="100"
                                      min="0"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="discount_end_date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Discount End Date</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="datetime-local"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="license_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select license type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="personal">Personal Use Only</SelectItem>
                              <SelectItem value="commercial">Commercial Use</SelectItem>
                              <SelectItem value="both">Personal & Commercial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 5: Post-Purchase Questions */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Post-Purchase Customer Questions
                    </CardTitle>
                    <CardDescription>
                      Ask buyers questions after they purchase to gather feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter a question for buyers..."
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                      />
                      <Button type="button" onClick={addPostPurchaseQuestion} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {form.watch('post_purchase_questions').map((question, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">{question.question}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <FormDescription>
                      These questions will be sent to buyers after successful purchase. 
                      Responses will appear in your feedback dashboard.
                    </FormDescription>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 6: Marketing & CTAs */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Marketing & Call-to-Action Buttons
                    </CardTitle>
                    <CardDescription>
                      Add custom buttons to promote your other work
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Button text (e.g., 'Visit My Portfolio')"
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Button URL"
                          value={ctaUrl}
                          onChange={(e) => setCtaUrl(e.target.value)}
                        />
                        <Button type="button" onClick={addCtaButton} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {form.watch('cta_buttons').map((button, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="text-sm font-medium">{button.text}</span>
                            <p className="text-xs text-muted-foreground">{button.url}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCtaButton(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="demo_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Demo URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://demo.example.com" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instructions_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://instructions.example.com" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 7: Review */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Review & Create Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Name</p>
                        <p className="text-sm text-muted-foreground">{form.watch('name')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pricing</p>
                        <p className="text-sm text-muted-foreground">
                          {form.watch('is_free') 
                            ? 'Free' 
                            : `₦${form.watch('price')}${form.watch('discount_price') ? ` (Discounted: ₦${form.watch('discount_price')})` : ''}`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 flex-wrap">
                      <Badge variant={form.watch('file_url') ? 'default' : 'secondary'}>
                        {form.watch('file_url') ? 'Template file uploaded' : 'No template file'}
                      </Badge>
                      <Badge variant={form.watch('preview_image_url') ? 'default' : 'secondary'}>
                        {form.watch('preview_image_url') ? 'Preview image uploaded' : 'No preview image'}
                      </Badge>
                      <Badge variant="outline">
                        {form.watch('post_purchase_questions').length} Questions
                      </Badge>
                      <Badge variant="outline">
                        {form.watch('cta_buttons').length} CTA Buttons
                      </Badge>
                    </div>

                    {form.watch('preview_image_url') && (
                      <div>
                        <p className="text-sm font-medium mb-2">Preview</p>
                        <img 
                          src={form.watch('preview_image_url')} 
                          alt="Template preview" 
                          className="w-48 h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 7 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {createMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating Template...
                    </>
                  ) : (
                    'Create Template'
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}