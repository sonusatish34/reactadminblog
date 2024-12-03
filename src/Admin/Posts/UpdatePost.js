import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { doc, updateDoc } from "firebase/firestore";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { getDoc, collection, getDocs } from "firebase/firestore";
import axios from "axios"; // for handling image upload
import { fireDb } from "../../firebase"; // Import Firebase DB
import AdminLayout from "../../layouts/AdminLayout";

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
    cialt: "", // Alt text for the image
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [catgs, setCatgs] = useState([]); // To fetch categories
  const [error, setError] = useState(null);
  const navigate1 = useNavigate()
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
      const categoryRef = collection(fireDb, "categories");
      const querySnapshot = await getDocs(categoryRef);
      const categories = querySnapshot.docs.map(doc => doc.data());
      setCatgs(categories);
    };

    fetchCategories();
  }, []);

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost((prevPost) => ({ ...prevPost, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    const formData = new FormData();
    formData.append("coverimages", file);

    try {
      const response = await fetch('https://reactadminblog.vercel.app/api/upload', {
      // const response = await fetch('https://seoblog.longdrivecars.com/api/upload', {
        
      // const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const convimg = response?.data?.imageUrl;
      console.log(response,"resp");
      
      setUploadedImageUrl(convimg); // Update image URL with the response URL
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Handle Quill editor change
  const handleQuillChange = (value) => {
    setPost((prevPost) => ({ ...prevPost, content: value }));
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
        coverimages: uploadedImageUrl?uploadedImageUrl:post.coverimages, // Ensure the new image is used if updated
        blogfor: post.blogfor,
        categoryname: post.categoryname,
        slug: post.slug,
        updatedAt: new Date().toISOString(),
        cialt: post.cialt
      });

      Swal.fire("Post Updated", "The post has been updated successfully.", "success");
      navigate("/Admin/Posts"); // Navigate back to the posts list
    } catch (error) {
      console.error("Error updating post:", error);
      Swal.fire("Error", "There was an error updating the post.", "error");
    }
  };

  return (
    <AdminLayout>

      <div className="container mx-auto p-4">
      <button
            onClick={() => navigate1(-1)}  // Navigates to the previous page
            className="bg-gray-300 p-1 rounded-md text-red-600"
          >
            &larr; Back
          </button>
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

          {/* Meta Description */}
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

          {/* Quill Editor for Content */}
          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-700">Content</label>
            <ReactQuill
              value={post.content}
              onChange={handleQuillChange}
              modules={{
                toolbar: [
                  [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{ 'align': [] }],
                  ['link', 'image'],
                  ['clean'] // to clear formatting
                ],
              }}
              className="w-full h-72 "
            />
          </div>

          {/* Cover Image */}
          <div className="flex gap-4 pt-16">
            <div className="flex flex-col">
              <label htmlFor="coverimages" className="text-lg">Cover Image</label>
              <input
                type="file"
                id="coverimages"
                name="coverimages"
                accept="image/*"
                onChange={handleImageUpload}
                className="border rounded-lg p-2"
              />
              <img
                src={uploadedImageUrl?uploadedImageUrl: post.coverimages} // Use the new image URL if uploaded
                alt="Cover Preview"
                className="w-32 h-32 object-cover rounded"
              />
              {console.log(uploadedImageUrl,"uploadedImageUrl")
              }
            </div>
            <div className="flex flex-col">
              <label htmlFor="cialt" className="text-lg">Cover Image Alt Text</label>
              <input
                type="text"
                id="cialt"
                name="cialt"
                value={post.cialt}
                onChange={handleInputChange}
                className="border rounded-lg p-2"
                required
              />
            </div>
          </div>

          {/* Blog For */}
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
            <select
              id="categoryname"
              name="categoryname"
              value={post.categoryname}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {catgs.map((catg, index) => (
                <option key={index} value={catg.name}>
                  {catg.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Update Post
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default UpdatePost;
