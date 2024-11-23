import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { fireDb } from './firebase'; // Adjust this import according to your Firebase setup

const CategoryForm = () => {
    const [formData, setFormData] = useState({ categoryname: '' });
    const [addCatgs, setAddCatgs] = useState(false); // Controls the dialog visibility
    const [newCategory, setNewCategory] = useState(''); // Stores the new category name
    const [catgs, setCatgs] = useState([]); // Stores the list of categories

    useEffect(() => {
        // Fetch existing categories from Firestore when component mounts
        const fetchCategories = async () => {
            const categoryRef = collection(fireDb, 'categories');
            const querySnapshot = await getDocs(categoryRef);
            const categories = querySnapshot.docs.map(doc => doc.data());
            setCatgs(categories);
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault(); // Prevent form submission when adding category

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
            console.log('Category added successfully!');

            // Update the categories list, set formData to new category, and close the dialog
            setCatgs((prevCatgs) => [...prevCatgs, { name: newCategory }]);
            setFormData((prevFormData) => ({
                ...prevFormData,
                categoryname: newCategory, // Set the new category as selected
            }));
            setAddCatgs(false); // Close the dialog
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

    const handleFormSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        console.log('Form Submitted with data:', formData);
        // Handle your form submission logic here (e.g., sending to Firebase or API)
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col pt-4">
                <label htmlFor="categoryname" className="text-lg pb-5">Category Name</label>
                <div className="flex items-center gap-2">
                    <select
                        id="categoryname"
                        name="categoryname"
                        value={formData.categoryname} // Bind the value to formData.categoryname
                        onChange={handleChange}
                        className="border rounded-lg p-2 w-64"
                    >
                        {catgs.length ? catgs.map((item, index) => (
                            <option key={index} value={item.name}>{item.name}</option>
                        )) : null}
                    </select>

                    <button
                        type="button" // Prevent form submission
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
                                    type="button"
                                    onClick={() => setAddCatgs(false)} // Close dialog
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
                    )}
                </div>
            </div>

            {/* Example submit button for the form */}
            <div className="mt-4">
                <button type="submit" className="bg-green-500 text-white p-2 rounded">
                    Submit Form
                </button>
            </div>
        </form>
    );
};

export default CategoryForm;
