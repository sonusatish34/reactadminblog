import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import {
  getDocs,
  collection,
  query,
  where,
  addDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { fireDb } from "../../firebase";
import AdminLayout from "../../layouts/AdminLayout";

const CATEGORY_TABS = [
  { id: "catgfordozzy", label: "Categories For Dozzy Hyd" },
  { id: "catgfordozzybng", label: "Categories For Dozzy Bng" },
  { id: "catgforldc", label: "Categories For LDC" },
  { id: "catgfortrip", label: "Categories For Trips" },
  { id: "catgforzuget", label: "Categories For Zuget" },
  { id: "catgforcrocto", label: "Categories For Crocto" },
  { id: "catgforldcattachments", label: "Categories For LDC Attachments" },
  { id: "catgforcrocto", label: "Categories For Crorcto" },
];

function Categories() {
  const [addCatgsDialog, setAddCatgsDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [cList, setCList] = useState([]);
  const [cWant, setCWant] = useState("catgfordozzy");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch categories when selected tab changes
  useEffect(() => {
    const fetchCat = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(fireDb, cWant));
        const cs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCList(cs);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCat();
  }, [cWant]);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const formattedName = newCategory.trim().toLowerCase();

    if (!formattedName) {
      Swal.fire({
        icon: "warning",
        title: "Category name is required",
        text: "Please enter a category name.",
      });
      return;
    }

    try {
      const categoryRef = collection(fireDb, cWant);
      const q = query(categoryRef, where("name", "==", formattedName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Swal.fire({
          icon: "warning",
          title: "Category Exists",
          text: "This category already exists in the database.",
        });
        return;
      }

      const docRef = await addDoc(categoryRef, {
        name: formattedName,
        createdAt: serverTimestamp(),
      });

      // Update local state directly instead of refetching
      setCList((prev) => [
        ...prev,
        { id: docRef.id, name: formattedName, createdAt: "Just now" },
      ]);

      Swal.fire("Success", "Category added successfully!", "success");
      setAddCatgsDialog(false);
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error adding the category.",
      });
    }
  };

  const handleDeleteCat = async (catId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure you want to delete this category?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(fireDb, cWant, String(catId)));
        
        // Optimistically update state
        setCList((prev) => prev.filter((item) => item.id !== catId));
        
        Swal.fire("Deleted!", "The category has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting category:", error);
        Swal.fire("Error", "There was an issue deleting the category.", "error");
      }
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    if (typeof dateValue === "string") return dateValue;
    if (dateValue?.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
    return "N/A";
  };

  return (
    <AdminLayout
      Content={
        <div className="w-[900px] shadow-md px-4 py-2 mt-2 mb-2 rounded-lg ml-10 bg-white">
          {/* Header Controls */}
          <div className="flex flex-row gap-4 my-4 relative">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-300 px-3 py-1 rounded-md text-red-600 font-medium"
            >
              &larr; Back
            </button>

            <button
              onClick={() => setAddCatgsDialog(true)}
              className="rounded-md bg-blue-500 text-white px-3 py-1 flex items-center hover:bg-blue-600"
            >
              + Add Category
            </button>

            {/* Add Category Dialog */}
            {addCatgsDialog && (
              <div className="absolute top-10 left-0 bg-white border rounded-lg p-4 z-10 shadow-xl w-80">
                <h3 className="text-lg font-semibold mb-3">Add New Category</h3>
                <form onSubmit={handleCategorySubmit}>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                    className="border rounded-lg p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAddCatgsDialog(false)}
                      className="bg-gray-300 px-3 py-1.5 rounded text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pb-5">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCWant(tab.id)}
                className={`p-2 rounded text-sm transition-all ${
                  cWant === tab.id
                    ? "bg-blue-500 text-white font-medium"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <table className="w-full divide-y divide-gray-200 border-2">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : cList.length > 0 ? (
                cList.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-3 text-sm text-gray-900 truncate max-w-xs">
                      {category.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {formatDate(category.createdAt)}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteCat(category.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Category"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      }
    />
  );
}

export default Categories;