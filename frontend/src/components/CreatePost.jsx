import { useRef, useState } from "react";
import { useSocialStore } from "../store/useSocialStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, X } from "lucide-react";
import toast from "react-hot-toast";

const CreatePost = () => {
  const { authUser } = useAuthStore();
  const { createPost, isCreatingPost } = useSocialStore();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) {
      toast.error("Add some text or an image");
      return;
    }
    await createPost({ text: text.trim(), image: imagePreview });
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-base-100 rounded-xl shadow border border-base-300 w-full max-w-xl mx-auto p-4">
      <div className="flex gap-3 items-start">
        <img
          src={authUser?.profilePic || "/avatar.png"}
          alt="profile"
          className="size-10 rounded-full object-cover border border-base-300 flex-shrink-0"
        />
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            rows={2}
            className="textarea textarea-bordered w-full resize-none text-sm"
          />

          {imagePreview && (
            <div className="relative w-full">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full max-h-60 object-cover rounded-lg border border-base-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1.5 right-1.5 btn btn-circle btn-xs bg-base-300"
              >
                <X className="size-3" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost btn-sm gap-1.5 text-base-content/60"
            >
              <Image className="size-4" />
              <span className="text-xs">Photo</span>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="submit"
              disabled={isCreatingPost || (!text.trim() && !imagePreview)}
              className="btn btn-primary btn-sm"
            >
              {isCreatingPost ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
