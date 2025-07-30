
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronLeft, ChevronRight, Upload, FileText, DollarSign, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().min(1, "Category is required"),
  file_url: z.string().optional(),
  preview_image_url: z.string().optional(),
  is_free: z.boolean().default(true),
  price: z.number().min(0).optional(),
  tags: z.array(z.string()).default([]),
  license_type: z.enum(['personal', 'commercial', 'both']).default('personal'),
  demo_url: z.string().url().optional().or(z.literal('')),
  instructions_url: z.string().url().optional().or(z.literal('')),
  file_size: z.number().optional(),
  file_type: z.string().optional(),
  max_file_size_mb: z.number().default(50),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTemplateDialog({ open, onOpenChange, onSuccess }: CreateTemplateDialogProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState('');

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
      tags: [],
      license_type: 'personal' as const,
      demo_url: "",
      instructions_url: "",
      max_file_size_mb: 50,
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
        is_free: data.is_free,
        price: data.price,
        published: false,
        tags: data.tags,
        license_type: data.license_type,
        demo_url: data.demo_url || null,
        instructions_url: data.instructions_url || null,
        file_size: data.file_size,
        file_type: data.file_type,
        max_file_size_mb: data.max_file_size_mb,
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

  const handleFileUpload = async (file: File, type: 'template' | 'image') => {
    const isImage = type === 'image';
    const setter = isImage ? setUploadingImage : setUploadingFile;
    
    // File size validation
    const maxSizeBytes = isImage ? 10 * 1024 * 1024 : form.watch('max_file_size_mb') * 1024 * 1024; // 10MB for images, variable for templates
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `File size must be less than ${isImage ? '10MB' : form.watch('max_file_size_mb') + 'MB'}`,
        variant: "destructive",
      });
      return;
    }

    // File type validation for templates
    if (!isImage) {
      const allowedTypes = [
        'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv',
        'application/x-photoshop', 'application/postscript', 'application/x-indesign',
        'application/zip', 'text/plain', 'video/mp4', 'application/octet-stream'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(zip|rar|psd|ai|sketch|figma|indd|docx|xlsx|pdf|csv|txt|mp4)$/i)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a supported file format (PDF, DOCX, XLSX, PSD, AI, ZIP, etc.)",
          variant: "destructive",
        });
        return;
      }
    }
    
    setter(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = isImage ? `template-previews/${fileName}` : `templates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(isImage ? 'Template Files' : 'Template Files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(isImage ? 'Template Files' : 'Template Files')
        .getPublicUrl(filePath);

      if (isImage) {
        form.setValue('preview_image_url', publicUrl);
      } else {
        form.setValue('file_url', publicUrl);
        form.setValue('file_size', file.size);
        form.setValue('file_type', file.type);
      }

      toast({
        title: "Success",
        description: `${isImage ? 'Preview image' : 'Template file'} uploaded successfully!`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${isImage ? 'image' : 'file'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setter(false);
    }
  };

  const onSubmit = (data: TemplateFormData) => {
    createMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
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

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText },
    { number: 2, title: "Files", icon: Upload },
    { number: 3, title: "Pricing & License", icon: DollarSign },
    { number: 4, title: "Additional Info", icon: FileText },
    { number: 5, title: "Review", icon: Eye },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Follow the steps to create and publish your template
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.number ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
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
                    <CardDescription>
                      Provide the basic details about your template
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter template name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what your template includes and its use cases"
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a detailed description to help users understand your template
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormDescription>
                        Choose the most relevant category for your template
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags Input */}
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
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.watch('tags').map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Add relevant tags to help users find your template
                  </FormDescription>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: File Upload */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Template Files
                </CardTitle>
                <CardDescription>
                  Upload your template file and preview image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <FormLabel>Template File</FormLabel>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      type="file"
                      id="template-file"
                      className="hidden"
                      accept=".zip,.rar,.pdf,.docx,.xlsx,.psd,.ai,.sketch,.figma,.indd,.csv,.txt,.mp4"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'template');
                      }}
                    />
                    <label
                      htmlFor="template-file"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      {uploadingFile ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      )}
                      <p className="text-sm text-muted-foreground text-center">
                        {form.watch('file_url') 
                          ? "File uploaded successfully! Click to replace"
                          : "Click to upload template file"
                        }
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Supported: PDF, DOCX, XLSX, PSD, AI, ZIP, Sketch, Figma, etc.
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Max size: {form.watch('max_file_size_mb')}MB
                      </p>
                    </label>
                    {form.watch('file_url') && (
                      <Badge variant="outline" className="mt-2">
                        File uploaded
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Preview Image</FormLabel>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      type="file"
                      id="preview-image"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'image');
                      }}
                    />
                    <label
                      htmlFor="preview-image"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      {uploadingImage ? (
                        <LoadingSpinner size="sm" />
                      ) : form.watch('preview_image_url') ? (
                        <img 
                          src={form.watch('preview_image_url')} 
                          alt="Preview" 
                          className="w-32 h-20 object-cover rounded mb-2"
                        />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      )}
                      <p className="text-sm text-muted-foreground text-center">
                        {form.watch('preview_image_url') 
                          ? "Click to replace preview image"
                          : "Click to upload preview image"
                        }
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Recommended: 800x600px, Max: 10MB
                      </p>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Pricing & License */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & License
                </CardTitle>
                <CardDescription>
                  Set your template pricing and licensing options
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
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Set the price for your template in USD
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="license_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Type</FormLabel>
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
                      <FormDescription>
                        Define how users can use your template
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Additional Info */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </CardTitle>
                <CardDescription>
                  Optional links and information for your template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="demo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Demo URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/demo"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Link to a live demo of your template
                      </FormDescription>
                      <FormMessage />
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
                        <Input 
                          placeholder="https://example.com/instructions"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Link to setup instructions or documentation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_file_size_mb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max File Size (MB)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum file size allowed for this template (1-100 MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Review & Create
                    </CardTitle>
                    <CardDescription>
                      Review your template details before creating
                    </CardDescription>
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
                          {form.watch('is_free') ? 'Free' : `$${form.watch('price')}`}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{form.watch('description')}</p>
                    </div>

                    <div className="flex gap-4">
                      <Badge variant={form.watch('file_url') ? 'default' : 'secondary'}>
                        {form.watch('file_url') ? 'Template file uploaded' : 'No template file'}
                      </Badge>
                      <Badge variant={form.watch('preview_image_url') ? 'default' : 'secondary'}>
                        {form.watch('preview_image_url') ? 'Preview image uploaded' : 'No preview image'}
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

              {currentStep < 5 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
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
