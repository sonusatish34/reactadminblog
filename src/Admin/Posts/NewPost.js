import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import AdminLayout from '../../layouts/AdminLayout';
import { Timestamp, addDoc, collection, setDoc, getDocs, query, where, } from 'firebase/firestore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import axios from 'axios'; // for handling image upload
import { fireDb } from '../../firebase';

export default function AddPost() {
  const [enableimg, setEnableImg] = useState(false);
  const [catgs, setCatgs] = useState('');
  const [addCatgs, setAddCatgs] = useState(false);
  const [newCategory, setNewCategory] = useState(''); // Stores the new category name



  // console.log(catgs, "--catgs--");

  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    // Check if the file is of type 'image/webp'
    if (file && file.type !== 'image/webp') {
      alert('Please upload a .webp image.');
      return; // Exit the function if the file is not a .webp image
    }

    setSelectedFile(file);

    // Create FormData object to send the file as multipart/form-data
    const formData1 = new FormData();
    formData1.append('coverimages', file);
    formData1.append('blogfor', formData.blogfor);

    try {
      const response = await axios.post('https://reactadminblog.vercel.app/api/upload', formData1, {
        // const response = await fetch('http://localhost:5000/uploadei', {

        // const response = await axios.post('http://localhost:5000/upload', formData1, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Set the uploaded image URL from the response
      console.log(response, "resp");
      setUploadedImageUrl(response?.data?.imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const [postauthor, setPostauthor] = useState('')
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    cialt: '',
    content: '',
    coverimages: '',  // This will store the base64 image string
    blogfor: '',
    categoryname: [],
    description: '',
    cialt: '',
    slug: ''
  });

  const [editorData, setEditorData] = useState('');


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
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPost = {
      title: formData.title,
      description: formData.description,
      slug: formData.slug.replaceAll(' ', '-').toLowerCase(),
      content: editorHtml,
      coverimages: uploadedImageUrl,
      blogfor: formData.blogfor,
      categoryname: formData.categoryname,
      createdAt: new Date().toISOString(),
      cialt: formData.cialt,
      timetake: calculateReadTime(editorHtml),
      blog_state: 'in-progress'
    };

    try {
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
        content: '',
        coverimages: '',
        blogfor: '',
        categoryname: '', // Ensure this is reset
        cialt: '',
        slug: ''
      });
      setEditorHtml('');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an issue creating the post. Please try again.',
      });
    }
  };



  // Handle form clear
  const handleClear = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      content: '',
      coverimages: '',  // This will store the base64 image string
      blogfor: '',
      categoryname: '',
      description: '',
      slug: ''
    });
    setEditorData('');  // Reset the CKEditor content
  };

  const [editorHtml, setEditorHtml] = useState('');
  const calculateReadTime = (text) => {
    const words = text.split(/\s+/).filter((word) => word.length > 0); // Split by spaces
    const wordCount = words.length;

    const wordsPerMinute = 183;
    if (wordCount == 0) return 0;
    return Math.ceil(wordCount / wordsPerMinute);
  };
  const quillRef = useRef(null);


  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] },
      { 'size': ['small', 'normal', 'large', 'huge'] }], // Adding custom font sizes
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link', 'image'], // Add the image button in the toolbar
      [{ 'align': [] }],
      ['clean'] // Add a clean button to clear the content
      [{ 'color': [] }], // Color dropdown
      [{ 'background': [] }], // Background color dropdown
      [{ 'align': 'center' }, { 'align': 'right' }, { 'align': 'left' }],

    ],
  };

  const formats = [
    'header', 'font', 'size', 'list', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block', 'link', 'image', 'align', 'color', 'background'
  ];

  useEffect(() => {
    // @ts-ignore
    quillRef.current
      .getEditor()
      .getModule('toolbar')
      .addHandler('image', () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
  
        input.onchange = async () => {
          if (!input.files || !input.files.length || !input.files[0]) return;
  
          const file = input.files[0];
          const altText = prompt("Please enter alt text for the image:");
  
          const formData2 = new FormData();
          formData2.append('image', file);
          formData2.append('blogfor', formData.blogfor);
  
          console.log("FormData blogfor:", formData.blogfor);  // Debugging line
  
          try {
            const response = await axios.post('https://reactadminblog.vercel.app/api/uploadei', formData2, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
  
            console.log(response, "response from image upload");
            const data = response.data;
  
            if (data.success) {
              console.log("Image uploaded successfully");

              // Insert the image URL into Quill editor
              const editor = quillRef.current.getEditor();
              const range = editor.getSelection(true);
              editor.insertEmbed(range.index, 'image', data.imageUrl);
  
              const imageElement = editor.container.querySelector('img');
              if (imageElement) {
                imageElement.setAttribute('alt', altText);
              }
            } else {
              console.error('Upload failed:', data.error);
            }
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        };
      });
  }, []);
  

  console.log(formData.blogfor, "formData.blogfor");
  useEffect(() => {
    const fetchCatgs = async () => {
      // setLoading(true);
      const querySnapshot = await getDocs(collection(fireDb, `${formData.blogfor == "LDC" ? 'catgforldc' : formData.blogfor == "Dozzy" ? 'catgfordozzy' : 'none'}`));
      const catgs1 = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCatgs(catgs1)
      // setPostauthor(localStorage.getItem('AdminName'))
    };
    fetchCatgs();

  }, [formData.blogfor])

  useEffect(() => {
    if (formData.blogfor == '' || formData.blogfor == 'none') {
      setEnableImg(true);
    }
    else {
      setEnableImg(false);
    }
  }, [])
  useEffect(() => {
    if (formData.blogfor == '' || formData.blogfor == 'none') {
      setEnableImg(true);
    }
    else {
      setEnableImg(false);
    }
  }, [formData.blogfor])
  console.log(enableimg, "enableimg");

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
            <label htmlFor="categoryname" className="text-lg pb-5">Category Name Selected :<p className='flex gap-4'>{formData?.categoryname?.length && formData?.categoryname?.map((catn, index) => {
              return <span key={index} className='text-blue-400'>{catn}</span>
            })}</p> </label>
            <div className="flex items-center gap-2">
            </div>
            <div className="flex items-center gap-4">
              {/* <label htmlFor="categoryname" className="text-lg font-semibold text-gray-700">Select Categories</label> */}
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
            <label htmlFor="slug" className="text-lg">slug</label>
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
            <p className='text-sm text-blue-600'>slug: {formData.slug.replaceAll(' ', '-').toLowerCase()}
            </p>
          </div>
          <div className="flex flex-col">
            <label htmlFor="description" className="text-lg"> Meta Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="border rounded-lg p-2"
            />
            <p className='pt-3'> Character Count : {formData.description.replace(/\s+/g, '').length}</p>
          </div>
          <div className="flex gap-4 pt-4">
            <div className="flex flex-col">
              <label htmlFor="coverimages" className="text-lg">Cover Image</label>
              <input
                type="file"
                id="coverimages"
                name="coverimages"
                accept="image/*"
                onChange={handleImageUpload}
                className="border rounded-lg p-2"
                disabled={enableimg}
              />
              <img
                src={uploadedImageUrl}  // Adjust URL for public access
                alt="Cover Preview"
                className="w-32 h-32 object-cover rounded"
              />
              {/* {console.log(uploadedImageUrl, "uploadedImageUrl")} */}
            </div>
            <div className="flex flex-col">
              <label htmlFor="cialt" className="text-lg">Cover image Alt text </label>
              <input
                type="text"
                id="cialt"
                name="cialt"
                value={formData.cialt}
                onChange={handleChange}
                required
                className="border rounded-lg p-2"
              />
            </div>

          </div>
          <div className="flex flex-col">
            <label htmlFor="content" className="text-lg">Content</label>
            <div >
              <ReactQuill
                value={editorHtml}
                onChange={setEditorHtml}
                modules={modules}
                formats={formats}
                ref={quillRef}
                placeholder="Write your content here..."
                readOnly={enableimg}
                className='h-80'
              />
            </div>
          </div>

          <div>
          </div>
          <p className='text-end pr-4'>{calculateReadTime(editorHtml)} min read</p>
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
        </form>
      </div>
    </AdminLayout>
  );
}
