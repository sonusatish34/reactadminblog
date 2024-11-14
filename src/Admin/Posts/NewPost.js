import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import AdminLayout from '../../layouts/AdminLayout';
import { Timestamp, addDoc, collection, setDoc, getDocs, query, where, } from 'firebase/firestore';
// import Vio from "./Admin/Vio/TextEditor"
import Vio from "../../Admin/Vio/TextEditor"
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import axios from 'axios'; // for handling image upload
import { fireDb } from '../../firebase';

export default function AddPost() {
  const [catgs, setCatgs] = useState('');
  useEffect(() => {
    const fetchCatgs = async () => {
      // setLoading(true);
      const querySnapshot = await getDocs(collection(fireDb, "categories"));
      const catgs1 = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // setPostsData(posts);
      setCatgs(catgs1)
      console.log(catgs1, "----------11111111------");
      setPostauthor(localStorage.getItem('AdminName'))
      // console.log(formData, "fd---000");
      // setLoading(false);
    };
    fetchCatgs()
  }, [])
  // console.log(catgs, "--catgs--");

  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    // Create FormData object to send the file as multipart/form-data
    const formData = new FormData();
    formData.append('coverimages', file);
    // console.log(formData, "formData");

    // console.log(formData, "------------fdd---");
    try {
            // const response = await axios.post('https://blogpage-theta.vercel.app/api/upload', formData, {

      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response, "response");
      const convimg = response?.data?.fileUrl?.replace('https://ldcars.blr1.', 'https://ldcars.blr1.cdn.')
      // Set the uploaded image URL from the response
      setUploadedImageUrl(convimg);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  const [postauthor, setPostauthor] = useState('')
  const [formData, setFormData] = useState({
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
  // console.log(formData, '000000000');

  const [editorData, setEditorData] = useState('');


  const [selectedCat, setSelectedCat] = useState('');

  useEffect(() => {
    async function hu() {
      const categoryRef = collection(fireDb, 'categories');
      const q = query(categoryRef, where('name', '==', 'dss'));
      const querySnapshot = await getDocs(q);
      // return querySnapshot.empty;
      console.log(querySnapshot.empty, "test ing cat");
    }
    hu()
  }, [])
  async function handleCategory() {

    async function hu(catname) {
      const categoryRef = collection(fireDb, 'categories');
      const q = query(categoryRef, where('name', '==', catname));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
      console.log(querySnapshot.empty,"test ing cat");

    }
    const categoryExists = await hu(selectedCat);

    if (!categoryExists) {
      Swal.fire({
        icon: 'warning',
        title: 'Category Exists',
        text: 'This category already exists in the database.',
      });
      return false; // Do not proceed to post submission
    }

    else {
      try {
        // Add new category to Firestore if it doesn't exist
        await addDoc(collection(fireDb, 'categories'), {
          name: selectedCat,
          createdAt: Timestamp.now(),
        });
        console.log('Category added successfully!');
        return true; // Proceed with post creation
      } catch (error) {
        console.error('Error adding category:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an error adding the category.',
        });
        return false;
      }
    }

  }

  const [currentKeyword, setCurrentKeyword] = useState(''); // Temporary state for current keyword

  // Handle form changes
  const handleChange = (e) => {
    console.log("Selected Value:", e.target.value);
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
    
  };
  console.log(formData,"formadastat on handle change ");


  const handleSubmit = async (e) => {
    e.preventDefault();

    handleCategory();
    // const categoryAdded = await addCategoryIfNotExists(selectedCat);
    // if (!categoryAdded) {
    //   return; // Exit early if category was not added or already exists
    // }
    const newPost = {
      title: formData.title,
      // page: formData.Page,
      description:formData.description,
      slug:formData.slug,
      content: editorHtml,
      coverimages: uploadedImageUrl,
      blogfor: formData.blogfor,
      categoryname: formData.categoryname,
      createdAt: new Date().toISOString(),
    };
// id: '',
//       title: '',
//       description: '',
//       content: '',
//       coverimages: '',  // This will store the base64 image string
//       blogfor: '',
//       categoryname: '',
//       description: '',
//       slug: ''
    try {
      // Save post in Firestore under blogdb -> blogs collection
      const blogRef = collection(fireDb, "blogPost"); // Reference to blogs collection under blogdb
      await addDoc(blogRef, {
        ...newPost,
        time: Timestamp.now(),
        postauthor: postauthor,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      });

      Swal.fire({
        icon: 'success',
        title: 'Post Created',
        html: `Title: ${formData.title}<br>Page: ${formData.Page}<br>Content: ${"editorData"}<br>Tags: ${formData.tags}`,
      });

      // Clear the form
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
      setEditorHtml('')
      
      // setEditorData('');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an issue creating the post. Please try again.',
      });
    }
  };

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     // setLoading(true);
  //     const querySnapshot = await getDocs(collection(fireDb, "blogPost"));
  //     const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //     // setPostsData(posts);
  //     // console.log(posts, "----------11111111------");
  //     setPostauthor(sessionStorage.getItem('AdminName'))
  //     console.log(formData, "fd---000");
  //     // setLoading(false);
  //   };

  //   fetchPosts();
  // }, []);

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
  const quillRef = useRef(null); // Create a reference using useRef
  // console.log(editorHtml, "-------");

  console.log(editorHtml,"ediur html");
  
  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }, { 'size': ['small', 'normal', 'large', 'huge'] }], // Adding custom font sizes
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link', 'image'], // Add the image button in the toolbar
      [{ 'align': [] }],
      ['clean'] // Add a clean button to clear the content
      // Add font color and background color to the toolbar
      [{ 'color': [] }], // Color dropdown
      [{ 'background': [] }], // Background color dropdown
    ],
    // imageHandler: imageHandler,
  };

  // Use the `formats` prop to specify the allowed formats in the editor
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
          // if (altText) setImageAltText(altText); // Store alt text
          // Create FormData to send the image to the server
          const formData = new FormData();
          formData.append('image', file);
          console.log(formData, "formdsata in funcncn");

          // Send image file to backend (Node.js server)
          try {
            // const response = await axios.post('https://blogpage-theta.vercel.app/api/upload', formData, {
            const response = await fetch('http://localhost:5000/upload', {
              method: 'POST',
              body: formData,
            });

            const data = await response.json();

            if (data.success) {
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
            <label htmlFor="Page" className="text-lg">Page URL</label>

            {formData.title?.replaceAll(' ', '-').toLowerCase()}
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
          </div>
          <div className="flex flex-col">
            <label htmlFor="slug" className="text-lg">slug</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder='optional'
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
            <img
              src={`${uploadedImageUrl}`}  // Adjust URL for public access
              alt="Cover Preview"
              className="w-32 h-32 object-cover rounded"
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
              value={formData.categoryname}
              onChange={handleChange}
              required
              className="border rounded-lg p-2"
            />
          </div>
          <div>
            {/* {catgs?.map((item, index) => (
              <p>{item.name}</p>
            ))} */}
            <p>Existing Categories</p>
            <div className='flex gap-3'>
              {catgs?.length ? catgs?.map((item, index) => (
                <p key={index}>{item.name}</p> // use `item.id` as the key
              )) : ''}
            </div>

            {/* <p>jikop</p> */}
          </div>
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
