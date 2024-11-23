import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { doc, updateDoc } from "firebase/firestore";
import { getDoc } from 'firebase/firestore';
import ReactQuill from 'react-quill'; // Import ReactQuill for rich text editor
import { fireDb } from "../../firebase"; // Import Firebase DB

function UpdatePost() {
  const { id } = useParams(); // Get the post ID from the URL params
  const navigate = useNavigate();

  const [post, setPost] = useState({
    title: "",
    description: "",
    content: "",
    coverimages: "",
    blogfor: "",
    categoryname: "",
    slug: "",
    cialt: "",
  });
  const [catgs, setCatgs] = useState([]); // To fetch categories
  const [uploadedImageUrl, setUploadedImageUrl] = useState(""); // For storing uploaded image URL
  const [error, setError] = useState(null);

  // Load the post data from Firebase when the component mounts
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postDocRef = doc(fireDb, "blogPost", id); // Get the reference to the post using the ID
        const postSnap = await getDoc(postDocRef);

        if (postSnap.exists()) {
          setPost(postSnap.data()); // Set the post data into state
        } else {
          setError("Post not found");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("An error occurred while fetching the post.");
      }
    };

    fetchPostData();
  }, [id]);

  // Fetch categories for selection dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      const categoryRef = fireDb.collection("categories");
      const categorySnapshot = await categoryRef.get();
      const categories = categorySnapshot.docs.map(doc => doc.data());
      setCatgs(categories);
    };

    fetchCategories();
  }, []);

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost((prevPost) => ({ ...prevPost, [name]: value }));
  };

  // Handle content changes for rich text editor
  const handleEditorChange = (value) => {
    setPost((prevPost) => ({ ...prevPost, content: value }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    // Assuming you upload the image to your storage (e.g., Firebase Storage) and get the URL
    // After uploading, set the URL to state
    const imageUrl = URL.createObjectURL(file); // This is just a placeholder; replace with your image upload logic.
    setUploadedImageUrl(imageUrl);
    setPost((prevPost) => ({ ...prevPost, coverimages: imageUrl }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const postDocRef = doc(fireDb, "blogPost", id); // Get the reference to the post using the ID
      await updateDoc(postDocRef, {
        title: post.title,
        description: post.description,
        content: post.content,
        coverimages: post.coverimages,
        blogfor: post.blogfor,
        categoryname: post.categoryname,
        slug: post.slug,
        cialt: post.cialt,
        updatedAt: new Date().toISOString(),
      });

      Swal.fire("Post Updated", "The post has been updated successfully.", "success");
      navigate("/Admin/Posts"); // Navigate back to the posts list
    } catch (error) {
      console.error("Error updating post:", error);
      Swal.fire("Error", "There was an error updating the post.", "error");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Update Post</h1>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={post.title}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700">Meta Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={post.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        {/* Slug */}
        <div className="mb-4">
          <label htmlFor="slug" className="block text-gray-700">Slug</label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={post.slug}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Optional"
          />
        </div>

        {/* Content (Rich Text Editor) */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700">Content</label>
          <ReactQuill
            value={post.content}
            onChange={handleEditorChange}
            placeholder="Write your content here..."
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Cover Image Upload */}
        <div className="mb-4">
          <label htmlFor="coverimages" className="block text-gray-700">Cover Image</label>
          <input
            type="file"
            id="coverimages"
            name="coverimages"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {uploadedImageUrl && <img src={uploadedImageUrl} alt="Cover Preview" className="w-32 h-32 object-cover mt-2" />}
        </div>

        {/* Image Alt Text */}
        <div className="mb-4">
          <label htmlFor="cialt" className="block text-gray-700">Cover Image Alt Text</label>
          <input
            type="text"
            id="cialt"
            name="cialt"
            value={post.cialt}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Blog For Dropdown */}
        <div className="mb-4">
          <label htmlFor="blogfor" className="block text-gray-700">Blog For</label>
          <select
            id="blogfor"
            name="blogfor"
            value={post.blogfor}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="Dozzy">Dozzy</option>
            <option value="LDC">LDC</option>
            <option value="SDC">SDC</option>
          </select>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label htmlFor="categoryname" className="block text-gray-700">Category</label>
          <input
            type="text"
            id="categoryname"
            name="categoryname"
            value={post.categoryname}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Optional"
          />
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="mb-4 flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Post
          </button>
          <button
            type="button"
            onClick={() => navigate("/Admin/Posts")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdatePost;
