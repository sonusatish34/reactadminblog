// Image testing like local upload multiplwe

// import React, { useState } from 'react';
// import axios from 'axios';

// export default function MultiImageUploadForm() {
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
//     const [localPreviews, setLocalPreviews] = useState([]);
//     const [formData, setFormData] = useState({
//         blogfor: '',
//         cialt: '',
//     });
//     // console.log(uploadedImageUrls, "uploadedImageUrls");

//     const handleMultipleImageUpload = async (event) => {
//         const files = Array.from(event.target.files);
//         const validWebpFiles = files.filter(file => file.type === "image/webp");

//         if (validWebpFiles.length !== files.length) {
//             alert("Please upload only .webp images.");
//             return;
//         }

//         const localUrls = validWebpFiles.map(file => URL.createObjectURL(file));
//         setLocalPreviews(localUrls);
//         console.log(localPreviews, "localPreviews");

//         setSelectedFiles(validWebpFiles);

//         const uploadPromises = validWebpFiles.map(async (file) => {
//             const formData1 = new FormData();
//             formData1.append("coverimages", file);
//             formData1.append("blogfor", formData.blogfor);

//             try {
//                 const response = await axios.post(
//                     "https://reactadminblog-git-dev-sumiths-projects-3ec80bf3.vercel.app/api/upload",
//                     formData1,
//                     {
//                         headers: {
//                             "Content-Type": "multipart/form-data",
//                         },
//                     }
//                 );
//                 return response?.data?.imageUrl;
//             } catch (error) {
//                 console.error("Error uploading image:", error);
//                 return null;
//             }
//         });

//         const uploadedUrls = await Promise.all(uploadPromises);
//         setUploadedImageUrls(uploadedUrls.filter(Boolean));
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const payload = {
//             imageUrls: uploadedImageUrls,
//             cialt: formData.cialt,
//             blogfor: formData.blogfor,
//         };

//         try {
//             await axios.post('https://your-backend-endpoint.com/submit', payload);
//             alert('Form submitted successfully!');
//         } catch (error) {
//             console.error('Form submission failed:', error);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <div className="flex gap-4 pt-4">
//                 <div className="flex flex-col">
//                     <label htmlFor="coverimages" className="text-lg">
//                         Upload Multiple .webp Images
//                     </label>
//                     <input
//                         type="file"
//                         id="coverimages"
//                         name="coverimages"
//                         accept="image/webp"
//                         multiple
//                         onChange={handleMultipleImageUpload}
//                         className="border rounded-lg p-2"
//                     />
//                     {console.log(localPreviews,'-------------')}
//                     {localPreviews.length ? (
//                         <div className="flex gap-2 flex-wrap mt-2">
//                             {localPreviews.map((url, idx) => (
//                                 <img
//                                     key={idx}
//                                     src={url}
//                                     alt={`Preview ${idx}`}
//                                     className="w-24 h-24 object-cover rounded"
//                                 />
//                             ))}
//                         </div>
//                     ) : (
//                         <p className="p-1 pt-4 text-red-500">No images uploaded</p>
//                     )}
//                 </div>


//             </div>
//         </form>
//     );
// }
import { useState } from "react";

const categories = [
  "Tourism",
  "Amusement Parks",
  "Nature and Wildlife",
  "Adventure Activities",
  "Family Trip",
  "Solo Trip",
  "Group Trip",
  "Food",
  "Couple Trip",
  "Culture and Heritage",
  "Activities",
  "Beaches",
  "Mountains and Hill Stations",
  "City Sightseeing",
  "Night Life",
  "Festivals and Events",
  "Offbeat Places / Hidden Places",
  "Workcation",
  "Concerts",
  "Weekend Trips"
];


export default function CategorySelector() {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCheckboxChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };
  console.log(selectedCategories, 'selecudjsiodfud0');


  return (
    <div>
      <p className="text-xl py-3">Popular Tags</p>
      <div className="grid grid-cols-4 gap-2">
        {categories.map((category) => (
          <label key={category} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={category}
              checked={selectedCategories.includes(category)}
              onChange={() => handleCheckboxChange(category)}
              className="border-2"
            />
            {category}
          </label>
        ))}
      </div>

      {/* For form submission or debugging */}
      <div className="mt-4">
        <strong>Selected:</strong> {selectedCategories.join(", ")}
      </div>
    </div>
  );
}
