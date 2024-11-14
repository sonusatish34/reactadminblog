// // // import React, { useState, useRef } from 'react';
// // // import ReactQuill from 'react-quill';
// // // import 'react-quill/dist/quill.snow.css'; // import styles
// // // import axios from 'axios'; // for handling image upload

// // // const TextEditor = () => {
// // //   const [editorHtml, setEditorHtml] = useState('');
// // //   const quillRef = useRef(null); // Create a reference using useRef
// // //   console.log(editorHtml,"-------eh");
  
// // //   // Custom image handler
// // //   const handleImageUpload = (file) => {
// // //     const formData = new FormData();
// // //     formData.append('image', file);

// // //     // Replace with your backend upload URL
// // //     axios.post('/api/upload', formData, {
// // //       headers: {
// // //         'Content-Type': 'multipart/form-data',
// // //       },
// // //     })
// // //       .then((response) => {
// // //         // Assuming your backend returns the image URL
// // //         const imageUrl = response.data.url;

// // //         // Access the Quill editor instance via quillRef and insert the image
// // //         const quill = quillRef.current.getEditor();
// // //         const range = quill.getSelection();
// // //         quill.insertEmbed(range.index, 'image', imageUrl);
// // //       })
// // //       .catch((error) => {
// // //         console.error("Image upload failed: ", error);
// // //       });
// // //   };

// // //   const modules = {
// // //     toolbar: [
// // //       [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
// // //       [{ 'list': 'ordered'}, { 'list': 'bullet' }],
// // //       ['bold', 'italic', 'underline', 'strike'],
// // //       ['blockquote', 'code-block'],
// // //       ['link', 'image'], // Add the image button in the toolbar
// // //       [{ 'align': [] }],
// // //       ['clean'] // Add a clean button to clear the content
// // //     ]
// // //   };

// // //   // Use the `formats` prop to specify the allowed formats in the editor
// // //   const formats = [
// // //     'header', 'font', 'list', 'bold', 'italic', 'underline', 'strike', 
// // //     'blockquote', 'code-block', 'link', 'image', 'align'
// // //   ];

// // //   return (
// // //     <div>
// // //       <ReactQuill 
// // //         value={editorHtml} 
// // //         onChange={setEditorHtml} 
// // //         modules={modules}
// // //         formats={formats}
// // //         ref={quillRef} // Use the ref here
// // //       />
// // //     </div>
// // //   );
// // // };

// // // export default TextEditor;
// // import React, { useState, useEffect, useRef } from 'react';
// // import Swal from 'sweetalert2';
// // import AdminLayout from '../../layouts/AdminLayout';
// // import { Timestamp, addDoc, collection } from 'firebase/firestore';
// // import ReactQuill from 'react-quill';
// // import 'react-quill/dist/quill.snow.css';
// // import axios from 'axios';
// // import { fireDb } from '../../firebase';

// // export default function AddPost() {
// //   const [formData, setFormData] = useState({
// //     title: '',
// //     Page: '',
// //     keywords: '',
// //     coverimages: '',
// //     blogfor: '',
// //     categoryname: ''
// //   });

// //   const [editorHtml, setEditorHtml] = useState('');
// //   const [currentKeyword, setCurrentKeyword] = useState('');
// //   const quillRef = useRef(null);

// //   // Form field handlers
// //   const handleChange = (e) => { /* ... */ };
// //   const handleKeywordChange = (e) => { /* ... */ };
// //   const handleKeywordKeyDown = (e) => { /* ... */ };

// //   // Cover Image Upload Handler
// //   const handleCoverImageUpload = async (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       const formData = new FormData();
// //       formData.append('coverImage', file);

// //       try {
// //         const response = await axios.post('http://localhost:5000/upload', formData, {
// //           headers: { 'Content-Type': 'multipart/form-data' },
// //         });
// //         setFormData(prevData => ({ ...prevData, coverimages: response.data.filePath }));
// //       } catch (error) {
// //         Swal.fire({ icon: 'error', title: 'Error', text: 'Image upload failed. Please try again.' });
// //       }
// //     }
// //   };

// //   // Quill Editor Image Upload Handler
// //   const handleEditorImageUpload = () => {
// //     const input = document.createElement('input');
// //     input.setAttribute('type', 'file');
// //     input.setAttribute('accept', 'image/*');
// //     input.click();
  
// //     input.onchange = async () => {
// //       const file = input.files[0];
// //       if (file) {
// //         const formData = new FormData();
// //         formData.append('editorImage', file);
  
// //         try {
// //           const response = await axios.post('http://localhost:5000/upload-editor-image', formData, {
// //             headers: { 'Content-Type': 'multipart/form-data' },
// //           });
  
// //           // Get the editor instance
// //           const quillEditor = quillRef.current.getEditor();
          
