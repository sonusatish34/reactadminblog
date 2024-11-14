import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import AdminLayout from '../../layouts/AdminLayout';
import { Timestamp, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import Vio from "../../Admin/Vio/TextEditor";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import axios from 'axios'; // for handling image upload
import { fireDb } from '../../firebase';

export default function AddPost() {
  const [catgs, setCatgs] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [postauthor, setPostauthor] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    coverimages: '',
    altText: '',  // for cover image alt text
    blogfor: '',
    categoryname: '',
    slug: ''
  });
  const [editorData, setEditorData] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const quillRef = useRef(null); // ReactQuill ref
  const [editorHtml, setEditorHtml] = useState('');
  const [imageAltText, setImageAltText] = useState(''); // Store alt text for editor images

  useEffect(() => {
    const fetchCatgs = async () => {
      const querySnapshot = await getDocs(collection(fireDb, "categories"));
      const catgs1 = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCatgs(catgs1);
    };
    fetchCatgs();
  }, []);

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    const formData = new FormData();
    formData.append('coverimages', file);
    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const convimg = response?.data?.fileUrl.replace('https://ldcars.blr1.', 'https://ldcars.blr1.cdn.');
      setUploadedImageUrl(convimg);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleChange = (e) => {
    
    const { name, value } = e.target;
    // setFormData({ ...formData, [name]: value });
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
    
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPost = {
      title: formData.title,
      description: formData.description,
      slug: formData.slug,
      content: editorHtml,
      coverimages: uploadedImageUrl,
      blogfor: formData.blogfor,
      categoryname: formData.categoryname,
      createdAt: new Date().toISOString(),
      altText: formData.altText, // Save alt text for the cover image
    };

    try {
      const blogRef = collection(fireDb, "blogPost");
      await addDoc(blogRef, { ...newPost, time: Timestamp.now(), postauthor, date: new Date().toLocaleString() });
      Swal.fire({ icon: 'success', title: 'Post Created', text: 'Your post has been created successfully!' });

      setFormData({
        title: '',
        description: '',
        content: '',
        coverimages: '',
        altText: '', // Clear alt text after submit
        blogfor: '',
        categoryname: '',
        slug: ''
      });
      setEditorHtml(''); // Clear editor content
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'There was an issue creating the post. Please try again.' });
    }
  };

  // Handle image insert with alt text in Quill editor
  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }, { 'size': ['small', 'normal', 'large', 'huge'] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean'],
      [{ 'color': [] }],
      [{ 'background': [] }],
    ],
  };

  const formats = ['header', 'font', 'size', 'list', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'link', 'image', 'align', 'color', 'background'];

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.getModule('toolbar').addHandler('image', () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
          if (!input.files || !input.files[0]) return;
          const file = input.files[0];

          // Ask for alt text before inserting the image
          const altText = prompt("Please enter alt text for the image:");
          if (altText) setImageAltText(altText); // Store alt text

          // Create FormData to send the image
          const formData = new FormData();
          formData.append('image', file);

          // Upload the image and insert the URL into Quill
          axios.post('http://localhost:5000/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            .then(response => {
              const imageUrl = response.data.fileUrl;
              const editor = quillRef.current.getEditor();
              const range = editor.getSelection(true);
              editor.insertEmbed(range.index, 'image', imageUrl);

              // Insert alt text as an attribute
              const imageElement = editor.container.querySelector('img');
              if (imageElement) {
                imageElement.setAttribute('alt', altText);
              }
            })
            .catch(error => {
              console.error('Image upload failed:', error);
            });
        };
      });
    }
  }, [quillRef]);

  return (
    <AdminLayout>
      <div style={{ width: '900px' }} className="shadow-md flex-row px-1 mt-5 items-center pt-2 pb-2 mb-2 justify-center rounded-lg ml-10 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center hover:text-indigo-500">Add New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full p-1">
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
          </div>
          <div className="flex flex-col">
            <label htmlFor="slug" className="text-lg">Slug</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="optional"
              className="border rounded-lg p-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="content" className="text-lg">Content</label>
            <div>
              <ReactQuill
                value={editorHtml}
                onChange={setEditorHtml}
                modules={modules}
                formats={formats}
                ref={quillRef}
                placeholder="Write your content here..."
              />
            </div>
          </div>
          <div className="flex flex-col pt-4">
            <label htmlFor="coverimages" className="text-lg">Cover Image</label>
            <input
              type="file"
              id="coverimages"
              name="coverimages"
              accept="image/*"
              onChange={handleImageUpload}
              className="border rounded-lg p-2"
            />
            <input
              type="text"
              id="altText"
              name="altText"
              value={formData.altText}
              onChange={handleChange}
              placeholder="Enter alt text for cover image"
              className="border rounded-lg p-2 mt-2"
            />
            <img
              src={uploadedImageUrl}
              alt={formData.altText || 'Cover Preview'}
              className="w-32 h-32 object-cover rounded mt-2"
            />
          </div>
          <div className="flex flex-col pt-4">
            <label htmlFor="blogfor" className="text-lg">Blog For</label>
            <select
              id="blogfor"
              name="blogfor"
              value={formData.blogfor}
              onChange={handleChange}
              className="border rounded-lg p-2"
            >
              <option value="Dozzy">Dozzy</option>
              <option value="LDC">LDC</option>
              <option value="SDC">SDC</option>
            </select>
          </div>
          <div className="flex flex-col pt-4">
            <label htmlFor="categoryname" className="text-lg">Category Name</label>
            <input
              type="text"
              id="categoryname"
              name="categoryname"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              required
              className="border rounded-lg p-2"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
