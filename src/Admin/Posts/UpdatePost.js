import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { doc, updateDoc } from "firebase/firestore";
import { getDoc, collection, getDocs } from "firebase/firestore";
import axios from "axios"; // for handling image upload
import { fireDb } from "../../firebase"; // Import Firebase DB
import AdminLayout from "../../layouts/AdminLayout";
import EditPostEditor from "./EditPostEditor";
function UpdatePost() {
  const { id } = useParams(); // Get the post ID from the route
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: "",
    description: "",
    content: "",
    coverimages: "",
    blogfor: "",
    categoryname: "",
    slug: "",
    cialt: "", // Alt text for the cover image
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState(""); // For storing new uploaded image URL
  const [catgs, setCatgs] = useState([]); // Categories
  const [subcatgs, setsubCatgs] = useState([]); // Categories
  const [error, setError] = useState(null);
  console.log(post, "posysys");

  // Fetch post data
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postDocRef = doc(fireDb, "blogPost", id);
        const postSnap = await getDoc(postDocRef);

        if (postSnap.exists()) {
          setPost(postSnap.data());
        } else {
          setError("Post not found.");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("An error occurred while fetching the post.");
      }
    };

    fetchPostData();
  }, [id]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryRef = collection(fireDb, `${post.blogfor == 'Dozzy' ? 'catgfordozzy' : 'catgforldc'}`);
        const querySnapshot = await getDocs(categoryRef);
        const categories = querySnapshot.docs.map((doc) => doc.data());
        setCatgs(categories);
        const subcategoryRef = collection(fireDb, 'catgfortrip');
        const subquerySnapshot = await getDocs(subcategoryRef);
        const subcategories = subquerySnapshot.docs.map((doc) => doc.data());
        setsubCatgs(subcategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, [post.blogfor]);

  console.log(subcatgs, 'subb');



  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setPost((prevPost) => ({ ...prevPost, [name]: value }));
  // };
  const [selectedSubcat, setSelectedSubcat] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "categoryname") {
      // Handle multi-selection for categories
      const selectedCategories = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setPost((prevFormData) => ({
        ...prevFormData,
        categoryname: selectedCategories,
      }));
    }
    else if (name === "subcategoryname") {
      const selectedSubcategories = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setSelectedSubcat(selectedSubcategories); // store in new state
    }

    else if (name === "slug") {
      // Handle multi-selection for categories

      setPost((prevFormData) => ({
        ...prevFormData,
        slug: value.replaceAll(" ", "-").toLowerCase().replace(/[;,]/g, ''),
      }));
    }
    else {
      setPost((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
  console.log(post, "0000000000009");

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("coverimages", file);

    try {
      const response = await fetch("https://reactadminblog.vercel.app/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setUploadedImageUrl(data?.imageUrl || "");
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };


  const handleImageAltUpdate = async (imgElement) => {
    try {
      const { value: newAltText } = await Swal.fire({
        title: "Update Alt Text",
        input: "text",
        inputLabel: "Enter new alt text for the image",
        inputValue: imgElement.alt || "",
        showCancelButton: true,
        confirmButtonText: "Update",
        cancelButtonText: "Cancel",
      });

      if (newAltText) {
        imgElement.alt = newAltText; // Update the alt attribute in the DOM
        Swal.fire("Alt Text Updated", "The alt text has been successfully updated.", "success");
      }
    } catch (error) {
      console.error("Error updating alt text:", error);
      Swal.fire("Error", "An error occurred while updating the alt text.", "error");
    }
  };


  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' },], // Adding custom font sizes
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote',],
      ['link', 'image'], // Add the image button in the toolbar
      ['clean'] // Add a clean button to clear the content
      [{ 'color': [] }], // Color dropdown
      [{ 'background': [] }], // Background color dropdown
      [{ 'align': 'center' }, { 'align': 'right' }, { 'align': 'left' }],

    ],
  };

  const formats = [
    'header', 'list', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'link', 'image', 'align', 'color', 'background'
  ];



  useEffect(() => {
    if (post?.subcat?.length > 0) {
      setSelectedSubcat(post.subcat);
    }
  }, [post]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const postDocRef = doc(fireDb, "blogPost", id);
      await updateDoc(postDocRef, {
        ...post,
        coverimages: uploadedImageUrl || post.coverimages,
        updatedAt: new Date().toISOString(),
        ...(selectedSubcat.length > 0 && { subcat: selectedSubcat }), // ✅ only add if selected
      });


      Swal.fire("Post Updated", "The post has been successfully updated.", "success");
      navigate("/Admin/Posts");
    } catch (err) {
      console.error("Error updating post:", err);
      Swal.fire("Error", "Failed to update the post. Please try again.", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition duration-200 shadow-sm"
        >
          <span>&larr;</span>
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold mb-4">Update Post</h1>
        <button
          onClick={() =>
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
          }
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition duration-200 shadow-sm"
        >
          ↓ Scroll to Bottom
        </button>
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="my-4">
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

          <div className="mb-4 ">
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
          <div>
            <p className="text-sm text-blue-600">
              slug = ({post.slug.replaceAll(" ", "-").toLowerCase().replace(/[;:,$%]/g, '')})
            </p>
          </div>

          <div className="mb-4 pb-6">
            <label htmlFor="content" className="block text-gray-700">Content</label>
            <EditPostEditor
              existingContent={post.content}
              onContentChange={(updatedContent) =>
                setPost((prev) => ({ ...prev, content: updatedContent }))
              }
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
                src={uploadedImageUrl ? uploadedImageUrl : post.coverimages} // Use the new image URL if uploaded
                alt="Cover Preview"
                className="w-32 h-32 object-cover rounded"
              />
              {console.log(uploadedImageUrl, "uploadedImageUrl")
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
              className="w-full p-2 border border-gray-300 rounded">
              <option value="none">select from below</option>
              <option value="LDC">LDC</option>
              <option value="Dozzy">Dozzy Hyderabad</option>
              <option value="DozzyBng">Dozzy Bangalore</option>
            </select>
          </div>
          <div className="flex gap-x-10">
            <div className="flex flex-col items gap-4 mb-6">
              <p className="flex gap-7">
                <label htmlFor="categoryname" className="text-lg pb-5">
                  Category Name Selected :
                </label>
              </p>
              <label htmlFor="categoryname" className="text-lg font-semibold text-gray-700">Categories<span className="flex gap-4">
                {post?.categoryname?.length &&
                  post?.categoryname?.map((catn, index) => {
                    return (
                      <span key={index} className="text-blue-400">
                        {catn}
                      </span>
                    );
                  })}
              </span>{" "}</label>
              <select
                id="categoryname"
                name="categoryname"
                multiple
                value={post.categoryname}
                onChange={handleInputChange}
                className="border-2 border-gray-300 rounded-lg p-3 w-64 h-40 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none shadow-md"
              >
                {catgs.length ? (
                  catgs.map((item, index) => (
                    <option
                      className="text-black p-2 border-b-2 border-gray-200 hover:bg-blue-100 hover:text-blue-600 transition duration-150"
                      key={index}
                      value={item.name}
                    >
                      {item.name}
                    </option>
                  ))
                ) : (
                  <option className="text-red-500">
                    please select blogfor
                  </option>
                )}
              </select>
            </div>
            <div className="flex flex-col items gap-4 mb-6">
              <label htmlFor="subcategoryname" className="text-base font-semibold text-gray-700">
                Sub Categories
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSubcat.length > 0 ? (
                    selectedSubcat.map((catn, index) => (
                      <span key={index} className="text-blue-400 bg-blue-100 px-2 py-1 rounded">
                        {catn}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No subcategories selected</span>
                  )}
                </div>
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-4 rounded-md shadow-sm bg-white">
                {subcatgs.length ? (
                  subcatgs.map((item, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={item.name}
                        checked={selectedSubcat.includes(item.name)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedSubcat((prev) =>
                            e.target.checked
                              ? [...prev, value]
                              : prev.filter((v) => v !== value)
                          );
                        }}
                        className="form-checkbox text-blue-500"
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-red-500">please select blogfor</p>
                )}
              </div>
            </div>

          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Post
          </button>
        </form>
      </div>
      <button
        onClick={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition duration-200 shadow-sm"
      >
        ↑ Go to Top
      </button>
    </AdminLayout>
  );
}

export default UpdatePost;
