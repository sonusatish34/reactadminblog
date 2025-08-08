import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { fireDb } from "../../firebase";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import axios from "axios";

export default function AddPost() {
  const [catgs, setCatgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allowImg, setAllowImg] = useState(true);

  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    cialt: "",
    content: "",
    coverimages: "",
    blogfor: "",
    categoryname: [],
    description: "",
    slug: "",
  });

  const [editorHtml, setEditorHtml] = useState("");
  const [contentTable, setContentTable] = useState(""); // Not needed separately now because CKEditor handles tables inline

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type !== "image/webp") {
      alert("Please upload a .webp image.");
      return;
    }

    const formData1 = new FormData();
    formData1.append("coverimages", file);
    formData1.append("blogfor", formData.blogfor);

    try {
      const response = await axios.post(
        "https://reactadminblog.vercel.app/api/upload",
        formData1,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadedImageUrl(response?.data?.imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "categoryname") {
      const selectedCategories = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setFormData((prev) => ({
        ...prev,
        categoryname: selectedCategories,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const calculateReadTime = (text) => {
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;
    const wordsPerMinute = 183;
    if (wordCount === 0) return 0;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPost = {
      title: formData.title,
      description: formData.description,
      slug: formData.slug.replaceAll(" ", "-").toLowerCase().replace(/[;,]/g, ""),
      content: editorHtml,
      coverimages: uploadedImageUrl,
      blogfor: formData.blogfor,
      categoryname: formData.categoryname,
      createdAt: new Date().toISOString(),
      cialt: formData.cialt,
      timetake: calculateReadTime(editorHtml),
      blog_state: "in-progress",
    };

    try {
      setLoading(true);
      const blogRef = collection(fireDb, "blogPost");
      await addDoc(blogRef, {
        ...newPost,
        time: Timestamp.now(),
        postauthor: localStorage.getItem("AdminName"),
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      });

      Swal.fire({
        icon: "success",
        title: "Post Created",
        html: `Title: ${formData.title}`,
      });

      setFormData({
        id: "",
        title: "",
        description: "",
        content: "",
        coverimages: "",
        blogfor: "",
        categoryname: [],
        cialt: "",
        slug: "",
      });
      setEditorHtml("");
      setUploadedImageUrl("");
      setLoading(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an issue creating the post. Please try again.",
      });
    }
  };

  const handleClear = () => {
    setFormData({
      id: "",
      title: "",
      description: "",
      content: "",
      coverimages: "",
      blogfor: "",
      categoryname: [],
      cialt: "",
      slug: "",
    });
    setEditorHtml("");
  };

  useEffect(() => {
    if (formData.blogfor === "Dozzy" || formData.blogfor === "LDC") {
      setAllowImg(false);
    } else {
      setAllowImg(true);
    }
  }, [formData.blogfor]);

  useEffect(() => {
    const fetchCatgs = async () => {
      const colName =
        formData.blogfor === "LDC"
          ? "catgforldc"
          : formData.blogfor === "Dozzy"
          ? "catgfordozzy"
          : formData.blogfor === "DozzyBng"
          ? "catgfordozzybng"
          : "none";

      if (colName === "none") {
        setCatgs([]);
        return;
      }

      const querySnapshot = await getDocs(collection(fireDb, colName));
      const cats = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCatgs(cats);
    };

    fetchCatgs();
  }, [formData.blogfor]);

  // Custom upload adapter for CKEditor
  function CustomUploadAdapter(loader) {
    return {
      upload() {
        return loader.file.then(
          (file) =>
            new Promise((resolve, reject) => {
              // Validate file type
              if (file.type !== "image/webp") {
                reject("Please upload a .webp image.");
                alert("Please upload a .webp image.");
                return;
              }

              const data = new FormData();
              data.append("image", file);
              data.append("blogfor", formData.blogfor);

              axios
                .post("https://reactadminblog.vercel.app/api/uploadei", data, {
                  headers: { "Content-Type": "multipart/form-data" },
                })
                .then((res) => {
                  if (res.data.success) {
                    resolve({
                      default: res.data.imageUrl,
                    });
                  } else {
                    reject("Upload failed");
                    alert("Upload failed");
                  }
                })
                .catch((err) => {
                  console.error("Upload error", err);
                  reject(err);
                });
            })
        );
      },
      abort() {
        // Handle abort if needed
      },
    };
  }

  function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return CustomUploadAdapter(loader);
    };
  }

  return (
    <AdminLayout>
      <div
        style={{ width: "900px" }}
        className="shadow-md flex-row px-1 mt-5 items-center pt-2 pb-2 mb-2 justify-center rounded-lg ml-10 bg-white"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center hover:text-indigo-500">
          Add New Post
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full p-1">
          <div className="flex flex-col pt-4">
            <label htmlFor="blogfor" className="text-lg">
              Blog For
            </label>
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
              <option value="DozzyBng">Dozzy Bangla</option>
            </select>
          </div>

          <div className="flex flex-col pt-4">
            <label htmlFor="categoryname" className="text-lg">
              Category
            </label>
            <select
              id="categoryname"
              name="categoryname"
              value={formData.categoryname}
              onChange={handleChange}
              multiple
              className="border rounded-lg p-2"
            >
              {catgs.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col pt-4">
            <label htmlFor="title" className="text-lg">
              Title
            </label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />
          </div>

          <div className="flex flex-col pt-4">
            <label htmlFor="slug" className="text-lg">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />
          </div>

          <div className="flex flex-col pt-4">
            <label htmlFor="cialt" className="text-lg">
              Cover Image ALT Text
            </label>
            <input
              id="cialt"
              name="cialt"
              value={formData.cialt}
              onChange={handleChange}
              className="border rounded-lg p-2"
            />
          </div>

          {allowImg && (
            <div className="flex flex-col pt-4">
              <label htmlFor="coverimages" className="text-lg">
                Upload Cover Image (.webp only)
              </label>
              <input
                type="file"
                id="coverimages"
                name="coverimages"
                accept=".webp"
                onChange={handleImageUpload}
                className="border rounded-lg p-2"
              />
              {uploadedImageUrl && (
                <img
                  src={uploadedImageUrl}
                  alt="Cover Preview"
                  className="w-40 mt-2"
                />
              )}
            </div>
          )}

          <div className="flex flex-col pt-4">
            <label className="text-lg">Content</label>
            <CKEditor
              editor={ClassicEditor}
              data={editorHtml}
              config={{
                extraPlugins: [CustomUploadAdapterPlugin],
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "underline",
                  "strikethrough",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "|",
                  "alignment",
                  "outdent",
                  "indent",
                  "|",
                  "blockQuote",
                  "insertTable",
                  "tableColumn",
                  "tableRow",
                  "mergeTableCells",
                  "|",
                  "undo",
                  "redo",
                  "|",
                  "fontColor",
                  "fontBackgroundColor",
                ],
                table: {
                  contentToolbar: [
                    "tableColumn",
                    "tableRow",
                    "mergeTableCells",
                    "tableProperties",
                    "tableCellProperties",
                  ],
                },
              }}
              onChange={(event, editor) => {
                const data = editor.getData();
                setEditorHtml(data);
              }}
            />
          </div>

          <div className="flex flex-col pt-4">
            <label htmlFor="description" className="text-lg">
              Description (Meta)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="border rounded-lg p-2"
            />
          </div>

          <div className="flex justify-between pt-6">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
