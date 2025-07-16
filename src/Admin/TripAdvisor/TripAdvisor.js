import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import AdminLayout from "../../layouts/AdminLayout";
import SunEditor from 'suneditor-react'
import 'suneditor/dist/css/suneditor.min.css'
import { Timestamp, addDoc, collection, setDoc, getDocs, query, doc, updateDoc, where, orderBy } from "firebase/firestore";
import axios from "axios"; // for handling image upload

import { fireDb } from "../../firebase";
export default function AddPost() {
    const [mainContent, setMainContent] = useState('')
    const [mainContentBest, setMainContentBest] = useState('')
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);

            const qActive = query(collection(fireDb, "trips"));
            const querySnapshotActive = await getDocs(qActive);
            const activePosts = querySnapshotActive.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setLoading(false);
        };

        fetchPosts();
    }, []);
    const handleEditorChange = (content) => {
        // console.log('Editor HTML content:', content)
        setMainContent(content)
    }
    const handleEditorChangeBest = (content) => {
        // console.log('Editor HTML content:', content)
        setMainContentBest(content)
    }
    const [localPreviews, setLocalPreviews] = useState([]);
    const [catgs, setCatgs] = useState("");

    const [loading, setLoading] = useState(false);


    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]);



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
        "Weekend Getaways"
    ];

    const [selectedCategories, setSelectedCategories] = useState([]);

    const handleCheckboxChange = (category) => {
        const lowerCaseCategory = category.toLowerCase().replaceAll(' ', '-');

        setSelectedCategories((prev) =>
            prev.includes(lowerCaseCategory)
                ? prev.filter((item) => item !== lowerCaseCategory)
                : [...prev, lowerCaseCategory]
        );
    };


    const handleMultipleImageUpload = async (event) => {
        const files = Array.from(event.target.files);
        const validWebpFiles = files.filter(file => file.type === "image/webp");

        if (validWebpFiles.length !== files.length) {
            alert("Please upload only .webp images.");
            return;
        }

        const localUrls = validWebpFiles.map(file => URL.createObjectURL(file));
        setLocalPreviews(localUrls);
        setSelectedFiles(validWebpFiles);

        // const formData = new FormData();
        // validWebpFiles.forEach(file => formData.append('coverimagesmul', file));
        // console.log(formData,'fd');

        // try {
        //     const response = await axios.post(
        //         'http://localhost:5000/uploadmul',
        //         formData,
        //         {
        //             headers: {
        //                 'Content-Type': 'multipart/form-data',
        //             },
        //         }
        //     );

        //     console.log(response.data, 'Uploaded URLs');
        //     setUploadedImageUrls(response.data.imageUrls || []);
        // } catch (error) {
        //     console.error("Error uploading images:", error);
        // }
    };


    const [formData, setFormData] = useState({
        title: "",
        content: "",
        latitude: "",
        longitude: "",
        coverimages: "", // This will store the base64 image string
        description: "",
        slug: "",
        besttime: "",
        populartags: []
    });


    const [itineraryData, setItineraryData] = useState({
        title: '',
        summary: '',
        coverImage: '',
        plans: [
            {
                type: '',
                price: '',
                duration: '',
                highlights: [''],
                note: ''
            }
        ]
    });

    // console.log(selectedFile, "selectedFile");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));

    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formPayload = new FormData();
        selectedFiles.forEach(file => formPayload.append('coverimagesmul', file));
        let uploadedUrls;
        // console.log(formData, 'fd');

        try {
            const response = await axios.post(
                'http://localhost:5000/uploadmul',
                formPayload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            uploadedUrls = response.data.imageUrls || [];
            // console.log(uploadedUrls, 'Uploaded URLs');

            // setUploadedImageUrls(response.data.imageUrls || []);
        } catch (error) {
            console.error("Error uploading images:", error);
        }

        const newPost = {
            title: formData.title,
            description: formData.description,
            slug: formData?.slug?.replaceAll(" ", "-").toLowerCase(),
            coverimages: uploadedUrls,
            content: mainContent,
            createdAt: new Date().toISOString(),
            blog_state: "in-progress",
            latitude: formData.latitude,
            itineraryData: itineraryData,
            longitude: formData.longitude,
            besttime: mainContentBest,
            populartags: selectedCategories
        };

        try {
            setLoading(true);
            const blogRef = collection(fireDb, "trips");
            await addDoc(blogRef, {
                ...newPost,
                time: Timestamp.now(),
                postauthor: localStorage.getItem('AdminName'),
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
                title: "",
                description: "",
                slug: "",
                coverimages: "",
                content: "",
                createdAt: "new Date().toISOString()",
                blog_state: "",
                latitude: "",
                longitude: "",
                besttime: "",
                populartags: "",
                besttime: '',
                content: '',
            });
            setMainContent('');
            setMainContentBest('');
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

    // Handle form clear
    const handleClear = () => {
        setFormData({
            id: "",
            title: "",
            description: "",
            content: "",
            coverimages: "",
            description: "",
            slug: "",
        });
    };


    useEffect(() => {
        console.log(formData, "0000000000000");
    }, [formData])





    return (
        <AdminLayout>
            {
                <div
                    className="shadow-md flex-row px-1 mt-5 items-center pt-2 pb-2 mb-2 justify-center rounded-lg bg-white w-full">
                    {/* <p>koio</p> */}
                    <h2 className="text-2xl font-semibold mb-4 text-center hover:text-indigo-500">
                        Create a trip
                    </h2>
                    {
                        <form onSubmit={handleSubmit} className="space-y-4 w-full p-1">

                            <div className="flex flex-col">
                                <label htmlFor="title" className="text-lg">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}

                                    className="border rounded-lg p-2"
                                />
                            </div>
                            <div className="flex gap-x-3">

                                <div className="flex flex-col">
                                    <label htmlFor="latitude" className="text-lg">
                                        Latitude
                                    </label>
                                    <input
                                        type="text"
                                        id="latitude"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleChange}

                                        className="border rounded-lg p-2"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="longitude" className="text-lg">
                                        Longitude
                                    </label>
                                    <input
                                        type="text"
                                        id="longitude"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        className="border rounded-lg p-2"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="slug" className="text-lg">
                                    slug
                                </label>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="border rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600">
                                    slug: {formData.slug.replaceAll(" ", "-").toLowerCase()}
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="description" className="text-lg">
                                    {" "}
                                    Meta Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}

                                    className="border rounded-lg p-2"
                                />
                                <p className="pt-3">
                                    {" "}
                                    Character Count :{" "}
                                    {formData.description.replace(/\s+/g, "").length}
                                </p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <div className="flex flex-col">
                                    <label htmlFor="coverimages" className="text-lg">
                                        Upload Multiple .webp Images
                                    </label>
                                    <input
                                        type="file"
                                        id="coverimages"
                                        name="coverimages"
                                        accept="image/webp"
                                        multiple
                                        onChange={handleMultipleImageUpload}
                                        className="border rounded-lg p-2"
                                    />
                                    {localPreviews.length ? (
                                        <div className="flex gap-2 flex-wrap mt-2">
                                            {localPreviews.map((url, idx) => (
                                                <img
                                                    key={idx}
                                                    src={url}
                                                    alt={`Preview ${idx}`}
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="p-1 pt-4 text-red-500">No images uploaded</p>
                                    )}
                                </div>

                            </div>


                            <div className="flex flex-col">
                                <label htmlFor="besttime" className="text-lg">
                                    Content
                                </label>
                                <div className=" p-4 border rounded">
                                    <SunEditor
                                        height="140px"
                                        setOptions={{
                                            buttonList: [
                                                ['bold', 'italic', 'underline'],
                                                ['fontColor'],
                                                ['list'],
                                            ],
                                        }}
                                        onChange={handleEditorChange}
                                    />
                                </div>
                            </div>
                            <div className="py-6">
                                <h3 className="text-xl font-semibold mb-2">Itinerary Details</h3>

                                <div className="flex flex-col mb-4">
                                    <label>Itinerary Title</label>
                                    <input
                                        type="text"
                                        value={itineraryData.title}
                                        onChange={(e) => setItineraryData({ ...itineraryData, title: e.target.value })}
                                        className="border p-2 rounded"
                                    />
                                </div>

                                <div className="flex flex-col mb-4">
                                    <label>Itinerary Summary</label>
                                    <textarea
                                        value={itineraryData.summary}
                                        onChange={(e) => setItineraryData({ ...itineraryData, summary: e.target.value })}
                                        className="border p-2 rounded"
                                    />
                                </div>

                                <div className="flex flex-col mb-4">
                                    <label>Cover Image URL</label>
                                    <input
                                        type="text"
                                        value={itineraryData.coverImage}
                                        onChange={(e) => setItineraryData({ ...itineraryData, coverImage: e.target.value })}
                                        className="border p-2 rounded"
                                    />
                                </div>

                                <h4 className="text-lg font-medium mt-4 mb-2">Plans</h4>
                                {itineraryData.plans.map((plan, planIndex) => (
                                    <div key={planIndex} className="border p-4 rounded mb-4 bg-gray-50">
                                        <div className="flex flex-col mb-2">
                                            <label>Type</label>
                                            <input
                                                type="text"
                                                value={plan.type}
                                                onChange={(e) => {
                                                    const updatedPlans = [...itineraryData.plans];
                                                    updatedPlans[planIndex].type = e.target.value;
                                                    setItineraryData({ ...itineraryData, plans: updatedPlans });
                                                }}
                                                className="border p-2 rounded"
                                            />
                                        </div>
                                        <div className="flex flex-col mb-2">
                                            <label>Price</label>
                                            <input
                                                type="text"
                                                value={plan.price}
                                                onChange={(e) => {
                                                    const updatedPlans = [...itineraryData.plans];
                                                    updatedPlans[planIndex].price = e.target.value;
                                                    setItineraryData({ ...itineraryData, plans: updatedPlans });
                                                }}
                                                className="border p-2 rounded"
                                            />
                                        </div>
                                        <div className="flex flex-col mb-2">
                                            <label>Duration</label>
                                            <input
                                                type="text"
                                                value={plan.duration}
                                                onChange={(e) => {
                                                    const updatedPlans = [...itineraryData.plans];
                                                    updatedPlans[planIndex].duration = e.target.value;
                                                    setItineraryData({ ...itineraryData, plans: updatedPlans });
                                                }}
                                                className="border p-2 rounded"
                                            />
                                        </div>
                                        <div className="flex flex-col mb-2">
                                            <label>Note</label>
                                            <textarea
                                                value={plan.note}
                                                onChange={(e) => {
                                                    const updatedPlans = [...itineraryData.plans];
                                                    updatedPlans[planIndex].note = e.target.value;
                                                    setItineraryData({ ...itineraryData, plans: updatedPlans });
                                                }}
                                                className="border p-2 rounded"
                                            />
                                        </div>

                                        <label className="font-semibold mb-1">Highlights</label>
                                        {plan.highlights.map((highlight, highlightIndex) => (
                                            <div key={highlightIndex} className="flex items-center mb-1 gap-2">
                                                <input
                                                    type="text"
                                                    value={highlight}
                                                    onChange={(e) => {
                                                        const updatedPlans = [...itineraryData.plans];
                                                        updatedPlans[planIndex].highlights[highlightIndex] = e.target.value;
                                                        setItineraryData({ ...itineraryData, plans: updatedPlans });
                                                    }}
                                                    className="border p-2 rounded flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updatedPlans = [...itineraryData.plans];
                                                        updatedPlans[planIndex].highlights.splice(highlightIndex, 1);
                                                        setItineraryData({ ...itineraryData, plans: updatedPlans });
                                                    }}
                                                    className="text-red-500"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedPlans = [...itineraryData.plans];
                                                updatedPlans[planIndex].highlights.push('');
                                                setItineraryData({ ...itineraryData, plans: updatedPlans });
                                            }}
                                            className="text-sm text-blue-600 mt-1"
                                        >
                                            + Add Highlight
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedPlans = [...itineraryData.plans];
                                                updatedPlans.splice(planIndex, 1);
                                                setItineraryData({ ...itineraryData, plans: updatedPlans });
                                            }}
                                            className="text-red-600 text-sm mt-2"
                                        >
                                            🗑️ Remove This Plan
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setItineraryData({
                                            ...itineraryData,
                                            plans: [...itineraryData.plans, {
                                                type: '',
                                                price: '',
                                                duration: '',
                                                highlights: [''],
                                                note: ''
                                            }]
                                        });
                                    }}
                                    className="bg-green-500 text-white px-3 py-1 rounded"
                                >
                                    + Add Plan
                                </button>
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="besttime" className="text-lg">
                                    Best Time To Visit
                                </label>
                                <div className=" p-4 border rounded">
                                    <SunEditor
                                        height="140px"
                                        setOptions={{
                                            buttonList: [
                                                ['bold', 'italic', 'underline'],
                                                ['fontColor'],
                                                ['list'],
                                            ],
                                        }}
                                        onChange={handleEditorChangeBest}
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-xl py-3 font-semibold">Popular Tags</p>
                                <div className="grid grid-cols-3 gap-4 pl-2 pt-2 pb-10">
                                    {categories.map((category) => (
                                        <label key={category} className=" flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                value={category}
                                                checked={selectedCategories.includes(category.toLowerCase().replaceAll(' ', '-'))}
                                                onChange={() => handleCheckboxChange(category)}
                                                className=""
                                            />
                                            {category}
                                        </label>
                                    ))}
                                </div>

                                {/*/ For form submission or debugging */}
                                <div className="mt-4">
                                    <strong>Selected:</strong> {selectedCategories.join(", ")}
                                </div>
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
                            <button type="button" className="">
                                {loading && (
                                    <div className="pl-7">
                                        <p className="text-blue-500 capitalize text-xl bg-blue-50 p-2 rounded-md">
                                            uploading please wait..
                                        </p>
                                    </div>
                                )}
                            </button>
                        </form>
                    }
                </div>
            }
        </AdminLayout>
    );
}
