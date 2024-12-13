import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import AdminLayout from '../../layouts/AdminLayout';
import { Timestamp, addDoc, collection, setDoc, getDocs, query, where, } from 'firebase/firestore';
import 'react-quill/dist/quill.snow.css'; // import styles
import axios from 'axios'; // for handling image upload
import { fireDb } from '../../firebase';
import ReactQuill, { Quill } from 'react-quill';
import imageResize from 'quill-image-resize-module-react';
import "quill/dist/quill.snow.css";
export default function AddPost() {
  const [catgs, setCatgs] = useState('');
  const [addCatgs, setAddCatgs] = useState(false);
  const [newCategory, setNewCategory] = useState(''); // Stores the new category name




  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    // Create FormData object to send the file as multipart/form-data
    const formData = new FormData();
    formData.append('coverimages', file);
    try {
      const response = await axios.post('https://reactadminblog.vercel.app/api/upload', formData, {

        // const response = await axios.post('https://seoblog.longdrivecars.com/api/upload', formData, {
        // const response = await axios.post('http://localhost:5000/upload', formData, {
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
    blogfor: 'LDC',
    categoryname: [],
    description: '',
    cialt: '',
    slug: ''
  });

  const [editorData, setEditorData] = useState('');




  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategory) {
      Swal.fire({
        icon: 'warning',
        title: 'Category name is required',
        text: 'Please enter a category name.',
      });
      return;
    }

    try {
      const categoryRef = collection(fireDb, 'categories');
      const q = query(categoryRef, where('name', '==', newCategory));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Swal.fire({
          icon: 'warning',
          title: 'Category Exists',
          text: 'This category already exists in the database.',
        });
        return;
      }

      // Add new category to Firestore
      await addDoc(collection(fireDb, 'categories'), {
        name: newCategory,
        createdAt: Timestamp.now(),
      });
      alert('Category added successfully!');

      // Update the categories list and set the selected category
      setCatgs(prevCatgs => [...prevCatgs, { name: newCategory }]);
      setFormData(prevFormData => ({
        ...prevFormData,
        categoryname: [...prevFormData.categoryname, newCategory],  // Add new category to selected categories
      }));
      setAddCatgs(false); // Close dialog
      setNewCategory(''); // Clear the input field
    } catch (error) {
      console.error('Error adding category:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an error adding the category.',
      });
    }
  };

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
      slug: formData.title.replaceAll(' ', '-').toLowerCase() + `-${Date.now()}`,
      content: editorHtml,
      coverimages: uploadedImageUrl,
      blogfor: formData.blogfor,
      categoryname: formData.categoryname,
      createdAt: new Date().toISOString(),
      cialt: formData.cialt,
      timetake: calculateReadTime(editorHtml)
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
  Quill.register('modules/imageResize', imageResize);


  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }], // Adding custom font sizes
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      ['link', 'image'], // Add the image button in the toolbar
      [{ 'align': [] }],
      [{ 'color': [] }], // Color dropdown
      [{ 'background': [] }], // Background color dropdown
      [{ 'align': 'center' }, { 'align': 'right' }, { 'align': 'left' }],
    ],
    imageResize: {
      modules: ["Resize", "DisplaySize"],
    },
  };

  const formats = [
    'header', 'size', 'list', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'link', 'image', 'align', 'color', 'background'
  ];

  useEffect(() => {
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
          const formData = new FormData();
          formData.append('image', file);

          try {
            const response = await fetch('https://reactadminblog.vercel.app/api/uploadei', {
              // const response = await fetch('http://localhost:5000/uploadei', {
              // const response = await axios.post('https://seoblog.longdrivecars.com/api/uploadei', formData, {
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
  console.log(formData.blogfor, "formData.blogfor");
  useEffect(() => {
    const fetchCatgs = async () => {
      // setLoading(true);
      const querySnapshot = await getDocs(collection(fireDb, `${formData.blogfor == "LDC" ? 'catgforldc' : 'catgfordozzy'}`));
      const catgs1 = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCatgs(catgs1)
      setPostauthor(localStorage.getItem('AdminName'))

    };
    fetchCatgs();

  }, [formData.blogfor])
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
          <div>
            <p className='text-sm text-blue-600'>slug: {formData.title.replaceAll(' ', '-').toLowerCase() + '-' + Date.now()}
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
                className='h-96'
              />
            </div>
          </div>
          <p className='text-end pr-4'>{calculateReadTime(editorHtml)} min read</p>
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
              />
              <img
                src={uploadedImageUrl ? uploadedImageUrl : 'null'}  // Adjust URL for public access
                alt="Dummy image"
                className="w-32 h-32 object-cover rounded pt-7"
              />
              {console.log(uploadedImageUrl, "uploadedImageUrl")}
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

          <div className="flex flex-col pt-4">
            <label htmlFor="blogfor" className="text-lg">Blog For</label>
            <select
              id="blogfor"
              name="blogfor"
              value={formData.blogfor}
              onChange={handleChange}
              className="border rounded-lg p-2"
            >
              <option value="LDC">LDC</option>
              <option value="Dozzy">Dozzy</option>
            </select>
          </div>
          <div className="flex flex-col pt-4">
            <label htmlFor="categoryname" className="text-lg pb-5">Category Name Selected :<p className='flex gap-4'>{formData?.categoryname.length && formData?.categoryname?.map((catn, index) => {
              return <span className='text-blue-400'>{catn}</span>
            })}</p> </label>
            <div className="flex items-center gap-2">

              {/* <button
                onClick={(e) => {
                  e.preventDefault();
                  setAddCatgs(true); // Open dialog
                }}
                className="rounded-md bg-gray-200 p-1 flex items-center"
              >
                + Add
              </button>
              {addCatgs && (
                <div className="absolute bg-white border rounded-lg p-4 mt-2 shadow-lg">
                  <h3 className="text-lg mb-4">Add New Category</h3>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                    className="border rounded-lg p-2 w-64 mb-4"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setAddCatgs(false)
                      }} // Close dialog
                      className="bg-gray-300 p-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCategorySubmit} // Add category
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              )} */}
            </div>
            <div className="flex items-center gap-4 pl-4">
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
          <div>
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







const [editorHtml, setEditorHtml] = useState('');
const quillRef = useRef(null);

// Register the image resize module
Quill.register('modules/imageResize', imageResize);

// Custom toolbar configuration
const modules = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }], // Headers
    [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Lists
    ['bold', 'italic', 'underline', 'strike'], // Text styles
    ['blockquote'],
    ['link', 'image', 'insertText'], // Image button and text insert button
    [{ 'align': [] }],
    [{ 'color': [] }],
    [{ 'background': [] }],
    [{ 'align': 'center' }, { 'align': 'right' }, { 'align': 'left' }],
  ],
  imageResize: {
    modules: ["Resize", "DisplaySize"],
  },
};

const formats = [
  'header', 'size', 'list', 'bold', 'italic', 'underline', 'strike',
  'blockquote', 'link', 'image', 'align', 'color', 'background'
];

// Custom image insertion logic
useEffect(() => {
  const quill = quillRef.current.getEditor();
  
  // Add custom image handler
  quill.getModule('toolbar').addHandler('image', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (!input.files || !input.files.length) return;

      const file = input.files[0];
      const formData = new FormData();
      formData.append('image', file);

      try {
        // Upload image to the server (you can modify this URL to your own backend)
        const response = await fetch('https://your-server-endpoint.com/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          const imageUrl = data.imageUrl; // Get the uploaded image URL
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', imageUrl); // Insert the image at the cursor position

          // Add text beside the image
          const text = prompt('Enter text to display beside the image:');
          const imageElement = editor.container.querySelector('img');
          
          if (imageElement) {
            imageElement.setAttribute('alt', text); // Set the alt text as placeholder for the text
            const textNode = document.createTextNode(` ${text}`); // Create text node
            imageElement.parentNode.insertBefore(textNode, imageElement.nextSibling); // Insert the text after the image
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    };
  });
}, []);



























import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import Quill from 'quill';

// Create a custom blot for a draggable text area
const DraggableTextAreaBlot = Quill.import('blots/block'); // We inherit from block blot

class DraggableTextArea extends DraggableTextAreaBlot {
  static create(value) {
    const node = super.create();
    node.setAttribute('contenteditable', 'false');
    node.innerHTML = `<textarea class="draggable-textarea">${value || ''}</textarea>`;
    return node;
  }

  static value(node) {
    return node.querySelector('textarea').value;
  }

  constructor(node) {
    super(node);
    this.node = node;
    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    const textarea = this.node.querySelector('textarea');
    let isDragging = false;

    // Mouse event to track dragging
    textarea.addEventListener('mousedown', (e) => {
      isDragging = true;
      const offsetX = e.clientX - textarea.getBoundingClientRect().left;
      const offsetY = e.clientY - textarea.getBoundingClientRect().top;

      const moveHandler = (moveEvent) => {
        if (isDragging) {
          textarea.style.position = 'absolute';
          textarea.style.left = `${moveEvent.clientX - offsetX}px`;
          textarea.style.top = `${moveEvent.clientY - offsetY}px`;
        }
      };

      const upHandler = () => {
        isDragging = false;
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    });
  }
}

// Register the custom blot
Quill.register('formats/draggable-textarea', DraggableTextArea);

const MyEditor = () => {
  const [editorValue, setEditorValue] = useState('');
  const quillRef = useRef();

  const handleChange = (value) => {
    setEditorValue(value);
  };

  const addDraggableTextArea = () => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    // Insert a draggable text area at the current cursor position
    quill.insertEmbed(range.index, 'draggable-textarea', 'This is a draggable textarea!');
  };

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        value={editorValue}
        onChange={handleChange}
        modules={{
          toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, 'bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
          ]
        }}
      />
      <button onClick={addDraggableTextArea}>
        Add Draggable Textarea
      </button>
    </div>
  );
};

// export default MyEditor;