// //           // Get the current selection range or set it to the end of the content
// //           const range = quillEditor.getSelection(true); // `true` focuses the editor if not already focused
// //           if (range) {
// //             // Insert the image at the current selection or cursor position
// //             quillEditor.insertEmbed(range.index, 'image', `http://localhost:5000${response.data.filePath}`);
            
// //             // Move the cursor to the next position after the image
// //             quillEditor.setSelection(range.index + 1);
// //           }
// //         } catch (error) {
// //           console.error('Error uploading the image:', error);
// //         }
// //       }
// //     };
// //   };
  

// //   const modules = {
// //     toolbar: {
// //       container: [
// //         [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
// //         [{ 'list': 'ordered' }, { 'list': 'bullet' }],
// //         ['bold', 'italic', 'underline', 'strike'],
// //         ['blockquote', 'code-block'],
// //         ['link', 'image'],
// //         [{ 'align': [] }],
// //         ['clean']
// //       ],
// //       handlers: { image: handleEditorImageUpload },
// //     },
// //   };

// //   const formats = [
// //     'header', 'font', 'list', 'bold', 'italic', 'underline', 'strike',
// //     'blockquote', 'code-block', 'link', 'image', 'align'
// //   ];

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     const newPost = {
// //       title: formData.title,
// //       page: formData.Page,
// //       content: editorHtml,
// //       keywords: formData.keywords,
// //       coverimages: formData.coverimages,
// //       blogfor: formData.blogfor,
// //       categoryname: formData.categoryname,
// //       createdAt: new Date().toISOString(),
// //     };

// //     try {
// //       const blogRef = collection(fireDb, "blogPost");
// //       await addDoc(blogRef, { ...newPost, time: Timestamp.now() });

// //       Swal.fire({
// //         icon: 'success',
// //         title: 'Post Created',
// //         html: `Title: ${formData.title}<br>Keywords: ${formData.keywords}`,
// //       });

// //       setFormData({ title: '', Page: '', keywords: '', coverimages: '', blogfor: '', categoryname: '' });
// //       setEditorHtml('');
// //     } catch (error) {
// //       Swal.fire({ icon: 'error', title: 'Error', text: 'Post creation failed. Please try again.' });
// //     }
// //   };

// //   return (
// //     <AdminLayout>
// //       <div style={{ width: '900px' }} className="shadow-md flex-row px-1 mt-5 items-center pt-2 pb-2 mb-2 justify-center rounded-lg ml-10 bg-white">
// //         <h2 className="text-2xl font-semibold mb-4 text-center">Add New Post</h2>
// //         <form onSubmit={handleSubmit} className="space-y-4 w-full p-1">
// //           <div className="flex flex-col">
// //             <label htmlFor="title" className="text-lg">Title</label>
// //             <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="border rounded-lg p-2" />
// //           </div>
// //           {/* Other form fields... */}
// //           <div className="flex flex-col pt-4">
// //             <label htmlFor="coverimages" className="text-lg">Cover Image</label>
// //             <input type="file" id="coverimages" name="coverimages" accept="image/*" onChange={handleCoverImageUpload} className="border rounded-lg p-2" />
// //             {formData.coverimages && (
// //               <div className="mt-2">
// //                 <img src={`http://localhost:5000${formData.coverimages}`} alt="Cover Preview" className="w-32 h-32 object-cover rounded" />
// //               </div>
// //             )}
// //           </div>
// //           <div className="flex flex-col pt-4">
// //             <label htmlFor="content" className="text-lg">Content</label>
// //             <ReactQuill value={editorHtml} onChange={setEditorHtml} modules={modules} formats={formats} ref={quillRef} />
// //           </div>
// //           <button type="submit" className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600">Submit</button>
// //         </form>
// //       </div>
// //     </AdminLayout>
// //   );
// // }
// import React, { useState, useRef, useEffect } from 'react';
// import Swal from 'sweetalert2';
// import CryptoJS from 'crypto-js';
// import AdminLayout from '../../layouts/AdminLayout';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css'; // import styles
// import axios from 'axios'; // for handling image upload

// import { fireDb } from '../../firebase';

// export default function AddPost() {
//   const [formData, setFormData] = useState({
//     title: '',
//     Page: '',
//     content: '',
//     keywords: '',  
//     coverimages: '',  
//     blogfor: '',
//     categoryname: ''
//   });

//   const [editorHtml, setEditorHtml] = useState('');
//   const quillRef = useRef(null);

//   // Handle the image upload to the server
//   const handleImageUpload = async (file) => {
//     const formData = new FormData();
//     formData.append('coverImage', file);  // 'coverImage' is the field name used in backend

//     try {
//       const response = await axios.post('http://localhost:5000/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       const { filePath } = response.data;
//       return filePath;  // return the uploaded file path from the server
//     } catch (error) {
//       console.error('Error uploading the image:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Upload Error',
//         text: 'There was an error uploading the image. Please try again.',
//       });
//       return null;
//     }
//   };

//   // Custom image handler for Quill editor
//   const imageHandler = async () => {
//     const input = document.createElement('input');
//     input.setAttribute('type', 'file');
//     input.setAttribute('accept', 'image/*');

//     input.click();

//     input.onchange = async () => {
//       const file = input.files[0];
//       if (file) {
//         const filePath = await handleImageUpload(file);
//         if (filePath) {
//           const range = quillRef.current.getEditor().getSelection();
//           quillRef.current.getEditor().insertEmbed(range.index, 'image', `http://localhost:5000${filePath}`);
//         }
//       }
//     };
//   };

//   // Use `useEffect` to hook into the Quill editor after it is mounted
//   useEffect(() => {
//     if (quillRef.current) {
//       const quillEditor = quillRef.current.getEditor();
//       const toolbar = quillEditor.getModule('toolbar');

//       // Manually add the custom image handler
//       const imageButton = toolbar.container.querySelector('.ql-image');
//       if (imageButton) {
//         imageButton.addEventListener('click', imageHandler);
//       }

//       // Cleanup the event listener when the component unmounts
//       return () => {
//         if (imageButton) {
//           imageButton.removeEventListener('click', imageHandler);
//         }
//       };
//     }
//   }, []);

//   const modules = {
//     toolbar: [
//       [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }, { 'size': ['small', 'normal', 'large', 'huge'] }],
//       [{ 'list': 'ordered' }, { 'list': 'bullet' }],
//       ['bold', 'italic', 'underline', 'strike'],
//       ['blockquote', 'code-block'],
//       ['link', 'image'],  // Add image to toolbar
//       [{ 'align': [] }],
//       ['clean'],
//       [{ 'color': [] }],
//       [{ 'background': [] }],
//     ],
//   };

//   const formats = [
//     'header', 'font', 'size', 'list', 'bold', 'italic', 'underline', 'strike',
//     'blockquote', 'code-block', 'link', 'image', 'align', 'color', 'background',
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const newPost = {
//       title: formData.title,
//       page: formData.Page,
//       content: editorHtml,
//       keywords: formData.keywords,
//       coverimages: formData.coverimages,
//       blogfor: formData.blogfor,
//       categoryname: formData.categoryname,
//       createdAt: new Date().toISOString(),
//     };

//     try {
//       // Save post in Firestore under blogdb -> blogs collection
//       const blogRef = collection(fireDb, 'blogPost');
//       await addDoc(blogRef, newPost);

//       Swal.fire({
//         icon: 'success',
//         title: 'Post Created',
//         text: 'Post created successfully!',
//       });

//       setFormData({
//         title: '',
//         Page: '',
//         content: '',
//         keywords: '',
//         coverimages: '',
//         blogfor: '',
//         categoryname: '',
//       });
//       setEditorHtml('');
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'There was an issue creating the post. Please try again.',
//       });
//     }
//   };

//   return (
//     <AdminLayout>
//       <div className="shadow-md flex-row px-1 mt-5 items-center pt-2 pb-2 mb-2 justify-center rounded-lg ml-10 bg-white">
//         <h2 className="text-2xl font-semibold mb-4 text-center hover:text-indigo-500">Add New Post</h2>
//         <form onSubmit={handleSubmit} className="space-y-4 w-full p-1">
//           {/* Form fields for Title, Page URL, Keywords, and Content */}
//           <div className="flex flex-col">
//             <label htmlFor="title" className="text-lg">Title</label>
//             <input
//               type="text"
//               id="title"
//               name="title"
//               value={formData.title}
//               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               required
//               className="border rounded-lg p-2"
//             />
//           </div>

//           <div className="flex flex-col">
//             <label htmlFor="keywords" className="text-lg">Keywords</label>
//             <input
//               type="text"
//               id="keywords"
//               name="keywords"
//               value={formData.keywords}
//               onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
//               className="border rounded-lg p-2"
//             />
//           </div>

//           <div className="flex flex-col">
//             <label htmlFor="content" className="text-lg">Content</label>
//             <ReactQuill
//               value={editorHtml}
//               onChange={setEditorHtml}
//               modules={modules}
//               formats={formats}
//               ref={quillRef}
//               placeholder="Write your content here..."
//             />
//           </div>

//           <div className="flex flex-col pt-4">
//             <label htmlFor="coverimages" className="text-lg">Cover Image</label>
//             <input
//               type="file"
//               id="coverimages"
//               name="coverimages"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="border rounded-lg p-2"
//             />
//             {formData.coverimages && (
//               <div className="mt-2">
//                 <img
//                   src={`http://localhost:5000${formData.coverimages}`}
//                   alt="Cover Preview"
//                   className="w-32 h-32 object-cover rounded"
//                 />
//               </div>
//             )}
//           </div>

//           <button
//             type="submit"
//             className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-300"
//           >
//             Submit
//           </button>
//         </form>
//       </div>
//     </AdminLayout>
//   );
// }
