import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft,
  faEye,
  faTrash,
  faArrowLeft,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { fireDb } from "../../firebase";
import AdminLayout from "../../layouts/AdminLayout";
import Loading from "../../layouts/Loading";

const DeletedPosts = () => {
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // Fetch deleted posts from Firestore
  useEffect(() => {
    const fetchDeletedPosts = async () => {
      try {
        const q = query(
          collection(fireDb, "blogPost"),
          where("blog_state", "==", "deleted"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeletedPosts(posts);
      } catch (error) {
        console.error("Error fetching deleted posts:", error);
        Swal.fire("Error", "Failed to fetch archived posts.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedPosts();
  }, []);

  // Restore Post Handler
  const handleRestore = async (postId) => {
    const postRef = doc(fireDb, "blogPost", postId);

    const result = await Swal.fire({
      title: "Restore Post?",
      text: "This post will be moved back to the active directory.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Restore Post",
      confirmButtonColor: "#10b981",
      cancelButtonText: "Cancel",
      customClass: { confirmButton: "rounded-md", cancelButton: "rounded-md" },
    });

    if (result.isConfirmed) {
      try {
        await updateDoc(postRef, { blog_state: "active" });
        setDeletedPosts((prev) => prev.filter((post) => post.id !== postId));
        Swal.fire("Restored!", "The post has been restored.", "success");
      } catch (error) {
        console.error("Error restoring post:", error);
        Swal.fire("Error", "There was an issue restoring the post.", "error");
      }
    }
  };

  // Permanent Delete Handler
  const handlePermanentDelete = async (postId) => {
    const postRef = doc(fireDb, "blogPost", postId);

    const result = await Swal.fire({
      title: "Permanently Delete?",
      text: "This action cannot be undone. All post data will be lost forever.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete Permanently",
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancel",
      customClass: { confirmButton: "rounded-md", cancelButton: "rounded-md" },
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(postRef);
        setDeletedPosts((prev) => prev.filter((post) => post.id !== postId));
        Swal.fire("Deleted!", "The post was permanently removed.", "success");
      } catch (error) {
        console.error("Error permanently deleting post:", error);
        Swal.fire("Error", "There was an issue deleting the post.", "error");
      }
    }
  };

  // Search Filter
  const filteredPosts = useMemo(() => {
    return deletedPosts.filter((post) =>
      post?.title?.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [deletedPosts, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBoxArchive} className="text-gray-500" />
                    Trash & Archive
                  </h1>
                </div>
              </div>

              {/* Search Control */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search archived posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-3 text-gray-400 text-xs"
                />
              </div>
            </div>

            {/* Content Table Card */}
            {filteredPosts.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-4 w-1/4">Title</th>
                        <th className="px-6 py-4 w-1/3">Description</th>
                        <th className="px-6 py-4">Platform</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {paginatedPosts.map((post) => (
                        <tr
                          key={post.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          {/* Title */}
                          <td className="px-6 py-4 font-medium text-gray-900">
                            <p className="line-clamp-2" title={post.title}>
                              {post.title}
                            </p>
                          </td>

                          {/* Description */}
                          <td className="px-6 py-4 text-gray-500">
                            <p className="line-clamp-2 text-xs">
                              {post.description || "No description provided."}
                            </p>
                          </td>

                          {/* Platform */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {post.blogfor || "General"}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4 text-xs text-gray-600">
                            {Array.isArray(post.categoryname)
                              ? post.categoryname.join(", ")
                              : post.categoryname || "—"}
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                            {post.date || "N/A"}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Restore */}
                              <button
                                onClick={() => handleRestore(post.id)}
                                title="Restore Post"
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <FontAwesomeIcon icon={faRotateLeft} />
                              </button>

                              {/* View */}
                              <Link
                                to={`/Admin/Posts/${post.id}`}
                                title="View Preview"
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Link>

                              {/* Delete Permanently */}
                              <button
                                onClick={() => handlePermanentDelete(post.id)}
                                title="Delete Permanently"
                                className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <FontAwesomeIcon icon={faBoxArchive} className="text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Trash is Empty
                </h3>
                <p className="text-sm text-gray-500">
                  There are currently no deleted posts in the archive.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-2">
                <span className="text-xs text-gray-500">
                  Showing page <strong className="text-gray-800">{currentPage}</strong>{" "}
                  of <strong className="text-gray-800">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />{" "}
                    Previous
                  </button>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default DeletedPosts;