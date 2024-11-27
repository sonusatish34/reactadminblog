import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Loading from '../../layouts/Loading';
import Domain from '../../Api/Api';
import { AuthToken } from '../../Api/Api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { Timestamp, getDocs, collection, query, where, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { fireDb } from "../../firebase";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Categories() {
  const [addCatgsDialog, setAddCatgsDialog] = useState(false);
  const [newCategory, setNewCategory] = useState(''); // Stores the new category name
  const [cList, setCList] = useState();
  const [operation, setOperation] = useState(1);
  
  // Use the navigate hook
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCat = async () => {
      const querySnapshot = await getDocs(collection(fireDb, "categories"));
      const cs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCList(cs);
    };

    fetchCat();
  }, [operation]);

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
      setOperation(operation + 1);
      setAddCatgsDialog(false); // Close the dialog
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

  const handleDeleteCat = async (postId) => {
    const stringifiedId = String(postId);  // Make sure postId is a string
    const postRef = doc(fireDb, "categories", stringifiedId);

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure you want to delete this post?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(postRef);
          setOperation(operation + 1);
          Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
        } catch (error) {
          Swal.fire('Error', 'There was an issue deleting the post.', 'error');
          console.error("Error deleting post:", error);
        }
      }
    });
  };

  const CategoriesContent = (
    <>
      <div
        style={{ width: '900px' }}
        className="shadow-md px-1 space-x-8 mt-2 pt-2 pb-2 mb-2 justify-center gap-9 rounded-lg ml-10 bg-white"
      >
        <div className="flex flex-row m-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}  // Navigates to the previous page
            className="bg-gray-300 p-2 rounded-md text-gray-800"
          >
            &larr; Back
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              setAddCatgsDialog(true); // Open dialog
            }}
            className="rounded-md bg-gray-200 p-1 flex items-center"
          >
            + Add
          </button>

          {addCatgsDialog && (
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
                    setAddCatgsDialog(false);
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
          )}
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delete
              </th>
              <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modify
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cList?.length && cList.map((category, index) => (
              <tr key={index}>
                <td className="px-5 py-3  w-25 truncate w-40 block overflow-hidden overflow-ellipsis">{category?.name}</td>
                <td className="px-5 py-3 max-w-sm truncate  ">{category?.id}</td>
                <td className="px-5 py-3 ">
                  <FontAwesomeIcon
                    onClick={() => handleDeleteCat(category?.id)}
                    className="text-indigo-500 cursor-pointer hover:text-indigo-700"
                    icon={faTrash}
                  />
                </td>
                <td className="px-6 py-4 ">
                  <FontAwesomeIcon
                    className="text-indigo-500 cursor-pointer hover:text-indigo-700"
                    icon={faPen}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return <AdminLayout Content={CategoriesContent} />;
}

export default Categories;
