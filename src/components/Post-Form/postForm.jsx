import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, RTE } from "../index";
import service from "../../Appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PostForm({ post }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      status: post?.status || "active",
    },
  });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  // slug transformation logic
  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // remove all special chars except spaces
        .replace(/\s+/g, "-"); // replace spaces (including multiple) with hyphen
    }
    return "";
  }, []);

  // Optional: auto-generate slug from title, but only if slug is empty or untouched:
  useEffect(() => {
    const subscription = watch((value, name) => {
      if (name === "title") {
        const currentSlug = getValues("slug");
        // Only auto-update slug if user hasn't manually typed one:
        // e.g., if slug is empty or matches a previous auto-generated value.
        // Simplest: if slug is empty:
        if (!currentSlug) {
          const auto = slugTransform(value.title || "");
          setValue("slug", auto, { shouldValidate: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue, getValues]);

  // Validation pattern: allow lowercase letters, numbers, hyphens, no leading/trailing hyphen,
  // and no consecutive hyphens. Adjust as needed.
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  const submit = async (data) => {
    // Before sending, transform slug:
    const finalSlug = slugTransform(data.slug);
    // Check if finalSlug is valid; if not, you could set an error manually or just return.
    if (!slugPattern.test(finalSlug)) {
      // For example, you can alert or set a form error:
      // But react-hook-form: we can’t easily set errors here synchronously; better rely on validation.
      // For now:
      alert("Slug is invalid after transformation.");
      return;
    }
    // Replace data.slug with transformed slug
    data.slug = finalSlug;

    console.log("Submitting data:", data);

    if (post) {
      const file = data.image?.[0] ? service.uploadFile(data.image[0]) : null;

      if (file) {
        service.deleteFile(post.featuredImage);
      }

      const dbPost = await service.updatePost(post.$id, {
        ...data,
        featuredImage: file ? (await file).$id : undefined,
      });

      if (dbPost) {
        navigate(`/post/${post.$id}`);
      }
    } else {
      const file = await service.uploadFile(data.image[0]);
      if (file) {
        data.featuredImage = file.$id;
        const dbPost = await service.createPost({
          ...data,
          userId: userData.$id,
        });
        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}

        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", {
            required: "Slug is required",
            validate: (val) => {
              const t = slugTransform(val);
              if (!t) return "Slug cannot be empty after trimming";
              if (!slugPattern.test(t))
                return "Slug must be lowercase alphanumeric words separated by single hyphens";
              return true;
            },
          })}
        />
        {errors.slug && (
          <p className="text-red-500 text-sm">{errors.slug.message}</p>
        )}

        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post && (
          <div className="w-full mb-4">
            <img
              src={service.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: "Status is required" })}
        />
        {errors.status && (
          <p className="text-red-500 text-sm">{errors.status.message}</p>
        )}
        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default PostForm;
