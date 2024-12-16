import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios'; // for handling image upload
import AdminLayout from '../../layouts/AdminLayout';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { fireDb } from '../../firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles

export default function AddPost() {
  const [catgs, setCatgs] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [postauthor, setPostauthor] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    coverimages: '',  // This will store the base64 image string
    blogfor: '',
    categoryname: [],
    slug: ''
  });
  const [editorHtml, setEditorHtml] = useState('');

  const quillRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categoryname') {
      // Handle multi-selection for categories
      const selectedCategories = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prevFormData => ({
        ...prevFormData,
        categoryname: selectedCategories
      }));
    } else {
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (file) => {
    // Create FormData object to send the file as multipart/form-data
    const formData1 = new FormData();
    formData1.append('coverimages', file);
    formData1.append('blogfor', formData.blogfor);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData1, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedImageUrl(response?.data?.imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload the image only when submitting the form
    if (selectedFile) {
      await handleImageUpload(selectedFile);
    }

    const newPost = {
      title: formData.title,
      description: formData.description,
      slug: formData.slug.replaceAll(' ', '-').toLowerCase(),
      content: editorHtml,
      coverimages: uploadedImageUrl,
      blogfor: formData.blogfor,
      categoryname: formData.categoryname,
      createdAt: new Date().toISOString(),
      timetake: calculateReadTime(editorHtml),
      blog_state: 'in-progress'
    };

    try {
      setLoading(true);
      const blogRef = collection(fireDb, "blogPost");
      await addDoc(blogRef, {
        ...newPost,
        time: Timestamp.now(),
        postauthor: postauthor,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      });

      Swal.fire({
        icon: 'success',
        title: 'Post Created',
        html: `Title: ${formData.title}`,
      });

      setFormData({
        id: '',
        title: '',
        description: '',
        coverimages: '',
        blogfor: '',
        categoryname: [],
        cialt: '',
        slug: ''
      });
      setEditorHtml('');
      setLoading(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an issue creating the post. Please try again.',
      });
    }
  };

  const calculateReadTime = (text) => {
    const words = text.split(/\s+/).filter((word) => word.length > 0); // Split by spaces
    const wordCount = words.length;

    const wordsPerMinute = 183;
    if (wordCount === 0) return 0;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleClear = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      content: '',
      coverimages: '',  // This will store the base64 image string
      blogfor: '',
      categoryname: [],
      description: '',
      slug: ''
    });
    setEditorHtml('');
  };

  return (
    <AdminLayout>
      <div style={{ width: '900px' }} className="shadow-md flex-row px-1 mt-5 items-center pt-2 pb-2 mb-2 justify-center rounded-lg ml-10 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center hover:text-indigo-500">Add New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full p-1">
          <div className="flex flex-col pt-4">
            <label htmlFor="blogfor" className="text-lg">Blog For</label>
            <select
              id="blogfor"
              name="blogfor"
              value={formData.blogfor}
              onChange={handleChange}
              className="border rounded-lg p-2"
            >
              <option value="none">select from below</option>
              <option value="LDC">LDC</option>
              <option value="Dozzy">Dozzy</option>
            </select>
          </div>
          <div className="flex flex-col pt-4">
            <label htmlFor="categoryname" className="text-lg">Category Name Selected :</label>
            <div className="flex items-center gap-4">
              <select
                id="categoryname"
                name="categoryname"
                multiple
                value={formData.categoryname}
                onChange={handleChange}
                className="border-2 border-gray-300 rounded-lg p-3 w-64 h-40 bg-white text-gray-800 focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none shadow-md"
              >
                {catgs.length ? catgs.map((item, index) => (
                  <option
                    className="text-black p-2 border-b-2 border-gray-200 hover:bg-blue-100 hover:text-blue-600 transition duration-150"
                    key={index}
                    value={item.name}
                  >
                    {item.name}
                  </option>
                )) : null}
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="title" className="text-lg">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="border rounded-lg p-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="slug" className="text-lg">Slug</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="border rounded-lg p-2"
            />
          </div>
          <div>
            <p className="text-sm text-blue-600">Slug: {formData.slug.replaceAll(' ', '-').toLowerCase()}</p>
          </div>
          <div className="flex flex-col">
            <label htmlFor="description" className="text-lg">Meta Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="border rounded-lg p-2"
            />
            <p className="pt-3">Character Count: {formData.description.replace(/\s+/g, '').length}</p>
          </div>
          <div className="flex gap-4 pt-4">
            <div className="flex flex-col">
              <label htmlFor="coverimages" className="text-lg">Cover Image</label>
              <input
                type="file"
                id="coverimages"
                name="coverimages"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="border rounded-lg p-2"
              />
              {selectedFile && (
                <img
                  src={URL.createObjectURL(selectedFile)} // Temporary preview of the selected file
                  alt="Cover Preview"
                  className="w-32 h-32 object-cover rounded"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="content" className="text-lg">Content</label>
            <ReactQuill
              value={editorHtml}
              onChange={setEditorHtml}
              className="h-80"
              placeholder="Write your content here..."
            />
          </div>
          <p className="text-end pr-4">{calculateReadTime(editorHtml)} min read</p>
          <button
            type="submit"
            className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-indigo-500 text-white py-2 px-4 rounded-lg ml-3 hover:bg-indigo-600 transition duration-300"
          >
            Clear
          </button>
          {loading && <div className="pl-7"><p className="text-blue-500 capitalize text-xl bg-blue-50 p-2 rounded-md">Uploading please wait...</p></div>}
        </form>
      </div>
    </AdminLayout>
  );
}
