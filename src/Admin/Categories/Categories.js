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
  const [cWant, setCWant] = useState();
  const [operation, setOperation] = useState(1);
  
  // Use the navigate hook
  const navigate = useNavigate();
  console.log(cWant,"cw");
  
  useEffect(() => {
    const fetchCat = async () => {
      const querySnapshot = await getDocs(collection(fireDb,`${cWant}`));
      const cs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCList(cs);
    };

    fetchCat();
  }, [cWant,operation]);

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
      const categoryRef = collection(fireDb, `${cWant?cWant:'categories'}`);
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

      await addDoc(collection(fireDb, `${cWant?cWant:'categories'}`), {
        name: newCategory,
        // createdAt: formattedDateTime,
        createdAt: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
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
  console.log(cList,"cl");
  
  const handleDeleteCat = async (cWant, postId) => {
    const stringifiedId = String(postId);  // Make sure postId is a string
    const postRef = doc(fireDb, `${cWant}`, stringifiedId);

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
        <div className="flex flex-row gap-4 m-4">
          <button
            onClick={() => navigate(-1)}  
            className="bg-gray-300 p-1 rounded-md text-red-600"
          >
            &larr; Back
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              setAddCatgsDialog(true); 
            }}
            className="rounded-md bg-gray-200 p-1 flex items-center"
          >
            + Add Category
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
                  }} 
                  className="bg-gray-300 p-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCategorySubmit} 
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Add Category
                </button>
              </div>
            </div>
          )}
        </div>
          <div className='flex gap-2 pb-5'>
            <button onClick={(e)=>{setCWant('catgfordozzy')}} className={`bg-gray-300 p-2 rounded ${cWant=='catgfordozzy'?'border-4 border-blue-500':''}`}>Categories For Dozzy</button>
            <button onClick={(e)=>{setCWant('catgforldc')}} className={`bg-gray-300 p-2 rounded ${cWant=='catgforldc'?'border-4 border-blue-500':''}`} >Categories For LDC</button>
          </div>

        <table className="w-[800px]  divide-y divide-gray-200 pt-10">
          <thead>
            <tr>
              <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CreatedAt
              </th>
             
              <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delete
              </th>
              {/* <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modify
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-ce">
            {cList?.length && cList.map((category, index) => (
              <tr key={index}>
                <td className="px-5 py-3  w-25 truncate w-40 block overflow-hidden overflow-ellipsis">{category?.name}</td>
                <td className="px-5 py-3 ">
                <td className="px-5 py-3  w-25 truncate w-40 block overflow-hidden overflow-ellipsis">{category?.createdAt?.seconds}</td>
                </td>
                <td className="px-5 py-3 ">
                  <FontAwesomeIcon
                    onClick={() => handleDeleteCat(cWant,category?.id)}
                    className="text-indigo-500 cursor-pointer hover:text-indigo-700"
                    icon={faTrash}
                  />
                </td>
                {/* <td className="px-6 py-4 ">
                  <FontAwesomeIcon
                    className="text-indigo-500 cursor-pointer hover:text-indigo-700"
                    icon={faPen}
                  />
                </td> */}
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
